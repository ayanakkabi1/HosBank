import { Router } from 'express';
import { renderAccounts, processSavingsRequest, getRibJson } from '../controllers/Client/ClientaccountController.js';
import { isAuth } from '../middlewares/authmiddleware.js';
import { isClient } from '../middlewares/isClient.js';

const router = Router();

router.get('/accounts', isAuth, isClient, renderAccounts);
router.post('/accounts/request-savings', isAuth, isClient, processSavingsRequest);

export default router;