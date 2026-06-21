const { pool } = require('./config/db');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  try {
    const username = 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      console.log('Admin does not exist.');
      process.exit(1);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      console.log('Password matches!');
    } else {
      console.log('Password DOES NOT match!');
      // Let's reset it to the password value
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await pool.query('UPDATE admins SET password = ? WHERE username = ?', [hashedPassword, username]);
      console.log(`Password has been reset to ${password === 'admin123' ? 'admin123 (default)' : '[custom]'}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();
