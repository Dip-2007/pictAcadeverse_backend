import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Pyq from '../models/Pyq.js'; 
import dotenv from 'dotenv';
import { protect, admin } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

// --- 1. Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. Multer Storage Engine ---
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'examorbit_pyqs',
//     resource_type: 'auto', // Auto-detects PDF vs Image
//     allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
//     // FIX: This keeps the original filename (sanitized)
//     public_id: (req, file) => {
//       // Remove extension and replace special chars with underscore
//       return file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
//     }
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Determine if it's an image or a raw file (PDF/Doc)
    const isImage = file.mimetype.startsWith('image/');
    
    return {
      folder: 'examorbit_pyqs',
      // If it's an image, use 'image', otherwise use 'raw' (for PDFs)
      resource_type: isImage ? 'image' : 'raw', 
      format: isImage ? undefined : 'pdf', // Force format for PDFs
      public_id: file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_"),
    };
  },
});

const upload = multer({ storage: storage });

// --- 3. GET All Papers ---
router.get('/', async (req, res) => {
  try {
    const papers = await Pyq.find().sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 4. POST (Upload) Route ---
// NOTE: 'file' must match formData.append('file', ...) on frontend
router.post('/', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("✅ File Uploaded to:", req.file.path);

    const newPaper = new Pyq({
      subject: req.body.subject,
      year: req.body.year,
      paperType: req.body.paperType,
      title: req.body.title,
      fileUrl: req.file.path, // URL from Cloudinary (now has .pdf extension)
    });

    const savedPaper = await newPaper.save();
    res.status(201).json(savedPaper);

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

export default router;