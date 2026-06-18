const mongoose = require('mongoose');

const scoreDimensionSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  comment: { type: String, default: '' }
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interviewer', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },

  overallScore: { type: Number, min: 1, max: 10 },
  recommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'borderline', 'no_hire', 'pending'],
    default: 'pending'
  },

  dimensions: [scoreDimensionSchema],

  strengths: { type: String, default: '' },
  weaknesses: { type: String, default: '' },
  summary: { type: String, default: '' },

  additionalNotes: { type: String, default: '' },

  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  },

  submittedAt: { type: Date },

  createdBy: { type: String, default: 'interviewer' },
  updatedBy: { type: String, default: 'interviewer' }
}, { timestamps: true });

evaluationSchema.index({ interviewId: 1 });
evaluationSchema.index({ interviewerId: 1 });
evaluationSchema.index({ status: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
