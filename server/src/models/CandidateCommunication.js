const mongoose = require('mongoose');

const candidateCommunicationSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  type: {
    type: String,
    enum: ['email', 'phone', 'onsite', 'video', 'note', 'system'],
    required: true
  },
  direction: {
    type: String,
    enum: ['outbound', 'inbound', 'internal'],
    default: 'outbound'
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  contactPerson: { type: String },
  contactInfo: { type: String },
  result: { type: String },
  nextStep: { type: String },
  operator: { type: String, required: true },
  operatorRole: { type: String, enum: ['hr', 'interviewer', 'admin'], default: 'hr' },
  relatedInterviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  attachments: [{
    name: { type: String },
    url: { type: String }
  }],
  isImportant: { type: Boolean, default: false }
}, { timestamps: true });

candidateCommunicationSchema.index({ candidateId: 1 });
candidateCommunicationSchema.index({ type: 1 });
candidateCommunicationSchema.index({ operator: 1 });
candidateCommunicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CandidateCommunication', candidateCommunicationSchema);
