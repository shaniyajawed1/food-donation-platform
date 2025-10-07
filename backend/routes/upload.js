const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');
const router = express.Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

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
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'food-donations',
        public_id: `image-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received');

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    
    const result = await uploadToCloudinary(req.file.buffer);
    
    console.log('Image uploaded to Cloudinary:', result.secure_url);
    
    res.json({ 
      success: true,
      imageUrl: result.secure_url,
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
  res.json({ 
    message: 'Upload endpoint is working!',
    endpoint: 'POST /api/upload/image',
    note: 'Send FormData with "image" field'
  });
});

module.exports = router;