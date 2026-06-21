const { pool } = require('./config/db');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const username = 'admin';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.error('ERROR: ADMIN_PASSWORD environment variable is not set. Refusing to seed with a default password.');
      console.error('Please set ADMIN_PASSWORD in your .env file and re-run this script.');
      process.exit(1);
    }
    
    const admin = await Admin.findByUsername(username);
    if (admin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await Admin.create(username, hashedPassword);
    console.log(`Admin user seeded successfully with username: admin`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
