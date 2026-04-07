const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Player = require('./models/Player');
const Franchise = require('./models/Franchise');
const Admin = require('./models/Admin');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const migrate = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_db';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('MongoDB connected...');

    // Clear existing collections
    await Player.deleteMany();
    await Franchise.deleteMany();
    await Admin.deleteMany();
    console.log('MongoDB collections cleared.');

    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'db_auction'
    });
    console.log('MySQL connected...');

    // Fetch franchises
    const [franchises] = await connection.execute('SELECT * FROM tbl_franchises');
    
    // Hash default password for franchises
    const defaultPassword = await bcrypt.hash('123456', 10);
    
    const franchiseMap = {}; // Maps SQL id to MongoDB ObjectId

    for (const f of franchises) {
      // Create a username from franchise name (alphanumeric only, lowercase)
      const username = f.frenchises_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + f.id;
      
      const newFranchise = await Franchise.create({
        originalId: f.id,
        frenchises_name: f.frenchises_name,
        owner: f.owner,
        logo: f.logo,
        total_amount: f.total_amount,
        remaining_amount: f.remaining_amount,
        total_players: f.total_players,
        username: username,
        password: defaultPassword
      });
      franchiseMap[f.id] = newFranchise._id;
    }
    console.log(`Migrated ${franchises.length} franchises.`);

    // Fetch players
    const [players] = await connection.execute('SELECT * FROM tbl_players');
    
    for (const p of players) {
      await Player.create({
        originalId: p.id,
        full_name: p.full_name,
        mobile_no: p.mobile_no || null,
        age: p.age || null,
        village_name: p.village_name || '',
        zone_name: p.zone_name || '',
        playing_role: p.playing_role || '',
        image: p.image || '',
        email: p.email || '',
        fees: p.fees || 0,
        franchise_id: p.franchise_id > 0 && franchiseMap[p.franchise_id] ? franchiseMap[p.franchise_id] : null,
        sold_price: p.sold_price || 0,
        unsold_status: p.unsold_status || 0
      });
    }
    console.log(`Migrated ${players.length} players.`);

    // Create default admin
    const adminPassword = await bcrypt.hash('admin', 10);
    await Admin.create({
      username: 'admin',
      password: adminPassword
    });
    console.log('Created default admin (admin/admin).');

    await connection.end();
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
