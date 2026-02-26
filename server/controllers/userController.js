const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { name, mobile, age, password, role } = req.body;

        // Validation for new schema fields
        if (!name || !mobile || !age || !password || !role) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        // Check user existence using mobile number
        const userExists = await User.findOne({ mobile });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this mobile number" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user in the database
        const user = await User.create({
            name,
            mobile,
            age,
            password: hashedPassword,
            role
        });

        if (user) {
            res.status(201).json({
                message: "User registered successfully",
                user: {
                    _id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { registerUser };