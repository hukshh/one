import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller';
import { authMiddleware } from '../middleware/auth.middleware';

import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = Router();

// Secure all meeting routes
router.use(authMiddleware);

router.post('/upload', upload.single('file'), meetingController.upload);
router.get('/', meetingController.list);
router.get('/:id', meetingController.getById);

export default router;
