import * as carteRepository from '../repositories/carteRepository.js';






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






export const getMesDemandesCarte = async (clientId) => {
    if (!clientId) {
        throw new Error("Identifiant client manquant.");
    }
    const demandes = await carteRepository.getDemandesCarteByClientId(clientId);
    return demandes;
};
