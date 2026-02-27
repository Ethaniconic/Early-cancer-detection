const express = require('express');
const router = express.Router();
const { bookAppointment, getDoctorAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/book', protect, bookAppointment);
router.get('/doctor/:doctorId', protect, getDoctorAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
