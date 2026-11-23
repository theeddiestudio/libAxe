import express from 'express';
import {checkAdmin} from '../middlewares/checkAdmin.js'
import {isLogged} from '../middlewares/checkLogin.js'
import { deleteLoan, listLoans, payLoan, unpayLoan } from '../controllers/loan.controller.js';

const router = express.Router();

router.get('/', isLogged, checkAdmin, listLoans);
router.patch('/:id/pay', isLogged, checkAdmin, payLoan);
router.patch('/:id/unpay', isLogged, checkAdmin, unpayLoan);
router.delete('/:id', isLogged, checkAdmin, deleteLoan);

export default router;