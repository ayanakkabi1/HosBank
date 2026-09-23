import { Router } from 'express';
import {
    renderBeneficiaires,
    processAddBeneficiaire,
    processDeleteBeneficiaire
} from '../controllers/beneficiaireController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

// Afficher la liste des bénéficiaires
router.get('/', isAuth, hasRole(['client']), renderBeneficiaires);

// Ajouter un bénéficiaire
router.post('/', isAuth, hasRole(['client']), processAddBeneficiaire);

// Supprimer un bénéficiaire
router.post('/:id/delete', isAuth, hasRole(['client']), processDeleteBeneficiaire);

export default router;
