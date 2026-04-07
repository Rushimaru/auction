const mongoose = require('mongoose');
const dns = require('dns');

// Bypass local DNS if SRV fails
dns.setServers(['8.8.8.8', '8.8.4.4']);

const user = 'rushimaru96_db_user';
const pass = 'Rushi@123';
const host = 'cluster0.3bcy0gm.mongodb.net';
const db = 'auction_db';

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
