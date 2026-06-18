const mongoose = require('mongoose');

const approvalLogSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  stepName: { type: String, required: true },
  approverName: { type: String, required: true },
  approverRole: { type: String, default: '' },
  action: {
    type: String,
    enum: ['submit', 'approve', 'reject', 'withdraw', 'resubmit', 'send', 'accept', 'decline'],
    required: true
  },
  actionText: { type: String, required: true },
  comment: { type: String, default: '' },
  operatedAt: { type: Date, default: Date.now }
}, { _id: false });

const reminderLogSchema = new mongoose.Schema({
  remindedBy: { type: String, required: true },
  reminderNote: { type: String, default: '' },
  remindedAt: { type: Date, default: Date.now }
}, { _id: false });

const offerSchema = new mongoose.Schema({
  offerNo: { type: String, required: true, unique: true },
  candidateName: { type: String, required: true },
  candidatePhone: { type: String, default: '' },
  candidateEmail: { type: String, default: '' },
  position: { type: String, required: true },
  department: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'intern'],
    default: 'full_time'
  },
  workLocation: { type: String, default: '' },

  salaryMonthly: { type: Number, min: 0 },
  salaryMonths: { type: Number, default: 13, min: 1 },
  bonus: { type: String, default: '' },
  probationMonths: { type: Number, default: 3, min: 0 },
  entryDate: { type: Date },
  remark: { type: String, default: '' },

  status: {
    type: String,
    enum: [
      'draft',
      'pending_approval',
      'approved',
      'rejected',
      'sent',
      'accepted',
      'declined',
      'withdrawn'
    ],
    default: 'draft',
    index: true
  },

  currentStep: { type: Number, default: 0 },

  approvalLogs: [approvalLogSchema],

  reminderCount: { type: Number, default: 0 },
  reminderLogs: [reminderLogSchema],

  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, { timestamps: true });

offerSchema.index({ department: 1 });
offerSchema.index({ position: 1 });
offerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);
