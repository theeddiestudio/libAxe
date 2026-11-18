import { DAY } from "../config/rules.js";

const toMoney = (amt) => Math.round(amt * 100) / 100;

const getOverdueDays = (loan, at = new Date()) => {
    const lateMs = at.getTime() - loan.dueAt.getTime();
    return lateMs > 0 ? Math.ceil(lateMs / DAY) : 0;
}

const getRemainingDays = (loan, at= new Date()) => {
    const leftMs = loan.dueAt.getTime() - at.getTime();
    return leftMs > 0 ? Math.ceil(leftMs / DAY) : 0;
}

const calculateCost = (loan, at= new Date()) => {
    const base = loan.days * loan.pricePerDay;
    const late = getOverdueDays(loan, at) * loan.overduePerDay;
    return toMoney(base + late);
}

export {toMoney, getOverdueDays, getRemainingDays, calculateCost}