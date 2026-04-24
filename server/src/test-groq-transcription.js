
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function testTranscription() {
  console.log('🧪 Testing Groq Transcription...');
  
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  if (files.length === 0) {
    console.error('❌ No files to test with.');
    return;
  }
  
  const latestFile = files.sort((a, b) => {
    return fs.statSync(path.join(uploadsDir, b)).mtime.getTime() - 
           fs.statSync(path.join(uploadsDir, a)).mtime.getTime();
  })[0];

  const filePath = path.join(uploadsDir, latestFile);
  console.log(`Using file: ${latestFile}`);

  try {
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
    });
    console.log('✅ Transcription success!');
    console.log('Segments found:', transcription.segments ? transcription.segments.length : 'none');
    if (transcription.segments) {
        console.log('First segment text:', transcription.segments[0].text);
    } else {
        console.log('Full transcription object keys:', Object.keys(transcription));
    }
  } catch (error) {
    console.error('❌ Groq Transcription Error:');
    console.error(error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
  }
}

testTranscription();
