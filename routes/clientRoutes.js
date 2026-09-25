import { Router } from 'express';
import { renderDashboard } from '../controllers/clientController.js';
import { renderAccounts, processSavingsRequest } from '../controllers/Client/ClientaccountController.js';
import { renderClientProfile, processClientProfile } from '../controllers/Client/ClientProfileController.js';
import { renderVirement, processVirement } from '../controllers/Client/virementViewController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();


router.get('/dashboard', isAuth, hasRole(['client']), renderDashboard);

// Comptes bancaires
router.get('/accounts', isAuth, hasRole(['client']), renderAccounts);
router.post('/accounts/savings-request', isAuth, hasRole(['client']), processSavingsRequest);

// Profil client
router.get('/profile', isAuth, hasRole(['client']), renderClientProfile);
router.post('/profile', isAuth, hasRole(['client']), processClientProfile);

// Virements
router.get('/virement', isAuth, hasRole(['client']), renderVirement);
router.post('/virement', isAuth, hasRole(['client']), processVirement);

export default router;
