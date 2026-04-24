
const { meetingRepository } = require('./dist/repositories/meeting.repository');
const { AIService } = require('./dist/services/ai.service');
const { MeetingStatus } = require('@prisma/client');
const path = require('path');
require('dotenv').config();

async function testFullPipeline() {
  const aiService = new AIService();
  
  // 1. Find a failed meeting to retry or just pick the latest one
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const meeting = await prisma.meeting.findFirst({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' }
  });

  if (!meeting) {
    console.error('No failed meeting found to test.');
    return;
  }

  const meetingId = meeting.id;
  const fileUrl = meeting.videoUrl;

  console.log(`🎬 Retrying meeting: ${meetingId} | File: ${fileUrl}`);

  try {
    // Step 1: Transcribe
    console.log('🔄 Step 1: Transcribing...');
    const segments = await aiService.transcribe(fileUrl);
    console.log(`✅ Transcription complete. Segments: ${segments.length}`);
    console.log('First segment sample:', segments[0]);

    // Step 2: Extract Intelligence
    console.log('🔄 Step 2: Extracting Intelligence...');
    const transcript = segments.map(s => s.content).join(' ');
    console.log('Transcript length:', transcript.length);
    
    console.log('Calling normalizeTranscript...');
    const cleanTranscript = await aiService.normalizeTranscript(transcript);
    console.log('✅ Normalize complete.');

    console.log('Calling extractFromChunk...');
    const intelligence = await aiService.extractFromChunk(cleanTranscript);
    console.log('✅ Extraction complete.');

    console.log('Calling synthesize...');
    const finalIntelligence = await aiService.synthesize([intelligence]);
    console.log('✅ Synthesis complete.');

    // Step 3: Save
    console.log('🔄 Step 3: Saving results...');
    await meetingRepository.saveIntelligence(meetingId, finalIntelligence);
    await meetingRepository.updateStatus(meetingId, MeetingStatus.PROCESSED);
    console.log('🎉 SUCCESS!');
  } catch (error) {
    console.error('❌ PIPELINE FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullPipeline();
