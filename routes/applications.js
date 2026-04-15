const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    let query = {};
    if (user_id) {
      query.user_id = user_id;
    }

    const applications = await Application.find(query).populate('job_id').populate('user_id').sort({ created_at: -1 }).lean();
    
    const mappedApps = applications.map(a => {
      let jobTitle = a.job_id ? a.job_id.title : 'Deleted Job';
      let applicantName = a.user_id ? a.user_id.name : 'Unknown User';
      let actualJobId = a.job_id ? a.job_id._id : null;
      let actualUserId = a.user_id ? a.user_id._id : null;

      return {
        id: a._id.toString(),
        job_id: actualJobId,
        user_id: actualUserId,
        status: a.status,
        cover_message: a.cover_message,
        created_at: a.created_at,
        job_title: jobTitle,
        applicant_name: applicantName
      };
    });

    res.json({ success: true, applications: mappedApps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/applications/apply
router.post('/apply', async (req, res) => {
  try {
    const { job_id, user_id, cover_message } = req.body;

    const existingApp = await Application.findOne({ job_id, user_id });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    const newApp = new Application({
      job_id, user_id, cover_message
    });
    await newApp.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Already applied' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/applications/update_status
router.post('/update_status', async (req, res) => {
  try {
    const { id, status } = req.body;
    await Application.findByIdAndUpdate(id, { status });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
