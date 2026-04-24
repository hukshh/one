
import { aiService } from './services/ai.service';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
  console.log('🔍 Debugging Transcription...');
  
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.error('❌ Uploads directory not found');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  if (files.length === 0) {
    console.error('❌ No files found in uploads directory');
    return;
  }

  const latestFile = files.sort((a, b) => {
    return fs.statSync(path.join(uploadsDir, b)).mtime.getTime() - 
           fs.statSync(path.join(uploadsDir, a)).mtime.getTime();
  })[0];

  const fileUrl = `http://localhost:4000/uploads/${latestFile}`;
  console.log(`Testing with file: ${latestFile}`);

  try {
    const segments = await aiService.transcribe(fileUrl);
    console.log('✅ Success! First segment:', segments[0]);
  } catch (error) {
    console.error('❌ Transcription Failed:');
    console.error(error);
  }
}

debug();
