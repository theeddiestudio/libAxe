import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import { RULES } from "../config/rules.js";

const MAX_LIST = 50;

const listLoans = async(req, res) => {
    try {
        const paid = req.query.paid === 'true';
        const filter = { status: 'returned', paid};

        const userMatch = await matchUsers(req.query.search);
        if (userMatch) filter.user = userMatch;

        const loans = await Loan.find(filter)
            .sort(paid ? {paidAt: -1} : {returnedAt: 1})
            .limit(MAX_LIST)
            .populate('user', 'username email')
            .populate('book', 'title coverImage');
        
        res.status(200).json(loans);

    } catch (error) {
        console.log("Error while listing loans", error);
        res.status(500).json({message: 'Error while listing loans'});
    }
}

const payLoan = async(req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ message: 'Invalid loan id.' });
        }

        const now = new Date();

        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, status: 'returned', paid: false},
            {
                paid: true,
                paidAt: now,
                paidBy: req.user._id,
                expireAt: new Date(now.getTime() + RULES.PAID_LOAN_TIL)
            },
            {returnDocument: 'after'}
        );

        if (!loan) return res.status(409).json({message: "This loan is not waiting for payment."});

        res.status(200).json({message: "Marked as paid.", loan});

    } catch (error) {
        console.log("Error while marking loan as paid", error);
        res.status(500).json({message: 'Error while marking loan as paid'});
    }
}

const unpayLoan = async(req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ message: 'Invalid loan id.' });
        }

        const loan = await Loan.findOneAndUpdate(
            { _id: req.params.id, status: 'returned', paid: true, totalCost: {$gt: 0}},
            {
                $set: {paid: false},
                $unset: {paidAt: 1, paidBy: 1, expireAt: 1}
            },
            {returnDocument: 'after'}
        );

        if (!loan) return res.status(409).json({message: "This loan cannot be set back to unpaid."});

        res.status(200).json({message: "Set back to unpaid.", loan});

    } catch (error) {
        console.log("Error while undoing payment", error);
        res.status(500).json({message: 'Error while undoing payment'});
    }
}

const deleteLoan = async(req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ message: 'Invalid loan id.' });
        }

        const loan = await Loan.findOneAndDelete({
            _id: req.params.id, status: 'returned', paid: true
        });

        if (!loan) return res.status(409).json({message: "Only paid loans can be deleted."});

        res.status(200).json({message: "Loan deleted."});

    } catch (error) {
        console.log("Error while deleting loan", error);
        res.status(500).json({message: 'Error while deleting loan'});
    }
}

export {listLoans, payLoan, unpayLoan, deleteLoan};