const express = require('express');
const router = express.Router();
const axios = require('axios');

const FAST2SMS_API_KEY = 'MAf69Fl1ojcvEmJb5kaOzexnNrGY4BItTP0usZ8HXRW7VhUdQq8psVm63gaUwzrxbPd0vNSHtYA2FkIf';

// In-memory store for OTPs (phone: { otp, timestamp })
// In production, use Redis or MongoDB for expiration
const otpStore = {};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// POST /api/otp/send
router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    const otp = generateOTP();

    try {
      await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: {
          authorization: FAST2SMS_API_KEY,
          variables_values: otp,
          route: 'otp',
          numbers: phone
        }
      });
      otpStore[phone] = { otp, timestamp: Date.now() };
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (apiError) {
      console.warn('Fast2SMS failed, falling back to Mock OTP:', apiError.message);
      otpStore[phone] = { otp, timestamp: Date.now() };
      res.json({ 
        success: true, 
        message: 'OTP Sent (Mock Fallback)', 
        mockOtp: otp 
      });
    }
  } catch (error) {
    console.error('OTP Send Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: 'Server occurred while sending OTP' });
  }
});

// POST /api/otp/verify
router.post('/verify', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });

  const record = otpStore[phone];
  if (!record) return res.status(400).json({ success: false, message: 'No OTP requested for this number' });

  if (Date.now() - record.timestamp > 10 * 60 * 1000) { // 10 mins expiry
    return res.status(400).json({ success: false, message: 'OTP Expired' });
  }

  if (record.otp === otp) {
    delete otpStore[phone];
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

module.exports = router;
