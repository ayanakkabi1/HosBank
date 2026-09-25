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


router.use(isAuth, hasRole(['admin']));


router.get('/', renderAdminUsers);
router.get('/users', renderAdminUsers);


router.post('/users', handleCreateUser);
router.post('/users/:id/update', handleUpdateUser);
router.post('/users/:id/toggle-status', handleToggleUserStatus);


router.post('/comptes', handleCreateCompte);
router.post('/comptes/:id/toggle-status', handleToggleCompteStatus);


router.post('/cartes', handleCreateCarte);
router.post('/cartes/:id/toggle-status', handleToggleCarteStatus);


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
