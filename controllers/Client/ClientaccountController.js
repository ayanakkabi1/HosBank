import * as clientAccountService from '../../services/clientAccountService.js';

export const renderAccounts = async (req, res) => {
    try {
        const clientId = req.session.user.id;
        const accounts = await clientAccountService.getClientAccounts(clientId);
        res.render('client/accounts', { accounts, error: null, success: req.query.success || null });
    } catch (error) {
        res.status(500).render('errors/error', { message: error.message });
    }
};

export const processSavingsRequest = async (req, res) => {
    try {
        const clientId = req.session.user.id;
        await clientAccountService.requestSavingsAccount(clientId);

        res.redirect('/client/accounts?success=Demande+envoyee+avec+succes');
    } catch (error) {
        res.redirect(`/client/accounts?error=${encodeURIComponent(error.message)}`);
    }
};

export const getRibJson = async (req, res) => {
    try {
        const clientId = req.session.user.id;
        const accountId = Number(req.params.id);
        const rib = await clientAccountService.getClientAccountRib(clientId, accountId);

        res.json({ rib });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

