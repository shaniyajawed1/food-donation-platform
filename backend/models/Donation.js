const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  description: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  allergens: String,
  images: [String], 
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'completed', 'cancelled'], 
    default: 'available' 
  },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', donationSchema);