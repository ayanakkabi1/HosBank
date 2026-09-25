import { Router } from 'express';
import { renderAccounts, processSavingsRequest, getRibJson } from '../controllers/Client/ClientaccountController.js';
import { createVirement, getVirementHistory } from '../controllers/Client/virementController.js';
import { renderPinRequest, processPinRequest } from '../controllers/Client/ClientPinController.js';
import { renderClientProfile, processClientProfile } from '../controllers/Client/ClientProfileController.js';
import { isAuth } from '../middlewares/authmiddleware.js';
import { hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/accounts', isAuth, hasRole(['client']), renderAccounts);
router.post('/accounts/request-savings', isAuth, hasRole(['client']), processSavingsRequest);
router.get('/accounts/:id/rib', isAuth, hasRole(['client']), getRibJson);
router.post('/transfers', isAuth, hasRole(['client']), createVirement);
router.get('/transfers', isAuth, hasRole(['client']), getVirementHistory);
router.get('/pin-request', isAuth, hasRole(['client']), renderPinRequest);
router.post('/pin-request', isAuth, hasRole(['client']), processPinRequest);
router.get('/profile', isAuth, hasRole(['client']), renderClientProfile);
router.post('/profile', isAuth, hasRole(['client']), processClientProfile);

export default router;