const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// DNS Bypass
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Player = require('./models/Player');

const MONGO_URI = 'mongodb+srv://rushimaru96_db_user:Rushi%40123@cluster0.3bcy0gm.mongodb.net/auction_db?retryWrites=true&w=majority';

async function importPlayers() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Remove old players
    console.log('Clearing old player data...');
    await Player.deleteMany({});
    console.log('Old records cleared.');

    const dataPath = path.join(__dirname, 'players_raw.txt');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const lines = rawData.split('\n').filter(line => line.trim() !== '');

    const players = [];
    let currentId = 1;

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split('\t'); // Split by tabs
        if (cols.length < 2) continue; // Skip empty/invalid lines

        // Mapping
        // 0:Timestamp, 1:Full Name, 2:Mobile, 3:Age, 4:Village, 5:Zone, 6:Role, 7:PaymentCode, 8:Image, 9:Fee, 10:Date, 11:Paid
        const fullName = (cols[1] || '').trim();
        const mobile = parseInt((cols[2] || '').replace(/\s+/g, '')) || 0;
        const age = parseInt((cols[3] || '').trim()) || 0;
        const village = (cols[4] || '').trim();
        const zone = (cols[5] || '').trim();
        const role = (cols[6] || '').trim();
        
        let image = (cols[8] || '').trim();
        // Convert Google Drive link to direct thumbnail/preview
        if (image.includes('drive.google.com')) {
          // Format: https://drive.google.com/open?id=ID or https://drive.google.com/file/d/ID/view
          const driveId = image.match(/id=([^&]+)/)?.[1] || image.match(/\/d\/([^/]+)/)?.[1];
          if (driveId) {
            image = `https://lh3.googleusercontent.com/u/0/d/${driveId}`;
          }
        } else if (!image) {
          image = ''; // Frontend will handle default icon
        }

        const fees = 500; // Default fee based on your text

        players.push({
          originalId: currentId++,
          full_name: fullName,
          mobile_no: mobile,
          age: age,
          village_name: village,
          zone_name: zone,
          playing_role: role,
          image: image,
          fees: fees,
          sold_price: 0,
          unsold_status: 0,
          franchise_id: null
        });
    }

    console.log(`Inserting ${players.length} players...`);
    await Player.insertMany(players);
    console.log('Import successful!');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

importPlayers();
