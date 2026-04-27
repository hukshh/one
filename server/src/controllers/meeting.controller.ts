import { Request, Response } from 'express';
import { meetingRepository } from '../repositories/meeting.repository';
import { aiService } from '../services/ai.service';
import { ExportService } from '../services/export.service';
import { MeetingStatus } from '@prisma/client';
import path from 'path';
import fs from 'fs';

export class MeetingController {
  upload = async (req: Request, res: Response) => {
    try {
      const { title, workspaceId, creatorId } = req.body;
      let fileUrl = req.body.fileUrl;
      let storageKey: string | undefined;

      // If a file was uploaded via multer
      if (req.file) {
        const baseUrl = process.env.APP_URL || 'http://localhost:4000';
        fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        // Attempt S3 upload if configured
        const { StorageService } = await import('../services/storage.service');
        if (StorageService.isConfigured()) {
          try {
            console.log(`☁️ Uploading ${req.file.filename} to S3...`);
            storageKey = await StorageService.uploadFile(req.file.path, req.file.filename);
            console.log(`Uploaded to S3: ${storageKey}`);
            
            // Optionally delete local file after S3 upload
            // fs.unlinkSync(req.file.path); 
          } catch (s3Error) {
            console.error('S3 Upload failed, falling back to local storage:', s3Error);
          }
        }
      }

      if (!title || !workspaceId || !creatorId || !fileUrl) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const meeting = await meetingRepository.create({
        title,
        workspaceId,
        creatorId,
        videoUrl: fileUrl,
        storageKey,
      });

      // Add to background processing queue
      const { QueueService } = await import('../services/queue.service');
      await QueueService.addMeetingJob(meeting.id, fileUrl, storageKey);

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
      const meeting: any = await meetingRepository.findById(id);

      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      // If meeting has a storage key, generate a presigned URL
      if (meeting.storageKey) {
        const { StorageService } = await import('../services/storage.service');
        try {
          meeting.videoUrl = await StorageService.getPresignedUrl(meeting.storageKey);
        } catch (s3Error) {
          console.error('❌ Failed to generate presigned URL:', s3Error);
        }
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
      const { q } = req.query;

      if (q && typeof q === 'string') {
        const meetings = await meetingRepository.search(workspaceId, q);
        return res.json(meetings || []);
      }

      console.log(`Fetching meetings for workspace: ${workspaceId}`);
      const meetings = await meetingRepository.findByWorkspaceId(workspaceId);
      res.json(meetings || []);
    } catch (error: any) {
      console.error('❌ List meetings error:', error.message);
      res.status(500).json({ error: 'Database connection error', details: error.message });
    }
  }

  exportPdf = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pdfBuffer = await ExportService.generateMeetingPDF(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=MeetingReport-${id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Export PDF error:', error.message);
      res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
  }

  chat = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message) return res.status(400).json({ error: 'Message required' });

      const meeting = await meetingRepository.findById(id);
      if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

      const fullTranscript = meeting.transcript
        .map(s => `[${new Date(s.startTime * 1000).toISOString().substr(14, 5)}] ${s.speakerLabel || 'Speaker'}: ${s.content}`)
        .join('\n');

      const context = {
        summary: meeting.summary?.detailed,
        actionItems: meeting.actionItems?.map((a: any) => a.task),
        decisions: meeting.decisions?.map((d: any) => d.content),
      };

      const answer = await aiService.ask(fullTranscript, message, context);
      res.json({ answer });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  updateActionItem = async (req: Request, res: Response) => {
    try {
      const { actionItemId } = req.params;
      const { status } = req.body;
      const updated = await meetingRepository.updateActionItem(actionItemId, status);
      res.json(updated);
    } catch (error) {
      console.error('Update action item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const meetingController = new MeetingController();
