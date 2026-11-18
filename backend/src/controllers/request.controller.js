import mongoose from "mongoose";
import Request from "../models/Request.js";
import { DAY, RULES } from "../config/rules.js";
import Book from "../models/Book.js";
import { checkBorrowRules } from "../lib/loanRules.js";
import Loan from "../models/Loan.js";
import { matchUsers } from "../lib/search.js";
import User from "../models/User.js";
import { calculateCost } from "../lib/cost.js";
import { notifyDecision, notifyNewRequest } from "../lib/notify.js";
import { fail } from '../lib/errors.js';

const STATUSES = ['pending', 'approved', 'denied', 'cancelled'];
const MAX_LIST = 50;

// added expiry date after admin has resolved the request
const resolvedExpiry = () => new Date(Date.now() + RULES.RESOLVED_REQUEST_TTL);

const createRequest = async (req, res) => {
    try {
        const {bookId, type, days} = req.body;
        const userId = req.user._id;

        if (type === 'borrow') {
            const book = await Book.findById(bookId);
            if (!book) return res.status(404).json({ message: "Book not found"});

            const problem = await checkBorrowRules(userId, book);
            if(problem) return res.status(problem.status).json({message: problem.message});
        
        } else {
            const hasLoan = await Loan.exists({user: userId, book: bookId, status: 'active'});
            if (!hasLoan) return res.status(400).json({ message: 'Book not borrowed.' });
        }

        const request = await Request.create({
            user: userId,
            book: bookId,
            type,
            days: type === 'borrow' ? days : undefined
        });

        notifyNewRequest(request, req.user.username);

        res.status(201).json(request);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({message: 'You have already a pending request for same book.'});
        } // 11000 is MongoDb version of duplication entry
        
        console.log('Error creating request0', error);
        res.status(500).json({message: "Eorror while creating request."});
    }
}

const cancelRequest = async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ message: "Invalid request id"});
        }

        const request = await Request.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
                status: 'pending'
            },
            {
                status: 'cancelled',
                decidedAt: new Date(),
                expireAt: new Date(Date.now() + RULES.RESOLVED_REQUEST_TTL)
            }
        );

        if (!request) return res.status(404).json({ message: "No pending request found."});

        res.status(200).json({message: 'Request cancelled.'});

    } catch (error) {
        console.log('Error cancelling request', error);
        res.status(500).json({message: "Error while cancelling request."});
    }
}

const getMyRequests = async (req, res) => {
    try {
        const filter = {user: req.user._id};
        if (STATUSES.includes(req.query.status)) filter.status = req.query.status;

        const requests = await Request.find(filter)
            .sort({ createdAt: -1})
            .populate('book', 'title coverImage');

        res.status(200).json(requests);
    } catch (error) {
        console.log('Error fetching requests', error);
        res.status(500).json({message: "Error while fetching requests."});
    }
}

// admin controllers are below:
const listRequests = async (req,res) => {
    try {
        const {type, search} = req.query;
        if (type !== 'borrow' && type !== 'return') {
            return res.status(400).json({message: 'Invalid request type'})
        }

        const filter = {
            status: 'pending',
            type,
            expireAt: { $gt: new Date()}
        };

        const userMatch = await matchUsers(search);
        if (userMatch) filter.user = userMatch;

        const requests = await Request.find(filter)
            .sort({createdAt: 1})
            .limit(MAX_LIST)
            .populate('user', 'username email')
            .populate('book', 'title coverImage stock');

        res.status(200).json(requests);

    } catch (error) {
        console.log("Error listing requests", error);
        res.status(500).json({message: "Error while listing requests."});
    }
}

