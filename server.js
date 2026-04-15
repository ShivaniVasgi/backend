require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const usersRoutes = require('./routes/users');
const otpRoutes = require('./routes/otp');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection failed', err);
        process.exit(1);
    }
};

connectDB();

// Routes
// Note: Frontend uses paths like /auth/login.php, /jobs/index.php. 
// For seamless migration without modifying every fetch call on the frontend deeply,
// we can mount our express routers at matching prefixes:
app.use('/api/auth', authRoutes); // intercepts /api/auth/login.php, /api/auth/register.php
app.use('/api/jobs', jobsRoutes); // intercepts /api/jobs/index.php, /api/jobs/create.php
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/otp', otpRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
