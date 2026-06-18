const mongoose = require('mongoose');

const conflictInterviewSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String },
  interviewerName: { type: String, required: true },
  interviewerEmail: { type: String },
  interviewTime: { type: Date, required: true },
  interviewType: { type: String },
  round: { type: Number },
  position: { type: String },
  department: { type: String }
}, { _id: false });

const communicationRecordSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  type: {
    type: String,
    enum: ['note', 'email_sent', 'call', 'meeting'],
    default: 'note'
  },
  content: { type: String, required: true },
  operator: { type: String, required: true },
  target: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const scheduleConflictSchema = new mongoose.Schema({
  conflictType: {
    type: String,
    enum: ['interviewer_schedule', 'candidate_schedule', 'room_conflict', 'multi_interview_conflict'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'communicating', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  title: { type: String, required: true },
  description: { type: String },
  interviews: [conflictInterviewSchema],
  roomName: { type: String },
  assignee: { type: String, default: 'HR' },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolution: { type: String },
  communications: [communicationRecordSchema],
  reminderCount: { type: Number, default: 0 },
  lastReminderAt: { type: Date },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

scheduleConflictSchema.index({ conflictType: 1 });
scheduleConflictSchema.index({ status: 1 });
scheduleConflictSchema.index({ priority: 1 });
scheduleConflictSchema.index({ createdAt: -1 });
scheduleConflictSchema.index({ 'interviews.interviewerName': 1 });
scheduleConflictSchema.index({ 'interviews.candidateName': 1 });

module.exports = mongoose.model('ScheduleConflict', scheduleConflictSchema);
