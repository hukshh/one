import { Request, Response, NextFunction } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        workspaceId: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In a real production app, this would verify a JWT or session
  // For this demonstration, we'll mock a logged-in user from a header
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  const workspaceId = (req.headers['x-workspace-id'] as string) || (req.query.workspaceId as string);

  if (!userId || !workspaceId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user or workspace identity' });
  }

  req.user = {
    id: userId,
    workspaceId: workspaceId,
    role: 'member',
  };

  next();
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'owner') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
