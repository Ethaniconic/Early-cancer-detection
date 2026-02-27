const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const findDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const u = await User.findOneAndUpdate(
            { name: /Sarah/i },
            { licenseNumber: 'DOC7777', mobile: '1234567890', password },
            { new: true }
        );

        if (u) {
            console.log(`Updated Sarah Jenkins. ID: ${u.licenseNumber}, Password: password123`);
        } else {
            console.log("Sarah Jenkins not found for update");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findDoctors();
