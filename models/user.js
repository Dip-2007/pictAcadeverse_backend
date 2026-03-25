import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional because Google users won't have it
  googleId: { type: String, unique: true, sparse: true }, // Sparse allows null/undefined to not conflict
  picture: { type: String },
  role: { type: String, default: "student" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);