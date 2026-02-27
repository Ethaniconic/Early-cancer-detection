const Appointment = require('../models/Appointment');
const User = require('../models/userModel');

const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, risk_level, risk_score, top_factors } = req.body;
        const patientId = req.user?.id || req.body.patientId; // Assuming jwt auth sets req.user

        if (!doctorId || !date || !time) {
            return res.status(400).json({ success: false, message: 'Doctor, date, and time are required.' });
        }

        const newAppointment = await Appointment.create({
            patientId,
            doctorId,
            date,
            time,
            risk_level,
            risk_score,
            top_factors
        });

        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        console.error('Book Appointment Error:', error);
        res.status(500).json({ success: false, message: 'Failed to book appointment' });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await Appointment.find({ doctorId })
            .populate('patientId', 'name age mobile bloodGroup currentMedications pastSurgeries knownAllergies familyHistory currentSymptoms')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error('Fetch Appointments Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, data: appointment });
    } catch (error) {
        console.error('Update Appointment Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};

module.exports = { bookAppointment, getDoctorAppointments, updateAppointmentStatus };
