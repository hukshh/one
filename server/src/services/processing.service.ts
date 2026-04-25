import { meetingRepository } from '../repositories/meeting.repository';
import { aiService } from '../services/ai.service';
import { EmailService } from '../services/email.service';
import { MeetingStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ProcessingService {
  static async process(meetingId: string, fileUrl: string, jobId?: string) {
    const context = jobId ? `[Job ${jobId}]` : `[Local]`;
    console.log(`🎬 ${context} Starting process for meeting: ${meetingId}`);

    try {
      // 1. Transcribe
      console.log(`🔄 [${meetingId}] Step 1: Transcribing audio...`);
      await meetingRepository.updateStatus(meetingId, MeetingStatus.TRANSCRIBING);
      const segments = await aiService.transcribe(fileUrl);
      
      if (!segments || segments.length === 0) {
        throw new Error('Transcription failed: No segments returned');
      }

      console.log(`✅ [${meetingId}] Transcribed ${segments.length} segments. Saving...`);
      await meetingRepository.saveTranscript(meetingId, segments);
      
      const lastSegment = segments[segments.length - 1];
      const durationSeconds = lastSegment.endTime || 0;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      await meetingRepository.update(meetingId, { duration: durationMinutes });
      
      await meetingRepository.updateStatus(meetingId, MeetingStatus.TRANSCRIBED);
      
      await sleep(2000); 

      // 2. Extract Intelligence
      console.log(`🔄 [${meetingId}] Step 2: Extracting Intelligence...`);
      await meetingRepository.updateStatus(meetingId, MeetingStatus.EXTRACTING);
      
      const transcript = segments.map(s => s.content).join(' ');
      
      console.log(`🤖 [${meetingId}] Normalizing transcript...`);
      const cleanTranscript = await aiService.normalizeTranscript(transcript);
      await sleep(2000); 
      
      console.log(`🤖 [${meetingId}] Extracting structured data...`);
      const intelligence = await aiService.extractFromChunk(cleanTranscript);
      await sleep(2000); 
      
      console.log(`🤖 [${meetingId}] Synthesizing final report...`);
      const finalIntelligence = await aiService.synthesize([intelligence]);
      console.log(`✅ [${meetingId}] Intelligence extraction complete.`);

      // 3. Save
      console.log(`🔄 [${meetingId}] Step 3: Saving final report...`);
      await meetingRepository.saveIntelligence(meetingId, finalIntelligence);
      await meetingRepository.updateStatus(meetingId, MeetingStatus.PROCESSED);

      // 4. Notify
      try {
        const fullMeeting = await meetingRepository.findById(meetingId);
        // @ts-ignore
        if (fullMeeting && fullMeeting.creator?.email) {
          console.log(`📧 [${meetingId}] Sending summary email to: ${fullMeeting.creator.email}`);
          await EmailService.sendMeetingSummary(
            // @ts-ignore
            fullMeeting.creator.email,
            fullMeeting.title,
            finalIntelligence.summary_short,
            meetingId
          );
        }
      } catch (notifyError) {
        console.error(`⚠️ [${meetingId}] Notification failed:`, notifyError);
      }

      console.log(`🎉 [${meetingId}] SUCCESS: Meeting processed completely.`);
    } catch (error: any) {
      console.error(`❌ ${context} ERROR:`, error.message);
      
      await meetingRepository.updateStatus(meetingId, MeetingStatus.FAILED);
      
      const errorLog = `[${new Date().toISOString()}] Meeting: ${meetingId} | Error: ${error.message}\n${error.stack}\n\n`;
      fs.appendFileSync(path.join(process.cwd(), 'error.log'), errorLog);
      
      throw error; 
    }
  }
}
