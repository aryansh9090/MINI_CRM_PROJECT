const { pool } = require('./config/db');

async function seedLeads() {
  try {
    console.log('Seeding leads...');
    await pool.query(`
      INSERT INTO leads (name, email, source, status, notes) VALUES 
      ('Alice Smith', 'alice@example.com', 'Website', 'New', 'Interested in CRM'),
      ('Bob Jones', 'bob@example.com', 'Referral', 'Contacted', 'Follow up next week'),
      ('Charlie Brown', 'charlie@example.com', 'Advertisement', 'Qualified', 'Wants a demo'),
      ('Diana Prince', 'diana@example.com', 'Website', 'Converted', 'Purchased enterprise plan');
    `);
    
    // Also add some contact attempts so the Golden Hour data isn't completely empty
    await pool.query(`
      INSERT INTO contact_attempts (lead_id, success, hour_of_day)
      SELECT id, true, 10 FROM leads WHERE email = 'bob@example.com';
    `);
    await pool.query(`
      INSERT INTO contact_attempts (lead_id, success, hour_of_day)
      SELECT id, true, 14 FROM leads WHERE email = 'charlie@example.com';
    `);
    await pool.query(`
      INSERT INTO contact_attempts (lead_id, success, hour_of_day)
      SELECT id, true, 14 FROM leads WHERE email = 'diana@example.com';
    `);

    console.log('Leads and sample contact attempts seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding leads:', err);
    process.exit(1);
  }
}

seedLeads();