const approveBorrow = async (reqId, adminId, session) => {
    const now = new Date();

    //claim the request. so that two admins can never approve twice
    const request = await Request.findOneAndUpdate(
        {
            _id: reqId, status: 'pending', type: 'borrow', expireAt: { $gt: now }
        },
        {
            status: 'approved',
            decidedBy: adminId,
            decidedAt: now,
            expireAt: resolvedExpiry()
        },
        {
            session, returnDocument: 'after'
        }
    )

    if (!request) throw fail(409, 'This request is no longer pending.');

    // check the rules again if anything has changed since user asked
    const book = await Book.findById(request.book).session(session);
    if (!book) throw fail(problem.status, problem.message);

    // take one stock down
    const shelf = await Book.updateOne(
        { _id: book._id, stock: {$gt: 0}},
        {$inc: {stock: -1}, $addToSet: {reservedBy: request.user}},
        {session}
    );
    if (shelf.modifiedCount === 0) throw fail(409, "This book is out of stock.");

    // write down the loan and copy today's prices into it
    const [loan] = await Loan.create([{
        user: request.user,
        book: book._id,
        days: request.days,
        borrowedAt: now,
        dueAt: new Date(now.getTime() + request.days * DAY),
        pricePerDay: book.pricePerDay,
        overduePerDay: book.overduePerDay
    }], {session});

    // update user's list of loaned books
    await User.updateOne(
        {_id: request.user},
        { $addToSet: {reservedBooks: book._id}},
        {session}
    )

    return {request, loan}
};

const approveReturn = async (reqId, adminId, session) => {
    const now = new Date();

    //claim the request. so that two admins can never approve twice
    const request = await Request.findOneAndUpdate(
        {
            _id: reqId, status: 'pending', type: 'return', expireAt: { $gt: now }
        },
        {
            status: 'approved',
            decidedBy: adminId,
            decidedAt: now,
            expireAt: resolvedExpiry()
        },
        {
            session, returnDocument: 'after'
        }
    )

    if (!request) throw fail(409, 'This request is no longer pending.');

    // check active loan on the book and freeze the final price
    const loan = await Loan.findOne({
        user: request.user, book: request.book, status: 'active'
    }).session(session);
    if (!loan) throw fail(409, "No active loan on this book.");

    loan.status = 'returned';
    loan.returnedAt = now;
    loan.totalCost = calculateCost(loan, now);

    // if loan is nothing to pay, it is alrady settled
    if (loan.totalCost === 0) {
        loan.paid = true;
        loan.paidAt = now;
        loan.expireAt = new Date(now.getTime() + RULES.PAID_LOAN_TIL);
    }
    await loan.save({session});

    // update book db after approval
    await Book.updateOne(
        {_id: request.book},
        { $inc: {stock : 1}, $pull: {reservedBy: request.user}},
        {session}
    )

    // update user's list of loaned books
    await User.updateOne(
        {_id: request.user},
        { $pull: {reservedBooks: request.book}},
        {session}
    )

    return {request, loan}
};

const approveRequest = async (req,res) => {
    try {
        if(!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({message: 'Invalid request id.'});
        }

        const found = await Request.findById(req.params.id).select('type');
        if (!found) return res.status(404).json({message: 'Request not found.'});

        const work = found.type === 'borrow' ? approveBorrow : approveReturn;
        
        // transactional work is done here
        const {request, loan} = await mongoose.connection.transaction(
            (session) => work(req.params.id, req.user._id, session)
        );

        notifyDecision(request, 'approved');

        res.status(200).json({message: "Request approved." , request, loan});

    } catch (error) {
        console.log("Error approving request", error);
        res.status(500).json({message: "Error while approving request."});
    }
}

const denyRequest = async (req,res) => {
    try {
        if(!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({message: 'Invalid request id.'});
        }

        const now = new Date();
        const update = {
            status: 'denied',
            decidedBy: req.user._id,
            decidedAt: now,
            expireAt: resolvedExpiry()
        };

        const reason = typeof req.body?.reason === 'string'
            ? req.body.reason.trim().slice(0,200)
            : ''
        
        if (reason) update.reason = reason;

        const request = await Request.findOneAndUpdate(
            {_id: req.params.id, status: 'pending', expireAt: {$gt: now}},
            update,
            {returnDocument: 'after'}
        );
        
        if(!request) return res.status(409).json({message: 'This request is no longer pending.'})

        notifyDecision(request, 'denied');

        res.status(200).json({message: 'Request denied.', request});

    } catch (error) {
        console.log("Error denying request", error);
        res.status(500).json({message: "Error while denying request."});
    }
}

export {createRequest, getMyRequests, cancelRequest, listRequests, approveRequest, denyRequest}