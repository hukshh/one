import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';

export const userController = {
  getMe: async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stats = await userRepository.getUserStats(userId);

      res.json({ ...user, stats });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  },

  updateMe: async (req: Request, res: Response) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { fullName } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updatedUser = await userRepository.update(userId, { fullName });
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};
