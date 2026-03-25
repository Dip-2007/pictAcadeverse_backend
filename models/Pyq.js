// // server/models/Pyq.js
// import mongoose from 'mongoose';

// const pyqSchema = new mongoose.Schema({
//   subject: { type: String, required: true },
//   code: { type: String, required: true },
//   year: { type: Number, required: true },
//   type: { type: String, required: true },
//   module: { type: Number },
//   question: { type: String }, // Now acts as a Title/Description
//   difficulty: { type: String, default: 'Medium' },
//   faculty: { type: String },
//   fileUrl: { type: String, required: true }, // URL to the uploaded PDF/Image
// }, { timestamps: true });

// export default mongoose.model('Pyq', pyqSchema);

import mongoose from "mongoose";

const pyqSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  year: { type: String, required: true }, // "1", "2", etc.
  paperType: { type: String, required: true }, // "End-Sem", "In-Sem"
  title: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  uploadedBy: { type: String }, // Clerk user ID (optional for backwards compatibility)
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Pyq", pyqSchema);