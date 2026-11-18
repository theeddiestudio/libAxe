import mongoose from "mongoose";
import { RULES } from "../config/rules.js";

const notifSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['new_request', 'approved', 'denied'],
        required: true
    },
    requestType: {
        type: String,
        enum: ['borrow', 'return'],
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 300
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    read: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        default: () => new Date(Date.now() + RULES.NOTIFICATION_TIL)
    }
}, {timestamps: true});

notifSchema.index({ expireAt: 1} , {expireAfterSeconds: 0});
notifSchema.index({ user: 1, createdAt: -1});

const Notification = mongoose.model('Notification', notifSchema);

export default Notification;
