import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
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
    days: {
        type: Number,
        required: true,
        min: 1
    },
    borrowedAt: {
        type: Date,
        default: Date.now
    },
    dueAt: {
        type: Date,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true,
        min: 0
    },
    overduePerDay: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'returned'],
        default: 'active'
    },
    returnedAt: {
        type: Date
    },
    totalCost: {
        type: Number,
        min: 0
    },
    paid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expireAt: {
        type: Date
    }
}, {timestamps: true});

loanSchema.index({expireAt: 1} , {expireAfterSeconds: 0});

loanSchema.index(
    {user: 1, book: 1},
    {unique: true, partialFilterExpression: { status: 'active' }}
);

loanSchema.index({ status: 1, paid: 1, returnedAt: 1});
loanSchema.index({ user: 1, status:1, dueAt: 1})

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;