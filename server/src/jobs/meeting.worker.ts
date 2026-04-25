import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { MEETING_QUEUE_NAME } from '../services/queue.service';
import { ProcessingService } from '../services/processing.service';

export let meetingWorker: Worker | null = null;

if (redisConnection) {
  meetingWorker = new Worker(
    MEETING_QUEUE_NAME,
    async (job: Job) => {
      const { meetingId, fileUrl, storageKey } = job.data;
      await ProcessingService.process(meetingId, fileUrl, storageKey, job.id);
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );

  meetingWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
  });

  meetingWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
  });
} else {
  console.log('[BullMQ] Redis unavailable. Background workers skipped.');
}
