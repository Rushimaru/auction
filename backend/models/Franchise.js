const mongoose = require('mongoose');

const FranchiseSchema = new mongoose.Schema({
  originalId: { type: Number }, // To map from MySQL
  frenchises_name: { type: String, required: true },
  owner: { type: String },
  logo: { type: String },
  total_amount: { type: Number, default: 7500 },
  remaining_amount: { type: Number, default: 7500 },
  total_players: { type: Number, default: 0 },
  username: { type: String, unique: true }, // generated from name for login
  password: { type: String } // hashed password
}, { timestamps: true });

module.exports = mongoose.model('Franchise', FranchiseSchema);
