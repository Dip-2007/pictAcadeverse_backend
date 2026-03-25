import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email address as an argument.');
    console.error('Usage: node makeAdmin.js <user-email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User with email ${email} not found!`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`✅ Success! ${user.name} (${user.email}) is now an ADMIN.`);
    console.log('Have the user Log Out and Log Back In to receive their new Admin token.');
    
  } catch (err) {
    console.error('❌ Error updating user:', err);
  } finally {
    mongoose.connection.close();
  }
};

makeAdmin();
