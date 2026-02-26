const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = users.find((user) => user.email === email);
    if (user) {
        return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
}

module.exports = { registerUser }