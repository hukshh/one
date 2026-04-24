import { Request, Response } from 'express';
import { meetingRepository } from '../repositories/meeting.repository';
import { aiService } from '../services/ai.service';
import { MeetingStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs';

export class MeetingController {
  upload = async (req: Request, res: Response) => {
    try {
      const { title, workspaceId, creatorId } = req.body;
      let fileUrl = req.body.fileUrl;

      // If a file was uploaded via multer
      if (req.file) {
        const baseUrl = process.env.APP_URL || 'http://localhost:4000';
        fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
      }

      if (!title || !workspaceId || !creatorId || !fileUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const meeting = await meetingRepository.create({
        title,
        workspaceId,
        creatorId,
        videoUrl: fileUrl,
      });

      // Add to background processing queue
      const { QueueService } = await import('../services/queue.service');
      await QueueService.addMeetingJob(meeting.id, fileUrl);

      res.status(201).json({
        message: 'Meeting uploaded and processing queued',
        meetingId: meeting.id,
      });
    } catch (error) {
      console.error('Upload error details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const meeting = await meetingRepository.findById(id);

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      res.json(meeting);
    } catch (error) {
      console.error('Get meeting error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  list = async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.headers['x-workspace-id'] as string) || "69ea5c6ced5550131e0e66db";
      console.log(`🔍 Fetching meetings for workspace: ${workspaceId}`);
      const meetings = await meetingRepository.findByWorkspaceId(workspaceId);
      res.json(meetings || []);
    } catch (error: any) {
      console.error('❌ List meetings error:', error.message);
      res.status(500).json({ error: 'Database connection error', details: error.message });
    }
  }
}

export const meetingController = new MeetingController();
