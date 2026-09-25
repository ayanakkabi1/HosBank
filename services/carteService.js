import * as carteRepository from '../repositories/carteRepository.js';

/**
 * Enregistre une demande de carte virtuelle si aucune demande n'est déjà en attente
 * @param {number} clientId 
 * @returns {Promise<number>} ID de la demande créée
 */
export const demanderCarteVirtuelle = async (clientId) => {
    if (!clientId) {
        throw new Error("Identifiant client manquant.");
    }

    const demandes = await carteRepository.getDemandesCarteByClientId(clientId);
    const demandeEnAttente = demandes.find((d) => d.statut === 'en_attente');

    if (demandeEnAttente) {
        throw new Error("Vous avez déjà une demande de carte virtuelle en cours de traitement.");
    }

    const id = await carteRepository.createDemandeCarte(clientId);
    return id;
};

/**
 * Récupère les demandes de cartes virtuelles d'un client
 * @param {number} clientId 
 * @returns {Promise<Array>}
 */
export const getMesDemandesCarte = async (clientId) => {
    if (!clientId) {
        throw new Error("Identifiant client manquant.");
    }
    const demandes = await carteRepository.getDemandesCarteByClientId(clientId);
    return demandes;
};
