const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`backend running on port: ${PORT}`);
})