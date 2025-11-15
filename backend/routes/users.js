const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get('/stats', auth, async (req, res) => {
  try {
    const Donation = require('../models/Donation');
    
    const user = await User.findById(req.userId);
    let stats = {};

    if (user.userType === 'donor') {
      const totalDonations = await Donation.countDocuments({ donor: req.userId });
      const availableDonations = await Donation.countDocuments({ 
        donor: req.userId, 
        status: 'available' 
      });
      const claimedDonations = await Donation.countDocuments({ 
        donor: req.userId, 
        status: 'claimed' 
      });
      const completedDonations = await Donation.countDocuments({ 
        donor: req.userId, 
        status: 'completed' 
      });

      stats = {
        totalDonations,
        availableDonations,
        claimedDonations,
        completedDonations
      };
    } else {
      const totalClaims = await Donation.countDocuments({ recipient: req.userId });
      const activeClaims = await Donation.countDocuments({ 
        recipient: req.userId, 
        status: 'claimed' 
      });
      const completedClaims = await Donation.countDocuments({ 
        recipient: req.userId, 
        status: 'completed' 
      });

      stats = {
        totalClaims,
        activeClaims,
        completedClaims
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;