import express from 'express';
import { checkLogin, loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';
import {checkAdminPW} from '../middlewares/checkAdmin.js'
import {isLogged, isNotLogged, validateRegistration} from '../middlewares/checkLogin.js'

const router = express.Router();

router.get('/', checkLogin);
router.put('/', isNotLogged, loginUser);
router.post('/', isNotLogged, checkAdminPW, validateRegistration, registerUser);
router.delete('/', isLogged, logoutUser);

export default router;