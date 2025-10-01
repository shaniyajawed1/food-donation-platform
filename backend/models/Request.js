const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);