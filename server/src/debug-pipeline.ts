
const { meetingRepository } = require('./repositories/meeting.repository');
const { AIService } = require('./services/ai.service');
const { MeetingStatus, PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testFullPipeline() {
  const aiService = new AIService();
  const prisma = new PrismaClient();
  
  try {
    const meeting = await prisma.meeting.findFirst({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' }
    });

    if (!meeting) {
      console.error('No failed meeting found.');
      return;
    }

    console.log(`🎬 Retrying: ${meeting.id}`);
    const segments = await aiService.transcribe(meeting.videoUrl);
    console.log(`✅ Transcription: ${segments.length} segments`);

    const transcript = segments.map(s => s.content).join(' ');
    console.log('Transcript sample:', transcript.substring(0, 100));

    const cleanTranscript = await aiService.normalizeTranscript(transcript);
    console.log('✅ Normalize');

    const intelligence = await aiService.extractFromChunk(cleanTranscript);
    console.log('✅ Extract');

    const finalIntelligence = await aiService.synthesize([intelligence]);
    console.log('✅ Synthesis');

    await meetingRepository.saveIntelligence(meeting.id, finalIntelligence);
    await meetingRepository.updateStatus(meeting.id, MeetingStatus.PROCESSED);
    console.log('🎉 SUCCESS!');
  } catch (err) {
    console.error('❌ FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testFullPipeline();
