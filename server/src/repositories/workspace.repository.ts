import { Workspace } from '@prisma/client';
import prisma from '../lib/prisma';

export class WorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  async update(id: string, data: { name?: string; slug?: string }): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async addMember(workspaceId: string, email: string): Promise<void> {
    // This is a simplified version. In a real app, we'd check if the user exists
    // and potentially send an invitation instead of direct adding.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { workspaceId },
      });
    }
  }

  async createInvitation(data: {
    email: string;
    workspaceId: string;
    role?: string;
  }): Promise<string> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    await prisma.invitation.create({
      data: {
        email: data.email,
        workspaceId: data.workspaceId,
        token,
        role: data.role || 'member',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    return token;
  }

  async findInvitationByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            name: true,
          }
        }
      }
    });
  }

  async deleteInvitation(token: string) {
    return prisma.invitation.delete({
      where: { token }
    });
  }

  async getAnalytics(workspaceId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch ALL meetings for the workspace to ensure totals match the intelligence feed
    const allMeetings = await prisma.meeting.findMany({
      where: {
        workspaceId,
      },
      include: {
        participants: true,
        summary: true,
        actionItems: true,
        decisions: true,
        risks: true
      }
    });

    const processedMeetings = allMeetings.filter(m => m.status === 'PROCESSED');
    const recentMeetings = allMeetings.filter(m => m.createdAt >= thirtyDaysAgo);

    // 1. Totals & Averages (Global)
    const totalMeetings = allMeetings.length;
    const totalDurationMinutes = allMeetings.reduce((acc, m) => acc + (m.duration || 0), 0);
    
    // Calculate Average Confidence across all intelligence (AI quality score)
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    processedMeetings.forEach(m => {
      [...m.actionItems, ...m.decisions, ...m.risks].forEach(item => {
        // Fallback to 0.9 for existing/legacy data that lacks a confidence score
        const score = item.confidence ?? 0.9;
        totalConfidence += score;
        confidenceCount++;
      });
    });
    
    const avgConfidence = confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) : null;

    // 2. Timeline (Daily Volume - 30 Day Window)
    const timeline: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      timeline[d.toISOString().split('T')[0]] = 0;
    }
    recentMeetings.forEach(m => {
      const date = m.createdAt.toISOString().split('T')[0];
      if (timeline[date] !== undefined) timeline[date]++;
    });

    // 3. Task Completion Rate
    let totalTasks = 0;
    let completedTasks = 0;
    allMeetings.forEach(m => {
      m.actionItems.forEach(ai => {
        totalTasks++;
        if (ai.status === 'COMPLETED') completedTasks++;
      });
    });
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : null;

    // 4. Sentiment (Proxy based on Decisions/Risks ratio)
    const totalDecisions = allMeetings.reduce((acc, m) => acc + m.decisions.length, 0);
    const totalRisks = allMeetings.reduce((acc, m) => acc + m.risks.length, 0);
    const totalActionItems = allMeetings.reduce((acc, m) => acc + m.actionItems.length, 0);
    
    const totalSignals = totalDecisions + totalRisks + totalActionItems;
    const sentiment = {
      positive: totalSignals > 0 ? Math.round((totalDecisions / totalSignals) * 100) : 0,
      neutral: totalSignals > 0 ? Math.round((totalActionItems / totalSignals) * 100) : 0,
      critical: totalSignals > 0 ? Math.round((totalRisks / totalSignals) * 100) : 0,
    };

    return {
      totalMeetings,
      totalDuration: totalDurationMinutes,
      avgConfidence,
      taskCompletionRate,
      dailyVolume: Object.entries(timeline).map(([date, count]) => ({ date, count })),
      sentiment,
      topParticipants: [], 
    };
  }
}

export const workspaceRepository = new WorkspaceRepository();
