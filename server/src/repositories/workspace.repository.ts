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
}

export const workspaceRepository = new WorkspaceRepository();
