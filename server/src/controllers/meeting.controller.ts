// @ts-nocheck
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

      // If a file was uploaded via multer, store it in MongoDB GridFS
      if (req.file) {
        try {
          const { StorageService } = await import('../services/storage.service');
          console.log(`☁️ Uploading ${req.file.filename} to MongoDB GridFS...`);
          storageKey = await StorageService.uploadFile(req.file.path, req.file.filename);
          console.log(`✅ Stored in GridFS with key: ${storageKey}`);

          // Build a stable internal reference URL (used as fallback)
          const baseUrl = process.env.APP_URL || 'http://localhost:4000';
          fileUrl = `${baseUrl}/api/meetings/file/${storageKey}`;

          // Clean up local temp file after GridFS upload
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (gridfsError: any) {
          console.error('GridFS upload failed:', gridfsError.message);
          return res.status(500).json({ error: 'File storage failed' });
        }
      }

      if (!title || !workspaceId || !creatorId || !fileUrl) {
        return res.status(400).json({ error: 'Missing required fields: title, workspaceId, creatorId, and a file or fileUrl' });
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

      // If meeting has a GridFS storageKey, expose a direct download URL
      if (meeting.storageKey) {
        const baseUrl = process.env.APP_URL || 'http://localhost:4000';
        meeting.videoUrl = `${baseUrl}/api/meetings/file/${meeting.storageKey}`;
      }

      res.json(meeting);
    } catch (error) {
      console.error('Get meeting error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  serveFile = async (req: Request, res: Response) => {
    try {
      const { storageKey } = req.params;
      const { StorageService } = await import('../services/storage.service');
      const filename = await StorageService.getFilename(storageKey);
      const stream = await StorageService.getDownloadStream(storageKey);

      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      stream.pipe(res);
    } catch (error: any) {
      console.error('File serve error:', error.message);
      res.status(404).json({ error: 'File not found' });
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
