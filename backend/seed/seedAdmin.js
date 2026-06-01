import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';

/**
 * Admin seed script.
 * Creates the default admin account if one doesn't already exist.
 *
 * Default credentials:
 *   Email:    admin@StreamFlix.com
 *   Password: StreamFlix@2025
 */
export async function seedAdminAccount(options = {}) {
  const shouldConnect = options.shouldConnect ?? false;
  try {
    if (shouldConnect) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/StreamFlix';
      await mongoose.connect(mongoUri);
      console.log('📦 Connected to MongoDB');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@StreamFlix.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'StreamFlix@2025';

    const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');
    if (existingAdmin) {
      const isPasswordMatch = await comparePassword(adminPassword, existingAdmin.password);
      const isNameMatch = existingAdmin.name === 'StreamFlix Admin';
      const isRoleMatch = existingAdmin.role === 'admin';

      if (isPasswordMatch && isNameMatch && isRoleMatch) {
        console.log(`ℹ️  Admin account already exists and is up to date: ${adminEmail}`);
        if (shouldConnect) {
          await mongoose.disconnect();
        }
        return { success: true, created: false, updated: false };
      }

      console.log(`⚠️  Admin account details out of sync. Updating admin: ${adminEmail}...`);
      const updateFields = {};
      if (!isNameMatch) updateFields.name = 'StreamFlix Admin';
      if (!isRoleMatch) updateFields.role = 'admin';
      if (!isPasswordMatch) {
        updateFields.password = await hashPassword(adminPassword);
      }

      await User.updateOne({ email: adminEmail }, { $set: updateFields });
      console.log('✅ Admin account updated successfully!');

      if (shouldConnect) {
        await mongoose.disconnect();
      }
      return { success: true, created: false, updated: true };
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

    if (shouldConnect) {
      await mongoose.disconnect();
    }
    return { success: true, created: true, updated: false };
  } catch (seedError) {
    console.error('❌ Error seeding admin account:', seedError);
    if (shouldConnect) {
      try { await mongoose.disconnect(); } catch (_) {}
    }
    throw seedError;
  }
}

/**
 * Startup hook executed after MongoDB connects.
 * Runs admin seeding if AUTO_SYNC_ADMIN !== 'false'.
 */
export async function maybeRunAdminSeed() {
  if (process.env.AUTO_SYNC_ADMIN === 'false') {
    console.log('ℹ️  AUTO_SYNC_ADMIN is explicitly disabled. Skipping startup admin seeding.');
    return;
  }

  console.log('🔍 Auto-sync check active for Admin account.');
  try {
    const stats = await seedAdminAccount({ shouldConnect: false });
    if (stats.created) {
      console.log('🎉 Default admin user created successfully.');
    } else if (stats.updated) {
      console.log('🎉 Default admin user updated successfully.');
    }
  } catch (error) {
    console.error('❌ Failed to run automatic admin seeding:', error);
  }
}

// ─── Direct CLI Execution Support ──────────────────────────────────────────────
import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('seedAdmin.js')
);

if (isMain) {
  (async () => {
    try {
      await seedAdminAccount({ shouldConnect: true });
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  })();
}
