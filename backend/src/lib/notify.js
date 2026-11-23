import Book from '../models/Book.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendToUser } from './sse.js';

const MAX_MESSAGES = 300;
const clipMessage = (text) => (text.length > MAX_MESSAGES ? text.slice(0, MAX_MESSAGES - 1) + "..." : text);

const getBookTitle = async (bookId) => {
    const book = await Book.findById(bookId).select('title').lean();
    return book?.title ?? 'a book';
}

// tell every admin that a user sent a request
const notifyNewRequest = async (request, username) => {
    try {
        const title = await getBookTitle(request.book);
        const message = clipMessage(
            request.type === 'borrow'
                ? `${username} requested to borrow "${title}" for ${request.days} days.`
                : `${username} requested to return "${title}"`
        );

        const adminIds = await User.find({role: 'admin'}).distinct('_id');

        if(adminIds.length === 0) return;

        const saved = await Notification.insertMany(adminIds.map((adminId) => ({
            user: adminId,
            type: 'new_request',
            requestType: request.type,
            message,
            book: request.book
        })));

        for( const notif of saved) sendToUser(notif.user, 'notification', notif);

    } catch (error) {
        console.log("Errir notifying admins", error);
    }
}

// tell the user of an admin decision for their request
const notifyDecision = async (request, decision) => {
    try {
        const title = await getBookTitle(request.book);
        let message;

        if(decision === 'approved') {
            message = request.type === 'borrow'
                ? `Your request to borrow "${title}" was approved. It is due in ${request.days} days.`
                : `Your return of "${title}" was approved.`
        } else {
            const reason = request.reason?.trim();
            const suffix = reason
                ? `: ${reason}${/[.?!%]$/.test(reason) ? '' : '.'}`
                : '.';
            
            message = `Your request to ${request.type} "${title}" was denied${suffix}`;
        }

        const notif = await Notification.create({
            user: request.user,
            type: decision,
            requestType: request.type,
            message: clipMessage(message),
            book: request.book
        });

        sendToUser(request.user, 'notification', notif);

    } catch (error) {
        console.log("Error notifying user", error);
    }
}

export {notifyNewRequest, notifyDecision};