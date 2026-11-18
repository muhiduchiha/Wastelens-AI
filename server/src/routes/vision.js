import express from 'express';
import multer from 'multer';
import { analyzeShelfImage } from '../services/visionService.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// POST /api/vision/analyze
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    let imageData = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      imageData = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.image_base64) {
      imageData = req.body.image_base64;
      mimeType = req.body.mime_type || 'image/jpeg';
    }

    const result = await analyzeShelfImage(imageData, mimeType);
    res.json(result);
  } catch (err) {
    console.error('Vision error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
