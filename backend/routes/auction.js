const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Franchise = require('../models/Franchise');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
};

// @route GET api/auction/franchises
// @desc Get all franchises summary
// @access Public
router.get('/franchises', async (req, res) => {
  try {
    const franchises = await Franchise.find().select('-password');
    res.json(franchises);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route GET api/auction/franchises/:id
// @desc Get single franchise with their purchased players
// @access Public
router.get('/franchises/:id', async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id).select('-password');
    if (!franchise) return res.status(404).json({ msg: 'Franchise not found' });
    
    const players = await Player.find({ franchise_id: req.params.id });
    res.json({ franchise, players });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route GET api/auction/players/all
// @desc Get all players (for public/franchise panel)
// @access Public
router.get('/players/all', async (req, res) => {
  try {
    const players = await Player.find().populate('franchise_id', 'frenchises_name logo');
    res.json(players);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route GET api/auction/players/roles
// @desc Get all distinct playing roles
// @access Admin
router.get('/players/roles', auth, isAdmin, async (req, res) => {
  try {
    const roles = await Player.distinct('playing_role');
    res.json(roles);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route GET api/auction/players/next
// @desc Get next unsold player
// @access Admin
router.get('/players/next', auth, isAdmin, async (req, res) => {
  try {
    const query = { franchise_id: null, unsold_status: 0 };
    if (req.query.role) query.playing_role = req.query.role;
    
    const player = await Player.findOne(query);
    res.json(player);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route POST api/auction/players/sell
// @desc Sell player to a franchise
// @access Admin
router.post('/players/sell', auth, isAdmin, async (req, res) => {
  const { player_id, franchise_id, price } = req.body;
  
  try {
    const franchise = await Franchise.findById(franchise_id);
    if (!franchise) return res.status(404).json({ msg: 'Franchise not found' });
    
    if (franchise.remaining_amount < price) {
       return res.status(400).json({ msg: 'Not enough budget' });
    }

    const player = await Player.findById(player_id);
    if (!player) return res.status(404).json({ msg: 'Player not found' });

    // Update Player
    player.franchise_id = franchise_id;
    player.sold_price = price;
    player.unsold_status = 0;
    await player.save();

    // Update Franchise
    franchise.remaining_amount -= price;
    franchise.total_players += 1;
    await franchise.save();

    res.json({ player, franchise });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/auction/players/unsold
// @desc Mark player as unsold
// @access Admin
router.post('/players/unsold', auth, isAdmin, async (req, res) => {
  const { player_id } = req.body;
  try {
    const player = await Player.findById(player_id);
    if (!player) return res.status(404).json({ msg: 'Player not found' });

    player.unsold_status = 1;
    await player.save();

    res.json(player);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
