const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Route Imports
const userRoutes = require('./routes/userRoutes');
const predictRoutes = require('./routes/predictRoutes');
const patientRoutes = require('./routes/patients');
const assessmentRoutes = require('./routes/assessments');
const metricsRoutes = require('./routes/metrics');
const validationRoutes = require('./routes/validation');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Utilities/Config
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
dotenv.config();

connectDB(); // database connection

app.use(cors());
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10mb' })); // Body parser limit

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routers
app.use('/api', userRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/model-metrics', metricsRoutes);
app.use('/api/validation-framework', validationRoutes);
app.use('/api/appointments', appointmentRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    logger.info(`Backend running on port: ${PORT}`);
    console.log(`backend running on port: ${PORT}`);
});