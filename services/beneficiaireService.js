import * as beneficiaireRepository from '../repositories/beneficiaireRepository.js';

export const getBeneficiaire = async (clientId) => {
    if (!clientId) {
        throw new Error("identifiant de l'utilisateur manquant");
    }

    const beneficiaires = await beneficiaireRepository.getBeneficiairesByClientId(clientId);
    return beneficiaires;
};

const LETTERS_ONLY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const DIGITS_ONLY_REGEX = /^\d+$/;

export const validateBeneficiaireData = (nom, rib) => {
    if (!nom || !rib) {
        throw new Error("Le nom et le RIB sont obligatoires.");
    }

    const trimmedNom = nom.trim();
    const cleanRib = rib.replace(/\s+/g, '');

    if (!LETTERS_ONLY_REGEX.test(trimmedNom)) {
        throw new Error("Le nom du bénéficiaire doit contenir uniquement des lettres.");
    }

    if (!DIGITS_ONLY_REGEX.test(cleanRib)) {
        throw new Error("Le RIB doit contenir uniquement des chiffres.");
    }

    if (cleanRib.length !== 24) {
        throw new Error("Le RIB doit contenir exactement 24 chiffres.");
    }

    return { trimmedNom, cleanRib };
};

export const addBeneficiaire = async (nom, rib, clientId) => {
    const { trimmedNom, cleanRib } = validateBeneficiaireData(nom, rib);

    const existant = await beneficiaireRepository.findBeneficiaireByRibAndClient(cleanRib, clientId);
    if (existant) {
        throw new Error("Ce bénéficiaire est déjà dans votre liste.");
    }

    const id = await beneficiaireRepository.createBeneficiaire(trimmedNom, cleanRib, clientId);
    return id;
};

export const updateBeneficiaire = async (id, nom, rib, clientId) => {
    if (!id) {
        throw new Error("Identifiant du bénéficiaire manquant.");
    }

    const { trimmedNom, cleanRib } = validateBeneficiaireData(nom, rib);

    const beneficiaire = await beneficiaireRepository.findBeneficiaireByIdAndClient(id, clientId);
    if (!beneficiaire) {
        throw new Error("Bénéficiaire introuvable.");
    }

    const existantAvecMemeRib = await beneficiaireRepository.findBeneficiaireByRibAndClient(cleanRib, clientId);
    if (existantAvecMemeRib && existantAvecMemeRib.id !== parseInt(id, 10)) {
        throw new Error("Un autre bénéficiaire possède déjà ce RIB.");
    }

    await beneficiaireRepository.updateBeneficiaire(id, trimmedNom, cleanRib, clientId);
    return true;
};

export const removeBeneficiaire = async (id, clientId) => {
    const deleted = await beneficiaireRepository.deleteBeneficiaire(id, clientId);
    if (!deleted) {
        throw new Error("Bénéficiaire introuvable.");
    }
    return true;
};
