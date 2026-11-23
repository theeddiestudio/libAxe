import express from 'express';
import { getProfile, getMyLoans } from '../controllers/user.controller.js';
import {isLogged} from '../middlewares/checkLogin.js'
import { checkUser } from '../middlewares/checkAdmin.js';

const router = express.Router();

router.get('/', isLogged, getProfile);
router.get('/loans', isLogged, checkUser, getMyLoans);

export default router;