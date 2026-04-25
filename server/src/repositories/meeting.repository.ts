import { PrismaClient, Meeting, MeetingStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class MeetingRepository {
  async create(data: {
    title: string;
    workspaceId: string;
    creatorId: string;
    videoUrl?: string;
    audioUrl?: string;
  }): Promise<Meeting> {
    return prisma.meeting.create({
      data: {
        ...data,
        status: MeetingStatus.UPLOADED,
      },
    });
  }

  async findById(id: string): Promise<Meeting | null> {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: true,
        transcript: true,
        summary: true,
        actionItems: true,
        decisions: true,
        risks: true,
        creator: true,
      },
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<Meeting[]> {
    return prisma.meeting.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        summary: true,
      }
    });
  }

  async search(workspaceId: string, query: string): Promise<Meeting[]> {
    const words = query.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return this.findByWorkspaceId(workspaceId);

    return prisma.meeting.findMany({
      where: {
        workspaceId,
        AND: words.map(word => ({
          OR: [
            { title: { contains: word, mode: 'insensitive' } },
            { summary: { short: { contains: word, mode: 'insensitive' } } },
            { summary: { detailed: { contains: word, mode: 'insensitive' } } },
            { transcript: { some: { content: { contains: word, mode: 'insensitive' } } } },
          ]
        }))
      },
      include: {
        summary: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: MeetingStatus): Promise<Meeting> {
    return prisma.meeting.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: string, data: any): Promise<Meeting> {
    return prisma.meeting.update({
      where: { id },
      data,
    });
  }

  async saveTranscript(meetingId: string, segments: any[]): Promise<void> {
    const safeSegments = segments.map(s => ({
      meetingId,
      startTime: Number(s.startTime || s.start) || 0,
      endTime: Number(s.endTime || s.end) || 0,
      speakerLabel: s.speakerLabel || s.speaker || 'Speaker',
      content: s.content || s.text || '',
      confidence: Number(s.confidence) || 0.9
    }));

    await prisma.transcriptSegment.createMany({
      data: safeSegments
    });
  }


  async saveIntelligence(meetingId: string, intelligence: any): Promise<void> {
    const { summary_short, summary_detailed, action_items, decisions, risks } = intelligence;
    
    const operations: any[] = [
      prisma.summary.create({
        data: {
          meetingId,
          short: summary_short,
          detailed: summary_detailed,
        }
      })
    ];

    if (action_items && action_items.length > 0) {
      operations.push(prisma.actionItem.createMany({
        data: action_items.map((item: any) => {
          const d = item.deadline ? new Date(item.deadline) : null;
          const isValidDate = d instanceof Date && !isNaN(d.getTime());
          return {
            meetingId,
            task: item.task || 'No description provided',
            owner: item.owner || 'Unknown',
            priority: ['LOW', 'MEDIUM', 'HIGH'].includes(String(item.priority).toUpperCase()) 
              ? (String(item.priority).toUpperCase() as any) 
              : 'MEDIUM',
            deadline: isValidDate ? d : null
          };
        })
      }));
    }

    if (decisions && decisions.length > 0) {
      operations.push(prisma.decision.createMany({
        data: decisions.map((d: any) => ({
          meetingId,
          content: typeof d === 'string' ? d : JSON.stringify(d)
        }))
      }));
    }

    if (risks && risks.length > 0) {
      operations.push(prisma.risk.createMany({
        data: risks.map((r: any) => ({
          meetingId,
          content: r.risk || r.content || 'No description provided',
          severity: ['LOW', 'MEDIUM', 'HIGH'].includes(String(r.severity || r.priority).toUpperCase()) 
            ? (String(r.severity || r.priority).toUpperCase() as any) 
            : 'MEDIUM'
        }))
      }));
    }
    
    await prisma.$transaction(operations);
  }
}

export const meetingRepository = new MeetingRepository();
