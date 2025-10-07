const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, 'image-' + uniqueSuffix + path.extname(originalName));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
router.post('/image', upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file ? req.file.originalname : 'No file',
      body: req.body,
      headers: req.headers
    });

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? 'https://food-donation-platform-production-61ad.up.railway.app'
      : `http://localhost:${process.env.PORT || 9900}`;
    
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('Image uploaded successfully:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: imageUrl,
      environment: isProduction ? 'production' : 'development'
    });
    
    res.json({ 
      success: true,
      imageUrl: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});
router.get('/test', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://food-donation-platform-production-61ad.up.railway.app'
    : `http://localhost:${process.env.PORT || 9900}`;
    
  res.json({ 
    message: 'Upload endpoint is working!',
    environment: isProduction ? 'production' : 'development',
    baseUrl: baseUrl,
    endpoint: 'POST /api/upload/image',
    note: 'Send FormData with "image" field'
  });
});

module.exports = router;