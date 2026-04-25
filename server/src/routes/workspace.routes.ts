import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes for onboarding
router.get('/invitations/:token', workspaceController.validateInvitation);
router.post('/join', workspaceController.join);

router.use(authMiddleware);

router.get('/me', workspaceController.getById);
router.patch('/me', workspaceController.update);
router.post('/invite', workspaceController.invite);
router.get('/analytics', workspaceController.getAnalytics);

export default router;
