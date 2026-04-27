import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        workspace: true,
      },
    });
  }

  async update(id: string, data: { fullName?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async getUserStats(id: string) {
    const meetingCount = await prisma.meeting.count({
      where: { creatorId: id },
    });

    const actionItems = await prisma.actionItem.count({
      where: {
        owner: {
          contains: id, // Basic check if user is mentioned as owner
        },
      },
    });

    return {
      meetingCount,
      actionItems,
    };
  }
}

export const userRepository = new UserRepository();
