import mongoose from "mongoose";
import { RULES } from "../config/rules.js";

const reqSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    type: {
        type: String,
        enum: ['borrow', 'return'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'cancelled'],
        default: 'pending'
    },
    days: {
        type: Number,
        min: RULES.MIN_LOAN_DAYS,
        max: RULES.MAX_LOAN_DAYS,
        required: function () {
            return this.type === 'borrow';
        }, // only required when type is borrow
        validate: {
            validator: Number.isInteger,
            message: 'days must be a whole number'
        }
    },
    reason: {
        type: String,
        trim: true,
        maxlength: 200
    },
    decidedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    decidedAt: {
        type: Date
    },
    expireAt: {
        type: Date,
        default: () => new Date(Date.now() + RULES.PENDING_REQUEST_TTL)
    }
}, {timestamps: true});

reqSchema.index({expireAt: 1} , {expireAfterSeconds: 0});

reqSchema.index(
    {user: 1, book: 1, type: 1},
    {unique: true, partialFilterExpression: { status: 'pending' }}
);

reqSchema.index({ user: 1, createdAt: -1 });

reqSchema.index({ status: 1, type: 1, createdAt: 1});

const Request = mongoose.model('Request', reqSchema);

export default Request;