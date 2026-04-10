const mongoose = require('mongoose');
const Player = require('./models/Player');
const dns = require('dns');

// DNS Bypass for restricted environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = 'mongodb+srv://rushimaru96_db_user:Rushi%40123@cluster0.3bcy0gm.mongodb.net/auction_db?retryWrites=true&w=majority';

async function updatePlayerImage() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const originalId = 33;
    const newImage = 'https://drive.google.com/file/d/1JtUcYvKfq13PgLzlz9ut2sHQNa4GVOgF/view?usp=sharing';
    
    // Transform the link to direct content for better loading
    let finalImage = newImage;
    if (newImage.includes('drive.google.com')) {
      const driveId = newImage.match(/\/d\/([^/]+)/)?.[1] || newImage.match(/id=([^&]+)/)?.[1];
      if (driveId) {
        finalImage = `https://lh3.googleusercontent.com/u/0/d/${driveId}`;
      }
    }

    const result = await Player.findOneAndUpdate(
      { originalId: originalId },
      { image: finalImage },
      { new: true }
    );

    if (result) {
      console.log(`Success! Updated player ${result.full_name} (ID: 33)`);
      console.log('New image URL:', finalImage);
    } else {
      console.log('Player with originalId 33 not found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

updatePlayerImage();
