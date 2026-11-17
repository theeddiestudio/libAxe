import mongoose from "mongoose";
import User from './User.js';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Fiction', 'Biography', 'Science', 'Politics', 'Self Growth'],
    },
    publishedYear: {
        type: Number
    },
    stock: {
        type: Number,
        default: 1
    },
    coverImage: {
        type: String
    },
    reservedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {timestamps: true});

const Book = mongoose.model('Book', bookSchema);

export default Book;