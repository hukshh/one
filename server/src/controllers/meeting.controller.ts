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

      // Process meeting in background without Redis queue
      this.processMeetingInBackground(meeting.id, fileUrl);

      res.status(201).json({
        message: 'Meeting uploaded and processing started',
        meetingId: meeting.id,
      });
    } catch (error) {
      console.error('Upload error details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Simplified background processing without Redis
  private async processMeetingInBackground(meetingId: string, fileUrl: string) {
    const logFile = path.join(process.cwd(), 'error.log');
    fs.appendFileSync(logFile, `🎬 [${new Date().toISOString()}] Starting process for ${meetingId}\n`);
    
    console.log(`🎬 [${meetingId}] Starting background processing...`);
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {

      // 1. Transcribe
      console.log(`🔄 [${meetingId}] Step 1: Transcribing audio...`);
      await meetingRepository.updateStatus(meetingId, MeetingStatus.TRANSCRIBING);
      const segments = await aiService.transcribe(fileUrl);
      
      if (!segments || segments.length === 0) {
        throw new Error('Transcription failed: No segments returned');
      }

      console.log(`✅ [${meetingId}] Transcribed ${segments.length} segments. Saving...`);
      await meetingRepository.saveTranscript(meetingId, segments);
      
      const lastSegment = segments[segments.length - 1];
      const durationSeconds = lastSegment.endTime || 0;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      await meetingRepository.update(meetingId, { duration: durationMinutes });
      
      await meetingRepository.updateStatus(meetingId, MeetingStatus.TRANSCRIBED);
      
      await sleep(2000); // Give Groq a break

      // 2. Extract Intelligence
      console.log(`🔄 [${meetingId}] Step 2: Extracting Intelligence...`);
      await meetingRepository.updateStatus(meetingId, MeetingStatus.EXTRACTING);
      
      const transcript = segments.map(s => s.content).join(' ');
      
      console.log(`🤖 [${meetingId}] Normalizing transcript...`);
      const cleanTranscript = await aiService.normalizeTranscript(transcript);
      await sleep(2000); // Give Groq a break
      
      console.log(`🤖 [${meetingId}] Extracting structured data...`);
      const intelligence = await aiService.extractFromChunk(cleanTranscript);
      await sleep(2000); // Give Groq a break
      
      console.log(`🤖 [${meetingId}] Synthesizing final report...`);
      const finalIntelligence = await aiService.synthesize([intelligence]);
      console.log(`✅ [${meetingId}] Intelligence extraction complete.`);

      // 3. Save
      console.log(`🔄 [${meetingId}] Step 3: Saving final report...`);
      await meetingRepository.saveIntelligence(meetingId, finalIntelligence);
      await meetingRepository.updateStatus(meetingId, MeetingStatus.PROCESSED);

      console.log(`🎉 [${meetingId}] SUCCESS: Meeting processed completely.`);
    } catch (error: any) {
      console.error(`❌ [${meetingId}] PIPELINE ERROR:`, error.message);
      
      // Write error to a local file for debugging
      const errorLog = `[${new Date().toISOString()}] Meeting: ${meetingId} | Error: ${error.message}\n${error.stack}\n\n`;
      fs.appendFileSync(path.join(process.cwd(), 'error.log'), errorLog);

      try {
        const { MeetingStatus } = await import('@prisma/client');
        await meetingRepository.updateStatus(meetingId, MeetingStatus.FAILED);
      } catch (dbError) {
        console.error(`[${meetingId}] Failed to set status to FAILED:`, dbError);
      }
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
