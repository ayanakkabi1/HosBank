import * as clientAccountService from '../../services/clientAccountService';

export const processSavingsRequest = async (req, res) => {
    try {
        const clientId = req.session.user.id;
        await accountService.requestSavingsAccount(clientId);

        res.redirect('/client/accounts?success=Demande+envoyee+avec+succes');
    } catch (error) {
        res.redirect(`/client/accounts?error=${encodeURIComponent(error.message)}`);
    }
};

