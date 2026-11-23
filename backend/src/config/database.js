import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connectDatabase = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}`);
        console.log("Database successfully connected");
    } catch (error) {
        console.error("Error on database connection", error);
        process.exit(1);
    }
}