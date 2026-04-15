const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employer_name: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  locality: { type: String },
  city: { type: String },
  state: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  salary: { type: String },
  working_hours: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
