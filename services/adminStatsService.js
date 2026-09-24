import * as adminStatsRepository from '../repositories/adminStatsRepository.js';

/**
 * Récupère l'historique complet des virements et opérations bancaires
 */
export const getVirementsOverview = async (limit = 100, offset = 0) => {
    const virements = await adminStatsRepository.getAllVirements(limit, offset);
    return virements.map(v => ({
        id: v.id,
        montant: Number(v.montant),
        motif: v.motif || 'Non renseigné',
        statut: v.statut,
        date: v.created_at,
        source: {
            rib: v.source_rib,
            clientNom: `${v.source_client_prenom} ${v.source_client_nom}`
        },
        destination: {
            rib: v.dest_rib,
            clientNom: `${v.dest_client_prenom} ${v.dest_client_nom}`
        }
    }));
};

/**
 * Récupère toutes les demandes clients de la plateforme
 */
export const getDemandesOverview = async (limit = 100, offset = 0) => {
    const demandes = await adminStatsRepository.getAllDemandes(limit, offset);
    return demandes.map(d => ({
        id: d.id,
        type: d.type_demande,
        statut: d.statut,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        client: {
            id: d.client_id,
            nomComplet: `${d.client_prenom} ${d.client_nom}`,
            email: d.client_email
        },
        traitePar: d.charge_id ? {
            id: d.charge_id,
            nomComplet: `${d.charge_prenom} ${d.charge_nom}`
        } : null
    }));
};

/**
 * Récupère toutes les réclamations de la plateforme
 */
export const getReclamationsOverview = async (limit = 100, offset = 0) => {
    const reclamations = await adminStatsRepository.getAllReclamations(limit, offset);
    return reclamations.map(r => ({
        id: r.id,
        sujet: r.sujet,
        description: r.description,
        statut: r.statut,
        reponse: r.reponse,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        client: {
            id: r.client_id,
            nomComplet: `${r.client_prenom} ${r.client_nom}`,
            email: r.client_email
        },
        traitePar: r.charge_id ? {
            id: r.charge_id,
            nomComplet: `${r.charge_prenom} ${r.charge_nom}`
        } : null
    }));
};

/**
 * Supervision des activités et de la charge de travail des chargés de clientèle
 */
export const getSupervisionCharges = async () => {
    const charges = await adminStatsRepository.getSupervisionCharges();
    return charges.map(c => ({
        id: c.id,
        nomComplet: `${c.prenom} ${c.nom}`,
        email: c.email,
        statut: c.statut,
        nbClientsAssignes: Number(c.nb_clients_assignes),
        nbDemandesTraitees: Number(c.nb_demandes_traitees),
        nbReclamationsTraitees: Number(c.nb_reclamations_traitees),
        totalActions: Number(c.nb_demandes_traitees) + Number(c.nb_reclamations_traitees)
    }));
};

/**
 * Agrégation consolidée des statistiques générales de la plateforme
 */
export const getPlatformGlobalStats = async () => {
    const [financial, demandesAgg, reclamationsAgg, usersAgg] = await Promise.all([
        adminStatsRepository.getGlobalFinancialStats(),
        adminStatsRepository.getDemandesAggregation(),
        adminStatsRepository.getReclamationsAggregation(),
        adminStatsRepository.getUsersAggregation()
    ]);

    // Répartition utilisateurs
    let totalUsers = 0;
    const usersByRole = { client: 0, charge_clientele: 0, admin: 0 };
    const usersByStatut = { actif: 0, inactif: 0, en_attente: 0, bloque: 0 };

    usersAgg.forEach(row => {
        const count = Number(row.count);
        totalUsers += count;
        if (usersByRole[row.role] !== undefined) usersByRole[row.role] += count;
        if (usersByStatut[row.statut] !== undefined) usersByStatut[row.statut] += count;
    });

    // Agrégations demandes
    let totalDemandes = 0;
    const demandesByStatut = { en_attente: 0, validee: 0, refusee: 0 };
    demandesAgg.parStatut.forEach(row => {
        const count = Number(row.count);
        totalDemandes += count;
        if (demandesByStatut[row.statut] !== undefined) demandesByStatut[row.statut] += count;
    });

    // Agrégations réclamations
    let totalReclamations = 0;
    const reclamationsByStatut = { en_attente: 0, en_cours: 0, resolue: 0, rejetee: 0 };
    reclamationsAgg.forEach(row => {
        const count = Number(row.count);
        totalReclamations += count;
        if (reclamationsByStatut[row.statut] !== undefined) reclamationsByStatut[row.statut] += count;
    });

    return {
        financial,
        users: {
            total: totalUsers,
            byRole: usersByRole,
            byStatut: usersByStatut
        },
        demandes: {
            total: totalDemandes,
            byStatut: demandesByStatut,
            byType: demandesAgg.parType
        },
        reclamations: {
            total: totalReclamations,
            byStatut: reclamationsByStatut
        }
    };
};
