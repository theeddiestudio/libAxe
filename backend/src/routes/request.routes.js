import express from 'express';
import {checkAdmin, checkUser} from '../middlewares/checkAdmin.js'
import {isLogged} from '../middlewares/checkLogin.js'
import { approveRequest, cancelRequest, createRequest, denyRequest, getMyRequests, listRequests } from '../controllers/request.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

router.get('/me', isLogged, checkUser, getMyRequests);
router.post('/', isLogged, checkUser, validateRequest, createRequest);
router.delete('/:id', isLogged, checkUser, cancelRequest);

router.get('/', isLogged, checkAdmin, listRequests);
router.patch('/:id/approve', isLogged, checkAdmin, approveRequest);
router.patch('/:id/deny', isLogged, checkAdmin, denyRequest);

export default router;