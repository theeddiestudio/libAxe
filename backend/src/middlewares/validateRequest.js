import mongoose from "mongoose";
import { RULES } from "../config/rules.js";


const validateRequest = (req, res, next) => {
    const {bookId, type, days} = req.body;

    if(!mongoose.isObjectIdOrHexString(bookId)) {
        return res.status(400).json({ message: "A valid book is required."});
    }

    if (type !== 'borrow' && type !== 'return') {
        return res.status(400).json({ message: "Invalid request type"})
    }

    // days is only provided for borrow requests
    if (type === 'borrow') {
        const validDays = Number.isInteger(days)
            && days >= RULES.MIN_LOAN_DAYS
            && days <= RULES.MAX_LOAN_DAYS;

        if (!validDays) {
            return res.status(400).json({ message: `Days must be whole number from ${RULES.MIN_LOAN_DAYS} to ${RULES.MAX_LOAN_DAYS}.`})
        }
    }

    next();
}

export {validateRequest};