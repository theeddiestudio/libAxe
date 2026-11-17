import Book from "../models/Book.js";
import User from "../models/User.js";

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json(user);        
    } catch (error) {
        res.status(500).json({message: "Error in Profile page."});
    }
}

const getProfileBooks = async (req,res) => {
    try {
        const user = await User.findById(req.user._id).populate('reservedBooks');
        res.status(200).json(user.reservedBooks);
    } catch (error) {
        res.status(500).json({message: "Error in Profile page."});
    }
}

const borrowBook = async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            {   _id: req.params.id,
                stock: { $gt : 0},
                reservedBy: { $ne: req.user._id }
            },
            {   $push: { reservedBy: req.user._id },
                $inc: { stock: -1 }
            }
        )
        
        if(!book) return res.status(404).json({message: "Book does not exist."});
        
        await User.findByIdAndUpdate(req.user._id, {
            $push: { reservedBooks: req.params.id }
        })
        
        res.status(201).json({message: "Book borrowed successfully."});
    } catch (error) {
        res.status(500).json({message: "Error in borrow book."});
    }
}

const returnBook = async (req, res) => {
    try {
        const result = await User.updateOne(
            {
                _id: req.user._id,
                reservedBooks: req.params.id
            },
            {
                $pull: {reservedBooks: req.params.id}
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "You have not borrowed this book." });
        }

        await Book.findByIdAndUpdate(req.params.id, {
            $pull: {reservedBy: req.user._id},
            $inc: { stock: 1 }
        })
        res.status(201).json({message: "Book returned successfully."})
    } catch (error) {
        res.status(500).json({message: "Error in return book."});
    }
}

export {getProfile, getProfileBooks, borrowBook, returnBook};