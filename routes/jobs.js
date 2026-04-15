const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ created_at: -1 }).lean();
    
    // map _id to id
    const mappedJobs = jobs.map(j => ({
      ...j,
      id: j._id.toString()
    }));
    
    res.json({ success: true, jobs: mappedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// For proper REST we might just use '/' but AppContext requests /jobs/index.php
// We will route /api/jobs/index.php here if configured, or just handle /index.php inside /api/jobs

const User = require('../models/User');

// POST /api/jobs/create
router.post('/create', async (req, res) => {
  try {
    const {
      employer_id, employer_name, title, description,
      salary, working_hours
    } = req.body;

    let locality = req.body.locality;
    let city = req.body.city;
    let state = req.body.state;
    let lat = req.body.lat;
    let lng = req.body.lng;

    // Auto-fill from employer KYC if missing
    const employer = await User.findById(employer_id);
    if (employer && employer.company_location) {
        locality = locality || employer.company_location.address;
        city = city || employer.company_location.city;
        state = state || employer.company_location.state;
        lat = lat || employer.company_location.lat;
        lng = lng || employer.company_location.lng;
    }

    const newJob = new Job({
      employer_id, employer_name, title, description,
      locality, city, state, lat, lng, salary, working_hours
    });

    await newJob.save();
    
    res.json({ success: true, message: 'Job created effectively' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
