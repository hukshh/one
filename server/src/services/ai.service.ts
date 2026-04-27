import { PROMPTS } from '../config/prompts';
import { ZodSchema, z } from 'zod';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export interface MeetingIntelligence {
  summary_short: string;
  summary_detailed: string;
  action_items: Array<{
    task: string;
    owner?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    deadline?: string;
  }>;
  decisions: string[];
  risks: Array<{
    risk: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    // Using Groq as the primary provider for FREE processing
    this.openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1", // Groq is OpenAI-compatible!
      timeout: 30000, // 30 seconds timeout
    });
  }

  async normalizeTranscript(rawTranscript: string): Promise<string> {
    const prompt = PROMPTS.NORMALIZATION.replace('{{transcript}}', rawTranscript);
    return this.callLLM(prompt);
  }

  async extractFromChunk(chunk: string): Promise<any> {
    const prompt = PROMPTS.EXTRACTION.replace('{{segment}}', chunk);
    const response = await this.callLLM(prompt, true);
    return this.validateAndRepair(response, this.chunkSchema);
  }

  async synthesize(data: any[]): Promise<MeetingIntelligence> {
    const prompt = PROMPTS.SYNTHESIS.replace('{{data}}', JSON.stringify(data));
    const response = await this.callLLM(prompt, true);
    return this.validateAndRepair(response, this.finalSchema);
  }

  private async callLLM(prompt: string, isJson: boolean = false): Promise<any> {
    console.log(`Calling Groq [${isJson ? 'JSON' : 'Text'}]...`);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `You are an expert meeting analyst. You handle multilingual transcripts (English, Hindi, Hinglish) with precision.
            If JSON is requested, return ONLY raw JSON. If Text is requested, return clean, professional prose without any JSON structure.` 
          },
          { role: "user", content: prompt }
        ],
        response_format: isJson ? { type: "json_object" } : { type: "text" },
      });

      let content = response.choices[0].message.content || '{}';
      
      if (isJson) {
        // Clean markdown JSON markers if present
        content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error('JSON Parse Error. Content was:', content);
          throw parseError;
        }
      }
      
      return content;
    } catch (error: any) {
      console.error('Groq LLM Error:', error.message);
      throw new Error('Failed to process intelligence via AI');
    }
  }

  private async validateAndRepair(data: any, schema: ZodSchema): Promise<any> {
    try {
      return schema.parse(data);
    } catch (error: any) {
      console.warn('AI Response validation failed, using defaults where missing:', error.message);
      // Fallback: If AI fails to give us something, we provide a safe structure
      return {
        summary_short: data.summary_short || "Brief meeting recorded.",
        summary_detailed: data.summary_detailed || "Detailed summary pending or insufficient data.",
        action_items: Array.isArray(data.action_items) ? data.action_items : [],
        decisions: Array.isArray(data.decisions) ? data.decisions : [],
        risks: Array.isArray(data.risks) ? data.risks : []
      };
    }
  }

  async transcribe(fileUrl: string): Promise<any[]> {
    console.log(`Transcribing audio from: ${fileUrl}...`);
    
    try {
      let fileStream: any;
      let filename = 'meeting.mp4';
      const baseUrl = process.env.APP_URL || 'http://localhost:4000';

      if (fileUrl.startsWith(`${baseUrl}/uploads/`)) {
        // Optimization: Use local file system if it's a local upload
        const localFilename = fileUrl.split('/').pop()!;
        const localPath = path.join(process.cwd(), 'uploads', localFilename);
        console.log(`Using local file stream: ${localPath}`);
        
        if (!fs.existsSync(localPath)) {
          throw new Error(`File not found at ${localPath}`);
        }
        
        fileStream = fs.createReadStream(localPath);
        filename = localFilename;
      } else {
        // Fallback for remote URLs
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Failed to fetch remote file: ${response.statusText}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        fileStream = await OpenAI.toFile(buffer, path.basename(fileUrl) || 'meeting.mp4');
      }
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-large-v3', // Groq's high-speed whisper model
        response_format: 'verbose_json',
      });

      const data = transcription as any;
      const segments = data.segments || [{
        start: 0,
        end: data.duration || 0,
        text: data.text || ''
      }];

      return segments.map((s: any) => ({
        startTime: Number(s.start) || 0,
        endTime: Number(s.end) || 0,
        content: s.text || '',
        speakerLabel: 'Speaker',
        confidence: s.confidence || 0.9,
      }));
    } catch (error: any) {
      console.error('Whisper API Error Details:', error?.response?.data || error.message || error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  private chunkSchema = z.object({
    summary_detailed: z.string(),
    key_points: z.array(z.string()),
    action_items: z.array(z.object({
      task: z.string(),
      owner: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'LOW', 'MEDIUM', 'HIGH']).transform(v => v.toUpperCase()),
      deadline: z.string().optional().nullable(),
      confidence: z.number().optional().default(0.9)
    })),
    decisions: z.array(z.object({
      content: z.string(),
      confidence: z.number().optional().default(0.9)
    })),
    risks: z.array(z.object({
      risk: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'LOW', 'MEDIUM', 'HIGH']).transform(v => v.toUpperCase()),
      confidence: z.number().optional().default(0.9)
    }))
  });

  private finalSchema = z.object({
    summary_short: z.string(),
    summary_detailed: z.string(),
    action_items: z.array(z.object({
      task: z.string(),
      owner: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      deadline: z.string().optional(),
      confidence: z.number().optional().default(0.9)
    })),
    decisions: z.array(z.object({
      content: z.string(),
      confidence: z.number().optional().default(0.9)
    })),
    risks: z.array(z.object({
      risk: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      confidence: z.number().optional().default(0.9)
    }))
  });

  async ask(transcript: string, question: string, context?: any): Promise<string> {
    const prompt = `You are the MeetingMind AI Assistant. Your task is to provide a helpful, professional, and clear answer to the user's question based on the provided meeting context and transcript.
    
    MEETING INTELLIGENCE CONTEXT:
    - Summary: ${context?.summary || 'N/A'}
    - Key Action Items: ${context?.actionItems?.join(', ') || 'N/A'}
    - Key Decisions: ${context?.decisions?.join(', ') || 'N/A'}

    TRANSCRIPT CONTEXT:
    - The transcript may contain a mix of English, Hindi, and Hinglish. 
    - Please understand the context carefully regardless of the language used.
    
    TRANSCRIPT:
    ${transcript}
    
    USER QUESTION:
    ${question}`;

    return this.callLLM(prompt, false);
  }
}

export const aiService = new AIService();
