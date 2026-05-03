import dotenv from 'dotenv';
dotenv.config();

import { Worker, Job } from 'bullmq';
import { redisOptions } from '../config/redis';
import { MEETING_QUEUE_NAME } from '../services/queue.service';
import { ProcessingService } from '../services/processing.service';

export const meetingWorker = new Worker(
  MEETING_QUEUE_NAME,
  async (job: Job) => {
    const { meetingId, fileUrl, storageKey } = job.data;
    await ProcessingService.process(meetingId, fileUrl, storageKey, job.id);
  },
  {
    connection: redisOptions as any,
    concurrency: 2,
  }
);

meetingWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

meetingWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

console.log('🚀 MeetingMind Worker started and listening for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await meetingWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await meetingWorker.close();
  process.exit(0);
});
