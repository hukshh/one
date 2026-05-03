import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import os from 'os';

// Use OS temp directory — files are uploaded to GridFS immediately and temp files are deleted
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir()); // Use system temp dir — no local uploads/ needed
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

const router = Router();

// Public file serving route — no auth required so the worker can download files
router.get('/file/:storageKey', meetingController.serveFile);

// All other meeting routes require authentication
router.use(authMiddleware);

router.post('/upload', upload.single('file'), meetingController.upload);
router.get('/', meetingController.list);
router.get('/:id', meetingController.getById);
router.get('/:id/export/pdf', meetingController.exportPdf);
router.post('/:id/chat', meetingController.chat);
router.patch('/action-items/:actionItemId', meetingController.updateActionItem);

export default router;
