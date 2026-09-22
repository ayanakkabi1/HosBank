import { Router } from 'express';
import { renderDashboard } from '../controllers/clientController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

// Tableau de bord client sécurisé
router.get('/dashboard', isAuth, hasRole(['client']), renderDashboard);

export default router;
