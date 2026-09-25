import * as adminService from '../services/adminService.js';




export const renderAdminUsers = async (req, res) => {
    try {
        const { users, comptes, cartes, stats } = await adminService.getAdminOverview();
        const activeTab = req.query.tab || 'users';

        res.render('admin/users', {
            user: req.session.user,
            users,
            comptes,
            cartes,
            stats,
            activeTab,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        res.status(500).render('admin/users', {
            user: req.session.user,
            users: [],
            comptes: [],
            cartes: [],
            stats: { totalUsers: 0, nbClients: 0, nbCharges: 0, nbAdmins: 0, activeUsers: 0, totalComptes: 0, activeComptes: 0, totalCartes: 0, activeCartes: 0 },
            activeTab: 'users',
            error: error.message,
            success: null
        });
    }
};




export const handleCreateUser = async (req, res) => {
    try {
        const { nom, prenom, email, password, role, statut } = req.body;
        await adminService.createUser({ nom, prenom, email, password, role, statut });
        res.redirect('/admin/users?tab=users&success=Utilisateur créé avec succès !');
    } catch (error) {
        res.redirect(`/admin/users?tab=users&error=${encodeURIComponent(error.message)}`);
    }
};




export const handleUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, email, role, statut } = req.body;
        await adminService.updateUser(id, { nom, prenom, email, role, statut });
        res.redirect('/admin/users?tab=users&success=Utilisateur mis à jour avec succès !');
    } catch (error) {
        res.redirect(`/admin/users?tab=users&error=${encodeURIComponent(error.message)}`);
    }
};




export const handleToggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const newStatus = await adminService.toggleUserStatus(id);
        const msg = newStatus === 'actif' ? 'Compte utilisateur activé avec succès.' : 'Compte utilisateur désactivé.';
        res.redirect(`/admin/users?tab=users&success=${encodeURIComponent(msg)}`);
    } catch (error) {
        res.redirect(`/admin/users?tab=users&error=${encodeURIComponent(error.message)}`);
    }
};




export const handleCreateCompte = async (req, res) => {
    try {
        const { clientId, soldeInitial, typeCompte } = req.body;
        const { rib } = await adminService.createCompteForUser({ clientId, soldeInitial, typeCompte });
        res.redirect(`/admin/users?tab=comptes&success=${encodeURIComponent(`Compte bancaire créé avec succès (RIB : ${rib}) !`)}`);
    } catch (error) {
        res.redirect(`/admin/users?tab=comptes&error=${encodeURIComponent(error.message)}`);
    }
};




export const handleToggleCompteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const newStatus = await adminService.toggleCompteStatus(id);
        const msg = newStatus === 'actif' ? 'Compte bancaire réactivé.' : 'Compte bancaire bloqué.';
        res.redirect(`/admin/users?tab=comptes&success=${encodeURIComponent(msg)}`);
    } catch (error) {
        res.redirect(`/admin/users?tab=comptes&error=${encodeURIComponent(error.message)}`);
    }
};




export const handleCreateCarte = async (req, res) => {
    try {
        const { compteId, typeCarte, plafond } = req.body;
        const { numeroCarte } = await adminService.createCarteForCompte({ compteId, typeCarte, plafond });
        res.redirect(`/admin/users?tab=cartes&success=${encodeURIComponent(`Carte émise avec succès (N° : •••• ${numeroCarte.slice(-4)}) !`)}`);
    } catch (error) {
        res.redirect(`/admin/users?tab=cartes&error=${encodeURIComponent(error.message)}`);
    }
};




export const handleToggleCarteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const newStatus = await adminService.toggleCarteStatus(id);
        const msg = newStatus === 'active' ? 'Carte bancaire débloquée.' : 'Carte bancaire bloquée.';
        res.redirect(`/admin/users?tab=cartes&success=${encodeURIComponent(msg)}`);
    } catch (error) {
        res.redirect(`/admin/users?tab=cartes&error=${encodeURIComponent(error.message)}`);
    }
};
