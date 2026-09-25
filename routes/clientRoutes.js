import { Router } from 'express';
import { renderDashboard } from '../controllers/clientController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();


router.get('/dashboard', isAuth, hasRole(['client']), renderDashboard);

export default router;
