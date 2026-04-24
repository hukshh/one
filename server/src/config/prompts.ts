export const PROMPTS = {
  NORMALIZATION: `
    You are a professional transcript editor. Clean the following transcript by:
    1. Correcting obvious phonetic misspellings of technical terms.
    2. Removing filler words (um, uh, like) while preserving meaning.
    3. Ensuring speaker labels are consistent.
    4. Normalizing the flow without changing the original intent or specific facts.
    
    TRANSCRIPT:
    {{transcript}}
  `,
  
  EXTRACTION: `
    You are an expert meeting analyst. Extract structured intelligence from this meeting segment.
    
    Return ONLY a JSON object with this exact schema:
    {
      "summary_detailed": "A 2-3 paragraph detailed summary of this segment.",
      "key_points": ["point 1", "point 2"],
      "action_items": [
        {
          "task": "description",
          "owner": "name or unknown",
          "priority": "low|medium|high",
          "deadline": "ISO date or null"
        }
      ],
      "decisions": ["decision 1", "decision 2"],
      "risks": [
        {
          "risk": "description",
          "severity": "low|medium|high"
        }
      ]
    }
    
    TRANSCRIPT SEGMENT:
    {{segment}}
  `,
  
  SYNTHESIS: `
    You are a principal meeting intelligence system. Merge the following extracted summaries and items into one cohesive final report.
    Eliminate duplicates, resolve speaker references, and ensure a professional tone.
    
    DATA TO MERGE:
    {{data}}
    
    FINAL SCHEMA:
    {
      "summary_short": "1 sentence overview",
      "summary_detailed": "Comprehensive multi-paragraph summary",
      "action_items": [...],
      "decisions": [...],
      "risks": [...]
    }
  `,
  
  REPAIR: `
    The previous JSON output was malformed: {{error}}.
    Fix the JSON below to match the required schema perfectly.
    
    MALFORMED JSON:
    {{json}}
  `
};
