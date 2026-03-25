import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Pyq from './models/Pyq.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- FILES TO DELETE ---
// Use the exact same fields as uploadPapers.js
const papersToDelete = [
    {
        filename: "LAC ISE-25.pdf",
        subject: "Computer Organisation and Architecture (COA)",
        year: "2",
        paperType: "In-Sem",
        title: "In Sem 2024 - Feb"
    },
    {
        filename: "Devesh-04-12-25.pdf",
        subject: "Computer Organisation and Architecture (COA)",
        year: "2",
        paperType: "In-Sem",
        title: "In Sem 2024 - Dec"
    },
    {
        filename: "Devesh-04-12-25.pdf",
        subject: "Quantum Physics (QP)",
        year: "1",
        paperType: "In-Sem",
        title: "In Sem 2024 - Feb"
    },
    // Add more entries here to delete multiple at once:
    // {
    //   filename: "Devesh-04-12-25.pdf",
    //   subject: "Computer Organisation and Architecture (COA)",
    //   year: "2",
    //   paperType: "In-Sem",
    //   title: "In Sem 2024 - Dec"
    // }
];

const deletePapers = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        for (const paper of papersToDelete) {
            console.log(`Processing: ${paper.filename}...`);

            // 1. Derive Cloudinary public_id from filename (same logic as uploadPapers.js)
            const cleanName = paper.filename
                .replace(/\.[^/.]+$/, "")       // Remove extension
                .replace(/[^a-zA-Z0-9]/g, "_"); // Replace spaces/symbols with underscore

            const publicId = `examorbit_pyqs/${cleanName}`;

            // 2. Delete from Cloudinary
            console.log(`  ☁️  Deleting from Cloudinary: ${publicId}`);
            try {
                const cloudResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                console.log(`  ☁️  Cloudinary: ${cloudResult.result}`);
            } catch (cloudErr) {
                console.error(`  ❌ Cloudinary delete failed: ${cloudErr.message}`);
            }

            // 3. Delete from MongoDB by subject + title
            const deleted = await Pyq.findOneAndDelete({ subject: paper.subject, title: paper.title });
            if (deleted) {
                console.log(`  🗄️  Removed from MongoDB.`);
                console.log(`  ✅ Done!`);
            } else {
                console.log(`  ⚠️  Not found in MongoDB (may have already been deleted).`);
            }

            console.log('-----------------------------------');
        }

        console.log("🎉 All deletions completed.");
        process.exit();

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
};

deletePapers();
