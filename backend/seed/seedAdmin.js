import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import { hashPassword } from '../utils/hashPassword.js';

/**
 * Admin seed script.
 * Creates the default admin account if one doesn't already exist.
 *
 * Default credentials:
 *   Email:    admin@StreamFlix.com
 *   Password: StreamFlix@2025
 *
 * Run with: node server/seed/seedAdmin.js
 */
async function seedAdminAccount() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/StreamFlix';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    const adminEmail = 'admin@StreamFlix.com';
    const adminPassword = 'StreamFlix@2025';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`ℹ️  Admin account already exists: ${adminEmail}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await hashPassword(adminPassword);

    await User.create({
      name: 'StreamFlix Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      preferences: {
        genres: ['Sci-Fi', 'Action', 'Drama'],
        theme: 'cream',
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log(`   📧 Email:    ${adminEmail}`);
    console.log(`   🔑 Password: ${adminPassword}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (seedError) {
    console.error('❌ Error seeding admin account:', seedError);
    process.exit(1);
  }
}

seedAdminAccount();
