const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employer', 'user'], default: 'user' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  phone: { type: String },
  address: { type: String },
  age: { type: Number },
  gender: { type: String },
  skills: { type: String },
  experience: { type: String },
  job_description_info: { type: String },
  company_name: { type: String },
  company_location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  kyc: {
    aadhar_number: { type: String },
    aadhar_doc_path: { type: String },
    photo_doc_path: { type: String },
    phone_verified: { type: Boolean, default: false }
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
