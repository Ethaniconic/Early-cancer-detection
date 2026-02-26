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

const loginUser = async (req, res) => {
    try {
        // Using mobile for login since it's unique in the schema
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                message: "Please fill all the details"
            });
        }

        // Find user by mobile number
        const user = await User.findOne({ mobile });

        // Check if user exists and password matches
        if (user && (await bcrypt.compare(password, user.password))) {
            // Generate JWT Token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '30d' }
            );

            res.json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    role: user.role
                },
                token
            });
        } else {
            res.status(401).json({ message: "Invalid mobile number or password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { registerUser, loginUser };