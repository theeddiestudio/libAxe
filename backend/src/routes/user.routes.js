import express from 'express';
import { getProfile, getProfileBooks, getMyLoans } from '../controllers/user.controller.js';
import {isLogged} from '../middlewares/checkLogin.js'
import { checkUser } from '../middlewares/checkAdmin.js';

const router = express.Router();

router.get('/', isLogged, getProfile);
router.get('/books', isLogged, getProfileBooks);
router.get('/loans', isLogged, checkUser, getMyLoans);

// router.put('/:id', isLogged, borrowBook);
// router.delete('/:id', isLogged, returnBook);


export default router;