import * as clientAccountRepository from '../repositories/clientAccountRepository.js';

export const getClientAccounts = async (clientId) => {
    const account = await clientAccountRepository.findAccountByClientId(clientId);
    if (!account) {
        throw new Error('Account not found');
    }
    return account;
};

export const requestSavingsAccount = async (clientId) => {
    const accounts = await clientAccountRepository.findAccountsByClientId(clientId);
    const hasSavingsAccount = accounts.some(acc => acc.type_compte === 'epargne');

    if (hasSavingsAccount) {
        throw new Error('Vous possédez déjà un compte d\'épargne.');
    }

    const pendingDemand = await clientAccountRepository.findPendingDemand(clientId, 'ouverture_compte_epargne');
    if (pendingDemand) {
        throw new Error('Une demande d\'ouverture de compte d\'épargne est déjà en cours de traitement.');
    }

    return await clientAccountRepository.createDemande(clientId, 'ouverture_compte_epargne');
};

export const getClientAccountRib = async (clientId, accountId) => {
    const account = await clientAccountRepository.findAccountByIdAndClient(accountId, clientId);
    if (!account) {
        throw new Error('Compte introuvable.');
    }

    return account.rib;
};

