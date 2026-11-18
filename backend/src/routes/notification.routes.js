import express from 'express';
import {isLogged} from '../middlewares/checkLogin.js'
import { getNotifications, markRead, streamNotifications } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/stream', isLogged, streamNotifications);
router.get('/', isLogged, getNotifications);
router.patch('/read', isLogged, markRead);

export default router;