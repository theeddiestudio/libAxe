import Loan from "../models/Loan.js";
import { RULES } from "../config/rules.js";

const checkBorrowRules = async (userId, book) => {
    if (book.stock <= 0) {
        return { status: 409, message: 'Out of stock' };
    }

    const alreadyHas = await Loan.exists({ user: userId, book: book._id, status: 'active' });
    if (alreadyHas) {
        return { status: 409, message: 'Already borrowed for this user' };
    }

    const activeCount = await Loan.countDocuments({ user: userId, status: 'active' });
    if (activeCount >= RULES.MAX_ACTIVE_LOANS) {
        return { status: 403, message: `Limit of ${RULES.MAX_ACTIVE_LOANS} books reached.` };
    }

    if (RULES.BLOCK_IF_OVERDUE) {
        const overdue = await Loan.exists({ user: userId, status: 'active', dueAt: { $lt: new Date() } });
        if (overdue) {
            return { status: 403, message: 'Return overdue books to borrow more' };
        }
    }

    // if (RULES.BLOCK_IF_UNPAID) {
    //     const unpaid = await Loan.exists({ user: userId, status: 'returned', paid: false });
    //     if (unpaid) {
    //         return { status: 403, message: 'Unpaid fees must be settled first.' };
    //     }
    // }

    return null;
} 

export {checkBorrowRules};