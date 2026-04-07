const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Franchise = require('../models/Franchise');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// @route POST api/auth/login
// @desc Authenticate user (admin or franchise) & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if Admin
    let user = await Admin.findOne({ username });
    let role = 'admin';

    if (!user) {
      // Check if Franchise
      user = await Franchise.findOne({ username });
      role = 'franchise';
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role, franchiseId: role === 'franchise' ? user.id : null });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/auth/user
// @desc Get user data
router.get('/user', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const user = await Admin.findById(req.user.id).select('-password');
      return res.json({ ...user._doc, role: 'admin' });
    } else {
      const user = await Franchise.findById(req.user.id).select('-password');
      return res.json({ ...user._doc, role: 'franchise' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
