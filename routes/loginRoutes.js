import { Router } from 'express';
import { renderLogin, processLogin } from '../controllers/loginController.js';
import { isGuest } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/login', isGuest, renderLogin);
router.post('/login', isGuest, processLogin);

export default router;