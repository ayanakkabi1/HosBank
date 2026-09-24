import { Router } from 'express';
import {
    renderAdminUsers,
    handleCreateUser,
    handleUpdateUser,
    handleToggleUserStatus,
    handleCreateCompte,
    handleToggleCompteStatus,
    handleCreateCarte,
    handleToggleCarteStatus
} from '../controllers/adminController.js';
import { isAuth, hasRole } from '../middlewares/authmiddleware.js';

const router = Router();

// Toutes les routes admin nécessitent authentification et rôle 'admin'
router.use(isAuth, hasRole(['admin']));

// Vue principale de gestion (utilisateurs, rôles, comptes, cartes)
router.get('/', renderAdminUsers);
router.get('/users', renderAdminUsers);

// CRUD Utilisateurs & Rôles
router.post('/users', handleCreateUser);
router.post('/users/:id/update', handleUpdateUser);
router.post('/users/:id/toggle-status', handleToggleUserStatus);

// Gestion des Comptes Bancaires
router.post('/comptes', handleCreateCompte);
router.post('/comptes/:id/toggle-status', handleToggleCompteStatus);

// Gestion des Cartes Bancaires
router.post('/cartes', handleCreateCarte);
router.post('/cartes/:id/toggle-status', handleToggleCarteStatus);

export default router;
