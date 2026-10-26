import { Router } from 'express';
import {
    renderBeneficiaires,
    processAddBeneficiaire,
    processDeleteBeneficiaire
} from '../controllers/beneficiaireController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/', isAuth, hasRole(['client']), renderBeneficiaires);

router.post('/', isAuth, hasRole(['client']), processAddBeneficiaire);

router.post('/:id/delete', isAuth, hasRole(['client']), processDeleteBeneficiaire);

export default router;
