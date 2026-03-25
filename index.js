import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Pyq from "./models/Pyq.js";
import authRoutes from "./routes/authRoutes.js";
import { admin } from "./middleware/authMiddleware.js";

const app = express();

// CORS configuration - Allow frontend domains
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://pictacadverse.vercel.app'
    ];
    
    // Allow all Vercel preview deployments
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// JWT Authentication Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("DB Error:", err));

// --- ROUTES ---

// Auth Routes (login, register, google)
app.use("/api/auth", authRoutes);

// 1. GET ALL PAPERS (Public - no auth required)
app.get("/api/pyqs", async (req, res) => {
  try {
    const pyqs = await Pyq.find().sort({ uploadedAt: -1 });
    res.json(pyqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. UPLOAD PAPER (Protected - requires authentication AND admin role)
app.post("/api/pyqs", verifyToken, admin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Get user ID from JWT token
    const userId = req.user.id;
    console.log("Authenticated user:", userId);

    // Upload to Cloudinary Stream
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const cldRes = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "examorbit_pyqs"
    });

    // Save to DB
    const newPyq = new Pyq({
      subject: req.body.subject,
      year: req.body.year,
      paperType: req.body.paperType,
      title: req.body.title || req.file.originalname,
      fileUrl: cldRes.secure_url,
      uploadedBy: userId, // Store user ID from JWT
    });

    await newPyq.save();
    res.status(201).json(newPyq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running with JWT authentication" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with JWT auth`));