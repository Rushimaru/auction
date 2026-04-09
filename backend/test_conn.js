const mongoose = require('mongoose');
const dns = require('dns');

// Bypass local DNS if SRV fails
dns.setServers(['8.8.8.8', '8.8.4.4']);

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const host = process.env.MONGO_HOST || 'cluster0.3bcy0gm.mongodb.net';
const db = process.env.MONGO_DB || 'auction_db';

if (!user || !pass) {
  console.error('❌ Missing required environment variables: MONGO_USER and MONGO_PASS');
  process.exit(1);
}

// URL encode the password
const encodedPass = encodeURIComponent(pass);
const uri = `mongodb+srv://${user}:${encodedPass}@${host}/${db}?retryWrites=true&w=majority`;

console.log('Testing connection to:', host);

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connection Successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  });
