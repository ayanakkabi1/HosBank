import { Router } from 'express';
import { renderAccounts, processSavingsRequest, getRibJson } from '../controllers/Client/ClientaccountController.js';
import { isAuth } from '../middlewares/authmiddleware.js';
import { hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/accounts', isAuth, hasRole(['client']), renderAccounts);
router.post('/accounts/request-savings', isAuth, hasRole(['client']), processSavingsRequest);
router.get('/accounts/:id/rib', isAuth, hasRole(['client']), getRibJson);

export default router;