// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import Pyq from './models/Pyq.js';

// dotenv.config();

// // --- CONFIGURATION: ADD FILES TO DELETE HERE ---
// const filesToDelete = [
//   "dsa_2024.pdf",
//   "dbms_mid_2023.pdf",
//   "os_unit_test.pdf" 
// ]; 
// // -----------------------------------------------

// // Setup for __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const deleteMultiplePapers = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ Connected to DB');

//     let deletedCount = 0;
//     let failedCount = 0;

//     console.log(`\nProcessing ${filesToDelete.length} files...`);
//     console.log('-----------------------------------');

//     for (const filename of filesToDelete) {
//       try {
//         // 1. Find the paper in the database
//         const paper = await Pyq.findOne({ 
//           fileUrl: { $regex: filename + "$" } 
//         });

//         if (!paper) {
//           console.log(`❌ Skipped: No DB record for "${filename}"`);
//           failedCount++;
//           continue; // Skip to next file
//         }

//         // 2. Delete local file
//         const filePath = path.join(__dirname, 'uploads', filename);
        
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//           console.log(`📂 File deleted: ${filename}`);
//         } else {
//           console.log(`⚠️  File not found on disk: ${filename} (Deleting DB record anyway)`);
//         }

//         // 3. Delete DB Record
//         await Pyq.deleteOne({ _id: paper._id });
//         console.log(`🗑️  Record deleted: ${paper.subject} (${paper.year})`);
//         console.log('-----------------------------------');
        
//         deletedCount++;

//       } catch (err) {
//         console.error(`❌ Error processing ${filename}:`, err.message);
//         failedCount++;
//       }
//     }

//     console.log(`\n🎉 Summary: ${deletedCount} deleted, ${failedCount} failed.`);
//     process.exit();

//   } catch (error) {
//     console.error('❌ Database Connection Error:', error);
//     process.exit(1);
//   }
// };

// deleteMultiplePapers();