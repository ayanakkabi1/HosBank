import * as adminService from '../../services/adminService.js';

export const renderClients = async (req, res) => {
    try {
        const { clients, chargeClients } = await adminService.getClientAssignmentData();
        res.render('admin/clients', {
            clients,
            chargeClients,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        res.status(500).render('errors/error', { message: error.message });
    }
};

export const assignClient = async (req, res) => {
    try {
        await adminService.assignClientToCharge(
            req.params.clientId,
            req.body.chargeId
        );
        res.redirect('/admin/clients?success=Client+affecte+avec+succes');
    } catch (error) {
        res.redirect(`/admin/clients?error=${encodeURIComponent(error.message)}`);
    }
};
