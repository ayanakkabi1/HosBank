import * as compteRepository from '../repositories/compteRepository.js';

/**
 * Formate un nombre en montant monétaire MAD (Dirham marocain)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

/**
 * Formate un RIB avec des séparateurs d'espaces pour la lisibilité
 * @param {string} rib 
 * @returns {string}
 */
export const formatRib = (rib) => {
    if (!rib) return '';
    return rib.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Récupère l'ensemble des données nécessaires au tableau de bord client
 * @param {number} clientId 
 * @returns {Promise<Object>}
 */
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
