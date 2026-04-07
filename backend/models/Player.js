const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  originalId: { type: Number }, // To map from MySQL
  full_name: { type: String, required: true },
  mobile_no: { type: Number },
  age: { type: Number },
  village_name: { type: String },
  zone_name: { type: String },
  playing_role: { type: String },
  image: { type: String },
  email: { type: String },
  fees: { type: Number },
  franchise_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchise', default: null },
  sold_price: { type: Number, default: 0 },
  unsold_status: { type: Number, default: 0 } // 0 = default, 1 = unsold
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
