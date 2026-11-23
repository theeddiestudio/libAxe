import mongoose from "mongoose";

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
        default: 1,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'stock must be a whole number'
        }
    },
    coverImage: {
        type: String
    },
    pricePerDay: {
        type: Number,
        default: 1,
        min: 0
    },
    overduePerDay: {
        type: Number,
        default: 1.5,
        min: 0
    },
    reservedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {timestamps: true});

const Book = mongoose.model('Book', bookSchema);

export default Book;