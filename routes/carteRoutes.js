import { Router } from 'express';
import { renderDemandeCarte, processDemanderCarte } from '../controllers/carteController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/', isAuth, hasRole(['client']), renderDemandeCarte);
router.post('/', isAuth, hasRole(['client']), processDemanderCarte);

export default router;
