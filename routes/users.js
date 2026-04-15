const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 }).lean();
    
    // map _id to id
    const mappedUsers = users.map(u => ({
      ...u,
      id: u._id.toString()
    }));
    
    res.json({ success: true, users: mappedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.status = status;
    await user.save();
    
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id/kyc/:docType
router.get('/:id/kyc/:docType', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'employer' || !user.kyc) {
            return res.status(404).send('Not found');
        }

        const docType = req.params.docType; // 'aadhar' or 'photo'
        let filePath = null;

        if (docType === 'aadhar') filePath = user.kyc.aadhar_doc_path;
        else if (docType === 'photo') filePath = user.kyc.photo_doc_path;

        if (!filePath) return res.status(404).send('Document not uploaded');

        const fs = require('fs');
        const { decryptBuffer } = require('../utils/cryptoUtils');

        if (!fs.existsSync(filePath)) {
             return res.status(404).send('File missing on disk');
        }

        const encryptedData = fs.readFileSync(filePath);
        const decryptedData = decryptBuffer(encryptedData);

        if (!decryptedData) return res.status(500).send('Failed to decrypt');

        res.setHeader('Content-Type', 'image/jpeg'); // Assuming images are primarily JPEG/PNG. You can use 'application/octet-stream' or detect magic bytes for robust code.
        res.send(decryptedData);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
