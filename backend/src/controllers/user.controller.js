import Book from "../models/Book.js";
import User from "../models/User.js";
import Loan from "../models/Loan.js";
import { toMoney, getRemainingDays, getOverdueDays, calculateCost } from "../lib/cost.js";

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json(user);        
    } catch (error) {
        res.status(500).json({message: "Error in Profile page."});
    }
}

const getMyLoans = async (req,res) => {
    try {
        const now = new Date();

        const loans = await Loan.find({
            user: req.user._id,
            $or: [{ status: 'active'}, {status: 'returned', paid: false}]
        })
            .sort({dueAt: 1})
            .populate('book', 'title author coverImage')
            .lean();
        
        const shape = (loan) => {
            const isActive = loan.status === 'active';
            const overdueDays = getOverdueDays(loan, isActive ? now : loan.returnedAt);
            

            return {
                _id: loan._id,
                book: loan.book,
                status: loan.status,
                days: loan.days,
                borrowedAt: loan.borrowedAt,
                dueAt: loan.dueAt,
                returnedAt: loan.returnedAt,
                pricePerDay: loan.pricePerDay,
                overduePerDay: loan.overduePerDay,
                daysRemaining: isActive ? getRemainingDays(loan, now) : 0,
                overdueDays,
                overdue: overdueDays > 0,
                cost: isActive ? calculateCost(loan, now) : loan.totalCost
            };
        };

        const active = loans.filter((item) => item.status === 'active').map(shape);
        const unpaid = loans
            .filter((item) => item.status === 'returned')
            .sort((a,b) => a.returnedAt - b.returnedAt)
            .map(shape);

        const sum = (list) => toMoney(list.reduce((total, item) => total + item.cost, 0));

        res.status(200).json({
            active,
            unpaid,
            totalAccruing: sum(active),
            totalUnpaid: sum(unpaid)
        })

    } catch (error) {
        console.log("Erorr fetching loans", error);
        res.status(500).json({message: "Error while fetching loans."})
    }
}

export {getProfile, getMyLoans};