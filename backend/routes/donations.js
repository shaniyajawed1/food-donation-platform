const express = require('express');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const router = express.Router();
router.get('/available', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'available' })
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 });
    
    console.log('Available donations with donor:', donations.length); 
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-donations', auth, async (req, res) => {
  try {
    console.log('Fetching donations for user:', req.userId); 
    const donations = await Donation.find({ donor: req.userId })
      .populate('donor', 'name email phone')
      .populate('recipient', 'name email phone')
      .sort({ createdAt: -1 });
    
    console.log('My donations found:', donations.length); 
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/my-claims', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ recipient: req.userId })
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/', auth, async (req, res) => {
  try {
    const donation = new Donation({
      ...req.body,
      donor: req.userId,
      status: 'available'
    });
    await donation.save();
    await donation.populate('donor', 'name email phone');
    
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch('/:id/claim', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation is not available' });
    }

    donation.status = 'claimed';
    donation.recipient = req.userId;
    await donation.save();
    
    await donation.populate('donor', 'name email phone');
    await donation.populate('recipient', 'name email phone');

    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    if (donation.donor.toString() !== req.userId && donation.recipient?.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    donation.status = status;
    await donation.save();
    
    await donation.populate('donor', 'name email phone');
    await donation.populate('recipient', 'name email phone');

    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Backend routes/donations.js - DELETE route
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('DELETE request for donation ID:', req.params.id);
    
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      console.log('Donation not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Donation not found' });
    }

    console.log('Found donation:', donation._id);
    console.log('Donation donor:', donation.donor);
    console.log('Request user ID:', req.userId);

    if (donation.donor.toString() !== req.userId) {
      console.log('Unauthorized delete attempt');
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    console.log('Donation deleted successfully');
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;