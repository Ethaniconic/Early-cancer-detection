const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URI);
        if(conn){
            console.log("Database connected successfully");
        } else {
            console.log("Could not connect to Database");
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = { connectDB };