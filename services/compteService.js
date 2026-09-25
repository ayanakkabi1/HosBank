import * as compteRepository from '../repositories/compteRepository.js';






export const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};






export const formatRib = (rib) => {
    if (!rib) return '';
    return rib.replace(/(.{4})/g, '$1 ').trim();
};






export const getDashboardData = async (clientId) => {
    if (!clientId) {
        throw new Error('Identifiant client manquant ou invalide.');
    }

    const [comptesRaw, totalSoldeRaw, recentOperationsRaw] = await Promise.all([
        compteRepository.getComptesByClientId(clientId),
        compteRepository.getTotalSoldeByClientId(clientId),
        compteRepository.getRecentOperationsByClientId(clientId, 5)
    ]);

    const comptes = (comptesRaw || []).map(compte => ({
        ...compte,
        soldeNumber: parseFloat(compte.solde) || 0,
        soldeFormatted: formatCurrency(compte.solde),
        ribFormatted: formatRib(compte.rib),
        badgeClass: compte.statut === 'actif' ? 'badge-success' : 'badge-warning',
        labelType: compte.type_compte === 'epargne' ? 'Compte Épargne' : 'Compte Courant'
    }));

    const recentOperations = (recentOperationsRaw || []).map(op => ({
        ...op,
        montantFormatted: formatCurrency(op.montant),
        dateFormatted: new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(op.created_at)),
        isDebit: op.sens === 'debit'
    }));

    return {
        comptes,
        totalSolde: parseFloat(totalSoldeRaw) || 0,
        totalSoldeFormatted: formatCurrency(totalSoldeRaw),
        nombreComptes: comptes.length,
        recentOperations
    };
};
