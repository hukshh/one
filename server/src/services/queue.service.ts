import { Queue } from 'bullmq';
import { redisOptions, isRedisConnected } from '../config/redis';
import { ProcessingService } from './processing.service';

export const MEETING_QUEUE_NAME = 'meeting-processing';

export const meetingQueue = new Queue(MEETING_QUEUE_NAME, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export class QueueService {
  static async addMeetingJob(meetingId: string, fileUrl: string, storageKey?: string) {
    if (isRedisConnected && meetingQueue) {
      console.log(`[Redis] Queuing meeting: ${meetingId}`);
      return meetingQueue.add('process-meeting', { meetingId, fileUrl, storageKey });
    } else {
      console.log(`[Fallback] Redis unavailable — processing in-process: ${meetingId}`);
      ProcessingService.process(meetingId, fileUrl, storageKey).catch(err => {
        console.error(`❌ [Fallback Error] Failed to process ${meetingId}:`, err.message);
      });
      return { id: 'fallback-' + Date.now() };
    }
  }
}
