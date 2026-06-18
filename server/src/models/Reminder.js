const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  interview: { type: mongoose.Schema.Types.Mixed, required: true },
  type: {
    type: String,
    enum: ['evaluation'],
    default: 'evaluation'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'site'],
    default: 'email'
  },
  sentAt: { type: Date },
  createdBy: { type: String, default: 'system' },
  note: { type: String },
  errorMessage: { type: String }
}, { timestamps: true });

reminderSchema.index({ interviewId: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reminder', reminderSchema);
