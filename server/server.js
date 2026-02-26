const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const predictRoutes = require('./routes/predictRoutes');
const { connectDB } = require('./config/db');
dotenv.config();

connectDB(); // database connection

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api/predict', predictRoutes);
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`backend running on port: ${PORT}`);
})