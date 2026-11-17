import express from 'express';
import { getProfile, borrowBook, returnBook, getProfileBooks } from '../controllers/user.controller.js';
import {isLogged} from '../middlewares/checkLogin.js'

const router = express.Router();

router.get('/', isLogged, getProfile);
router.get('/books', isLogged, getProfileBooks);

router.put('/:id', isLogged, borrowBook);
router.delete('/:id', isLogged, returnBook);

export default router;