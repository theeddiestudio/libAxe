const DAY = 24 * 60 * 60 * 1000; // 1 day in milisecond

const RULES = Object.freeze({
    MIN_LOAN_DAYS: 1,
    MAX_LOAN_DAYS: 30,
    MAX_ACTIVE_LOANS: 10,
    BLOCK_IF_OVERDUE: true,
    BLOCK_IF_UNPAID: false,
    PENDING_REQUEST_TTL: 5 * DAY,
    RESOLVED_REQUEST_TTL: 3 * DAY,
    PAID_LOAN_TIL: 7*DAY,
    NOTIFICATION_TIL: 30 * DAY
});

export {DAY, RULES};