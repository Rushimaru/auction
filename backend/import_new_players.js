const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// DNS Bypass for some network environments
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
        // The data is expected to be tab-separated. 
        // If the user's input was copied verbatim, it should preserve tabs or spaces.
        // We'll try to split by tab first, if length < 2, split by multiple spaces.
        let cols = lines[i].split('\t');
        if (cols.length < 5) {
            cols = lines[i].split(/\s{2,}/); // Split by 2 or more spaces
        }

        if (cols.length < 2) continue;

        // Mapping based on the provided list format:
        // 0: Name, 1: Mobile, 2: Age, 3: Village, 4: Zone, 5: Role, 6: Date, 7: Fees, 8: Image
        
        const fullName = (cols[0] || '').trim();
        const mobile = parseInt((cols[1] || '').replace(/\s+/g, '')) || 0;
        const age = parseInt((cols[2] || '').trim()) || 0;
        const village = (cols[3] || '').trim();
        const zone = (cols[4] || '').trim();
        const role = (cols[5] || '').trim();
        
        let feesRaw = (cols[7] || '').trim();
        const fees = (feesRaw === '-' || feesRaw === '') ? 0 : (parseInt(feesRaw) || 0);

        let image = (cols[8] || '').trim();
        // Convert Google Drive link to direct thumbnail/preview
        if (image.includes('drive.google.com')) {
          const driveId = image.match(/id=([^&]+)/)?.[1] || image.match(/\/d\/([^/]+)/)?.[1];
          if (driveId) {
            image = `https://lh3.googleusercontent.com/u/0/d/${driveId}`;
          }
        } else if (image.length < 5) {
          // If image is a single char placeholder (like 'r', 'e', 'm', 'o', 'v')
          image = ''; 
        }

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
