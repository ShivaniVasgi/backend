const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  cover_message: { type: String },
  created_at: { type: Date, default: Date.now }
});

// ensure unique application per user per job
applicationSchema.index({ job_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
