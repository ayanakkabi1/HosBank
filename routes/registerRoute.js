import { Router } from 'express';

import {
    renderRegister,
    processRegister,
    verifyEmail
} from '../controllers/registerController.js';

import { isGuest } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/register', isGuest, renderRegister);
router.post('/register', isGuest, processRegister);
router.get('/verify-email', verifyEmail);

export default router;