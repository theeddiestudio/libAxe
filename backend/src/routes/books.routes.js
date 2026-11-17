import express from 'express';
import { getAllBooks, getBook, createBook, updateBook, deleteBook } from '../controllers/books.controller.js';
import {checkAdmin} from '../middlewares/checkAdmin.js'
import {isLogged} from '../middlewares/checkLogin.js'

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBook);

router.post('/', isLogged, checkAdmin, createBook);
router.put('/:id', isLogged, checkAdmin, updateBook);
router.delete('/:id', isLogged, checkAdmin, deleteBook);

export default router;