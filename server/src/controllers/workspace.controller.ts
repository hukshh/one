import { Request, Response } from 'express';
import { workspaceRepository } from '../repositories/workspace.repository';
import prisma from '../lib/prisma';
import { EmailService } from '../services/email.service';

export class WorkspaceController {
  getById = async (req: Request, res: Response) => {
    try {
      const workspaceId = (req.headers['x-workspace-id'] as string) || req.params.id;
      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' });
      }

      const workspace = await workspaceRepository.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      res.json(workspace);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getSettings = async (req: Request, res: Response) => {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;
      if (!workspaceId) return res.status(400).json({ error: 'Workspace ID required' });

      const workspace = await workspaceRepository.findById(workspaceId);
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;
      const { name } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' });
      }

      const updated = await workspaceRepository.update(workspaceId, { name });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  invite = async (req: Request, res: Response) => {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;
      const { email } = req.body;

      if (!workspaceId || !email) {
        return res.status(400).json({ error: 'Email and Workspace ID required' });
      }

      const workspace = await workspaceRepository.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      const token = await workspaceRepository.createInvitation({
        email,
        workspaceId,
      });

      const { EmailService } = await import('../services/email.service');
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const inviteUrl = `${baseUrl}/register?token=${token}`;

      let emailSent = true;
      try {
        await EmailService.sendInvitation(email, workspace.name, inviteUrl);
      } catch (emailError: any) {
        console.error('⚠️ Invitation email blocked (likely Resend Sandbox):', emailError.message);
        emailSent = false;
      }

      res.json({ 
        message: emailSent ? `Invite sent to ${email}` : `Invite created (Email blocked by Resend Sandbox)`, 
        token,
        inviteUrl,
        status: emailSent ? 'sent' : 'sandbox_mode'
      });
    } catch (error) {
      console.error('Invite error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  validateInvitation = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      if (!token) return res.status(400).json({ error: 'Token required' });

      const invitation = await workspaceRepository.findInvitationByToken(token);
      
      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found or already used' });
      }

      if (new Date() > invitation.expiresAt) {
        return res.status(410).json({ error: 'Invitation has expired' });
      }

      res.json(invitation);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  join = async (req: Request, res: Response) => {
    try {
      const { token, fullName } = req.body;
      const invitation = await workspaceRepository.findInvitationByToken(token);
      if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
      
      const { default: prisma } = await import('../lib/prisma');
      
      await prisma.user.upsert({
        where: { email: invitation.email },
        update: { 
          workspaceId: invitation.workspaceId,
          fullName: fullName,
        },
        create: {
          email: invitation.email,
          fullName: fullName,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        }
      });

      await workspaceRepository.deleteInvitation(token);
      res.json({ message: 'Successfully joined workspace' });
    } catch (error) {
      console.error('Join error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getAnalytics = async (req: Request, res: Response) => {
    try {
      const workspaceId = req.headers['x-workspace-id'] as string;
      if (!workspaceId) return res.status(400).json({ error: 'Workspace ID required' });

      const analytics = await workspaceRepository.getAnalytics(workspaceId);
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  shareReport = async (req: Request, res: Response) => {
    try {
      const { meetingId, email, workspaceId } = req.body;
      if (!meetingId || !email || !workspaceId) {
        return res.status(400).json({ error: 'Missing meetingId, email, or workspaceId' });
      }

      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: { summary: true }
      });

      if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

      console.log(`✉️ Dispatched shared report request for ${meeting.title} to ${email}`);

      // Re-using the robust summary email logic from EmailService
      await EmailService.sendMeetingSummary(
        email, 
        meeting.title, 
        meeting.summary?.short || 'Meeting analysis complete.', 
        meetingId
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error('❌ Share report error:', error.message);
      res.status(500).json({ error: 'Failed to share report', details: error.message });
    }
  }
}

export const workspaceController = new WorkspaceController();
