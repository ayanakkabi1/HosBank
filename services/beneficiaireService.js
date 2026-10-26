import * as beneficiaireRepository from '../repositories/beneficiaireRepository.js';

export const getBeneficiaire = async (clientId) => {
    if (!clientId) {
        throw new Error("identifiant de l'utilisateur manquant");
    }

    const beneficiaires = await beneficiaireRepository.getBeneficiairesByClientId(clientId);
    return beneficiaires;
};

export const addBeneficiaire = async (nom, rib, clientId) => {
    if (!nom || !rib) {
        throw new Error("le nom ou le rib ne se trouve pas");
    }

    if (rib.length !== 24) {
        throw new Error("le rib doit contenir 24 chiffres");
    }

    const existant = await beneficiaireRepository.findBeneficiaireByRibAndClient(rib, clientId);
    if (existant) {
        throw new Error("ce beneficiaire est deja dans votre liste");
    }

    const id = await beneficiaireRepository.createBeneficiaire(nom, rib, clientId);
    return id;
};

export const removeBeneficiaire = async (id, clientId) => {
    const deleted = await beneficiaireRepository.deleteBeneficiaire(id, clientId);
    if (!deleted) {
        throw new Error("beneficiaire introuvable");
    }
    return true;
};
