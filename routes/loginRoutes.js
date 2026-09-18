import { Router } from 'express';
import { renderLogin, processLogin, logout } from '../controllers/loginController.js';
import { isGuest } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/login', isGuest, renderLogin);
router.post('/login', isGuest, processLogin);
router.get('/logout', logout);

export default router;