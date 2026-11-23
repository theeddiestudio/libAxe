import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { RULES } from '../config/rules.js';
import { buildSearchFilter } from '../lib/search.js';
import { fail } from '../lib/errors.js';

// only fields that can be set. others are ignored if passed in body
const EDITABLE_FIELDS = [
    'title', 'author', 'description', 'category', 'publishedYear',
    'stock', 'coverImage', 'pricePerDay', 'overduePerDay'
];

const pickBookFields = (body) => {
    const picked = {};
    for (const field of EDITABLE_FIELDS) {
        if (body?.[field] !== undefined) picked[field] = body[field];
    }
    return picked;
};

const isBadInput = (error) => error.name === 'ValidationError' || error.name === 'CastError';

const inputMessage = (error) => (
    error.name === 'ValidationError'
        ? Object.values(error.errors).map((e) => e.message).join(' ')
        : error.message
);

const getAllBooks = async (req, res) => {
    try {
        const filter = buildSearchFilter(req.query.search, ['title', 'author']) ?? {};
        const books = await Book.find(filter);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({message: 'Failed to fetch catalog'})
    }
}

const getBook = async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ message: 'Invalid book id.' });
        }

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch book details' });
    }
}

const createBook = async (req, res) => {
    try {
        const savedBook = await new Book(pickBookFields(req.body)).save();
        res.status(201).json(savedBook);
    } catch (error) {
        if (isBadInput(error)) return res.status(400).json({ message: inputMessage(error) });
        console.log('Error creating book:', error);
        res.status(500).json({ message: 'Failed to create book' });
    }
};

const updateBook = async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ message: 'Invalid book id.' });
        }

        const fields = pickBookFields(req.body);
        if (Object.keys(fields).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: fields },
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(updatedBook);
    } catch (error) {
        if (isBadInput(error)) return res.status(400).json({ message: inputMessage(error) });
        console.log('Error updating book:', error);
        res.status(500).json({ message: 'Failed to update book' });
    }
};

const deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!mongoose.isObjectIdOrHexString(bookId)) {
            return res.status(400).json({ message: 'Invalid book id.' });
        }

        await mongoose.connection.transaction(async (session) => {
            const borrowed = await Loan.exists({ book: bookId, status: 'active' }).session(session);
            if (borrowed) {
                throw fail(409, 'This book is currently borrowed. It can be deleted after it is returned.');
            }

            const deleted = await Book.findByIdAndDelete(bookId, { session });
            if (!deleted) throw fail(404, 'Book not found');

            // requests still waiting for this book can never be approved now
            await Request.updateMany(
                { book: bookId, status: 'pending' },
                {
                    status: 'cancelled',
                    reason: 'This book was removed from the catalog.',
                    decidedBy: req.user._id,
                    decidedAt: new Date(),
                    expireAt: new Date(Date.now() + RULES.RESOLVED_REQUEST_TTL)
                },
                { session }
            );

            await User.updateMany(
                { reservedBooks: bookId },
                { $pull: { reservedBooks: bookId } },
                { session }
            );
        });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ message: error.message });
        console.log('Error deleting book:', error);
        res.status(500).json({ message: 'Failed to delete book' });
    }
};

export {getAllBooks, getBook, createBook, updateBook, deleteBook};