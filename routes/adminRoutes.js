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

// Consultation globale, virements, demandes, réclamations et statistiques (HOS-75)
import {
    getPlatformStats,
    getVirementsList,
    getDemandesList,
    getReclamationsList,
    getSupervisionList
} from '../controllers/adminStatsController.js';

router.get('/api/stats', getPlatformStats);
router.get('/api/virements', getVirementsList);
router.get('/api/demandes', getDemandesList);
router.get('/api/reclamations', getReclamationsList);
router.get('/api/supervision', getSupervisionList);

export default router;
