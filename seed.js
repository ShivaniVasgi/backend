require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('admin', salt);
        
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        if (!existingAdmin) {
            const adminUser = new User({
                name: 'Super Admin',
                email: 'admin@test.com',
                password,
                role: 'admin',
                status: 'accepted'
            });
            await adminUser.save();
            console.log('Super Admin user created successfully.');
        } else {
            console.log('Admin user already exists. Overriding password to "admin".');
            existingAdmin.password = password;
            await existingAdmin.save();
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
