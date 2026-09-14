import express from 'express';
import multer from 'multer';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudStorage, UPLOADS_PATH } from '../services/storage.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
export const mediaRouter = Router();

// Serve locally-uploaded files
mediaRouter.use('/files', (req, res, next) => {
  if (req.query.audio === '1') {
    res.setHeader('Content-Type', req.path.endsWith('.wav') ? 'audio/wav' : req.path.endsWith('.ogg') ? 'audio/ogg; codecs=opus' : 'audio/webm; codecs=opus');
  }
  next();
});
mediaRouter.use('/files', express.static(UPLOADS_PATH, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.audio.webm')) res.setHeader('Content-Type', 'audio/webm; codecs=opus');
    if (filePath.endsWith('.audio.ogg')) res.setHeader('Content-Type', 'audio/ogg; codecs=opus');
    if (filePath.endsWith('.audio.wav')) res.setHeader('Content-Type', 'audio/wav');
  },
}));

mediaRouter.post('/upload', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  const uploaded = await uploadToCloudStorage(req.file);
  res.status(201).json(uploaded);
}));
