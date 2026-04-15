const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { encryptBuffer } = require('../utils/cryptoUtils');

// Configure multer for memory storage initially (so we can encrypt buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/auth/register
router.post('/register', upload.fields([
  { name: 'aadhar_doc', maxCount: 1 },
  { name: 'photo_doc', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, role, phone_verified, phone, company_name, company_location, aadhar_number } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      status: role === 'employer' ? 'pending' : 'accepted',
      phone: phone || ''
    });

    // If employer KYC fields are present
    if (role === 'employer') {
      newUser.company_name = company_name;
      if (company_location) {
          try {
              newUser.company_location = JSON.parse(company_location);
          } catch(e) {}
      }

      newUser.kyc = {
        aadhar_number: aadhar_number,
        phone_verified: phone_verified === 'true'
      };

      // Encrypt and save files if they exist
      if (req.files && req.files['aadhar_doc']) {
        const aadharBuffer = req.files['aadhar_doc'][0].buffer;
        const encryptedAadhar = encryptBuffer(aadharBuffer);
        const aadharPath = path.join(__dirname, '..', 'uploads', `aadhar_${Date.now()}.enc`);
        fs.writeFileSync(aadharPath, encryptedAadhar);
        newUser.kyc.aadhar_doc_path = aadharPath;
      }

      if (req.files && req.files['photo_doc']) {
        const photoBuffer = req.files['photo_doc'][0].buffer;
        const encryptedPhoto = encryptBuffer(photoBuffer);
        const photoPath = path.join(__dirname, '..', 'uploads', `photo_${Date.now()}.enc`);
        fs.writeFileSync(photoPath, encryptedPhoto);
        newUser.kyc.photo_doc_path = photoPath;
      }
      
      // Mock Aadhar API check right here
      // E.g. Check if Aadhar is 12 digits, else it is "invalid"
      if (aadhar_number && aadhar_number.length !== 12) {
          return res.status(400).json({ success: false, message: 'Aadhar verification failed (Mock API): Must be exactly 12 digits.' });
      }
    }

    await newUser.save();
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'accepted' && user.role !== 'admin') {
       return res.status(401).json({ success: false, message: 'Account is not accepted yet' });
    }

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    res.json({ success: true, user: userPayload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/logout
router.get('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
