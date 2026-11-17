import Book from '../models/Book.js'
import User from '../models/User.js';

const getAllBooks = async (_, res) => {
    try {
        const books = await Book.find({});
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({message: 'Failed to fetch catalog'})
    }
}

const getBook = async (req,res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch book details' });
    }
}

const createBook = async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create book' });
  }
};

const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update book' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    
    await User.updateMany(
      { reservedBooks: req.params.id },
      { $pull: {reservedBooks: req.params.id}}
    );
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book' });
  }
};

export {getAllBooks, getBook, createBook, updateBook, deleteBook};