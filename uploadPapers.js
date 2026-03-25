// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import { v2 as cloudinary } from 'cloudinary';
// import Pyq from './models/Pyq.js';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// dotenv.config();

// // --- CONFIGURATION ---
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // --- FILES TO UPLOAD ---
// // Ensure these files exist inside the 'uploads' folder in your project root
// const papersToAdd = [
//   {
//     filename: "final exp5-2 (1).pdf",  
//     subject: "Data Structures (DS)",      
//     year: "2",                            
//     paperType: "In-Sem",                 
//     title: "In Sem 2024 - Dec"           
//   }
// ];

// const uploadPapers = async () => {
//   try {
//     if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");

//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ Connected to MongoDB\n');

//     for (const paper of papersToAdd) {
//       try {
//         console.log(`Processing: ${paper.filename}...`);
//         const localFilePath = path.join(__dirname, 'uploads', paper.filename);

//         if (!fs.existsSync(localFilePath)) {
//           console.error(`  ❌ File not found locally: ${localFilePath}`);
//           console.log(`     (Make sure the file is inside the 'uploads' folder)`);
//           continue;
//         }

//         // 1. DELETE OLD DB ENTRY (Prevents Duplicates in Database)
//         const existing = await Pyq.findOne({ subject: paper.subject, title: paper.title });
//         if (existing) {
//           console.log(`  🔄 Deleting old DB entry to avoid duplicates...`);
//           await Pyq.deleteOne({ _id: existing._id });
//         }

//         // 2. PREPARE CLEAN FILENAME (Crucial for URL to work)
//         // Converts "final exp5-2 (1).pdf" -> "final_exp5-2_1"
//         const cleanName = paper.filename
//           .replace(/\.[^/.]+$/, "")       // Remove extension
//           .replace(/[^a-zA-Z0-9]/g, "_"); // Replace spaces/symbols with underscore

//         // 3. UPLOAD TO CLOUDINARY
//         console.log(`  ☁️  Uploading to Cloudinary as '${cleanName}'...`);

//         const result = await cloudinary.uploader.upload(localFilePath, {
//           resource_type: "auto",      // Detects PDF/Image automatically
//           folder: "examorbit_pyqs",
//           public_id: cleanName,       // Forces this specific clean name
//           use_filename: true,         // Uses our clean name
//           unique_filename: false,     // FALSE = Don't add random characters (Clean URL)
//           overwrite: true             // Overwrite if it exists in Cloud
//         });

//         // 4. SAVE TO MONGODB
//         const newPyq = new Pyq({
//           subject: paper.subject,
//           year: paper.year,
//           paperType: paper.paperType,
//           title: paper.title,
//           fileUrl: result.secure_url, // This will now be a working URL
//           uploadedAt: new Date()
//         });

//         await newPyq.save();
//         console.log(`  ✅ Upload Success!`);
//         console.log(`  🔗 Link: ${result.secure_url}`);

//       } catch (err) {
//         console.error(`  ❌ Error processing ${paper.filename}: ${err.message}`);
//       }
//       console.log('-----------------------------------');
//     }

//     console.log("🎉 All operations completed.");
//     process.exit();

//   } catch (error) {
//     console.error('❌ Fatal Error:', error);
//     process.exit(1);
//   }
// };

// uploadPapers();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Pyq from './models/Pyq.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- FILES TO UPLOAD ---
// Put your PDF files inside a folder named 'uploads' in the same directory as this script
const papersToAdd = [
  // {
  //   filename: "LAC ISE-25.pdf",
  //   subject: "Computer Organisation and Architecture (COA)",
  //   year: "2",
  //   paperType: "In-Sem",
  //   title: "In Sem 2024 - Feb"
  // },
  // {
  //   filename: "Devesh-04-12-25.pdf",
  //   subject: "Computer Organisation and Architecture (COA)",
  //   year: "2",
  //   paperType: "In-Sem",
  //   title: "In Sem 2024 - Dec"
  // },
  {
    filename: "Module I Assignment _1.pdf",
    subject: "Quantum Physics (QP)",
    year: "1",
    paperType: "In-Sem",
    title: "In Sem 2024 - Feb"
  },
];

const uploadPapers = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    for (const paper of papersToAdd) {
      try {
        console.log(`Processing: ${paper.filename}...`);
        const localFilePath = path.join(__dirname, 'uploads', paper.filename);

        // 1. Check if file exists locally
        if (!fs.existsSync(localFilePath)) {
          console.error(`  ❌ File not found locally: ${localFilePath}`);
          continue;
        }

        // 2. Remove old DB entry to avoid duplicates
        const existing = await Pyq.findOne({ subject: paper.subject, title: paper.title });
        if (existing) {
          console.log(`  🔄 Removing old DB entry...`);
          await Pyq.deleteOne({ _id: existing._id });
        }

        // 3. Prepare Clean Filename (Sanitize)
        // "final exp5-2 (1).pdf" -> "final_exp5-2_1"
        const cleanName = paper.filename
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9]/g, "_");

        // 4. Upload to Cloudinary
        console.log(`  ☁️  Uploading to Cloudinary as '${cleanName}'...`);
        const result = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
          folder: "examorbit_pyqs",
          public_id: cleanName,       // Forces clean name
          use_filename: true,
          unique_filename: false,     // FALSE = Keeps URL clean
          overwrite: true
        });

        // 5. Save to MongoDB
        const newPyq = new Pyq({
          subject: paper.subject,
          year: paper.year,
          paperType: paper.paperType,
          title: paper.title,
          fileUrl: result.secure_url,
          uploadedAt: new Date()
        });

        await newPyq.save();
        console.log(`  ✅ Upload Success!`);
        console.log(`  🔗 Link: ${result.secure_url}`);

      } catch (err) {
        console.error(`  ❌ Error processing ${paper.filename}: ${err.message}`);
      }
      console.log('-----------------------------------');
    }

    console.log("🎉 All operations completed.");
    process.exit();

  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
};

uploadPapers();