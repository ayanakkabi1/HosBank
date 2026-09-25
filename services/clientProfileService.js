import * as clientProfileRepository from '../repositories/clientProfileRepository.js';

const normalizeProfile = ({ nom, prenom, email }) => ({
    nom: nom?.trim(),
    prenom: prenom?.trim(),
    email: email?.trim().toLowerCase()
});

export const getClientProfile = async (clientId) => {
    const profile = await clientProfileRepository.findClientProfileById(clientId);
    if (!profile) {
        throw new Error('Profil introuvable.');
    }
    return profile;
};

export const updateClientProfile = async (clientId, data) => {
    const profile = normalizeProfile(data);

    if (!profile.nom || !profile.prenom || !profile.email) {
        throw new Error('Le nom, le prénom et l’adresse e-mail sont obligatoires.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        throw new Error('L’adresse e-mail est invalide.');
    }

    const existingClient = await clientProfileRepository.findClientByEmail(profile.email, clientId);
    if (existingClient) {
        throw new Error('Cette adresse e-mail est déjà utilisée.');
    }

    const updatedProfile = await clientProfileRepository.updateClientProfile(clientId, profile);
    if (!updatedProfile) {
        throw new Error('Profil introuvable.');
    }
    return updatedProfile;
};