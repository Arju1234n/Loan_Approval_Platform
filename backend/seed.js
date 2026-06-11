/**
 * Seed Script — creates the default admin user.
 *
 * Usage (from backend/ directory):
 *   node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const ADMIN = {
  name:     'CreditWise Admin',
  email:    'admin@creditwise.com',
  password: 'Admin@123',   // change after first login
  role:     'admin',
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Lazy-load model AFTER connection so pre-save hook registers
    const User = require('./src/modules/auth/model/User');

    await User.deleteOne({ email: ADMIN.email });
    const admin = await User.create(ADMIN);

    console.log('\n✅ Admin seeded successfully:');
    console.log('   Name    :', admin.name);
    console.log('   Email   :', admin.email);
    console.log('   Role    :', admin.role);
    console.log('   ID      :', admin._id);
    console.log('\n⚠️  Change the password after first login!\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
