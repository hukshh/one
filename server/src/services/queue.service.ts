import { Queue } from 'bullmq';
import { redisConnection, isRedisConnected } from '../config/redis';
import { ProcessingService } from './processing.service';

export const MEETING_QUEUE_NAME = 'meeting-processing';

// Initialize queue only if Redis is potentially available
export const meetingQueue = redisConnection ? new Queue(MEETING_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
}) : null;

export class QueueService {
  static async addMeetingJob(meetingId: string, fileUrl: string) {
    if (isRedisConnected && meetingQueue) {
      console.log(`📡 [Redis] Queuing meeting: ${meetingId}`);
      return meetingQueue.add('process-meeting', { meetingId, fileUrl });
    } else {
      console.log(`⚠️ [Fallback] Redis unavailable. Processing meeting in-process: ${meetingId}`);
      // Fallback: Run in background without blocking the main thread, 
      // mimicking the queue behavior but without persistence.
      ProcessingService.process(meetingId, fileUrl).catch(err => {
        console.error(`❌ [Fallback Error] Failed to process ${meetingId}:`, err.message);
      });
      return { id: 'fallback-' + Date.now() };
    }
  }
}
