import { Router } from 'express';
import {
	renderClients,
	assignClient
} from '../controllers/admin/clientController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/clients', isAuth, hasRole(['admin']), renderClients);
router.post('/clients/:clientId/assign', isAuth, hasRole(['admin']), assignClient);

export default router;
