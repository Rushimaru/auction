const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auction');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Config
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_db';
mongoose.connect(uri)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auction', auctionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
