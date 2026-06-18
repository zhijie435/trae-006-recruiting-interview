const mongoose = require('mongoose');

const interviewerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String }
}, { timestamps: true });

interviewerSchema.index({ name: 'text' });

module.exports = mongoose.model('Interviewer', interviewerSchema);
