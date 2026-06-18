const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  position: { type: String, required: true },
  department: { type: String, required: true }
}, { timestamps: true });

candidateSchema.index({ name: 'text' });
candidateSchema.index({ department: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
