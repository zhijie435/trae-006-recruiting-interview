const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  position: { type: String, required: true },
  department: { type: String, required: true }
}, { timestamps: true });

const interviewerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String }
}, { timestamps: true });

const interviewSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  candidate: { type: candidateSchema, required: true },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interviewer', required: true },
  interviewer: { type: interviewerSchema, required: true },
  interviewTime: { type: Date, required: true },
  interviewType: {
    type: String,
    enum: ['phone', 'video', 'onsite', 'final'],
    required: true
  },
  round: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  evaluationDeadline: { type: Date, required: true },
  evaluationStatus: {
    type: String,
    enum: ['pending', 'submitted', 'overdue'],
    default: 'pending'
  }
}, { timestamps: true });

interviewSchema.index({ evaluationStatus: 1 });
interviewSchema.index({ evaluationDeadline: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
