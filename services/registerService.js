import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail } from './emailService.js';

import {
    findUserByEmail,
    createUser,
    findUserByVerificationToken,
    activateUserAccount
} from '../repositories/registerRepository.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (
    nom,
    prenom,
    email,
    password,
    passwordConfirmation
) => {
    const cleanNom = nom?.trim();
    const cleanPrenom = prenom?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanNom || !cleanPrenom || !cleanEmail || !password || !passwordConfirmation) {
        throw new Error('Tous les champs sont obligatoires.');
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
        throw new Error('Veuillez fournir une adresse email valide.');
    }

    if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins une lettre et un chiffre.');
    }

    if (password !== passwordConfirmation) {
        throw new Error('Les mots de passe ne correspondent pas.');
    }

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
        throw new Error('Cette adresse email est déjà utilisée.');
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Création de l'utilisateur avec statut 'en_attente' et token
    const userId = await createUser(
        cleanNom,
        cleanPrenom,
        cleanEmail,
        hashedPassword,
        verificationToken
    );

    // Envoi de l'e-mail de confirmation
    await sendVerificationEmail(cleanEmail, verificationToken);

    return { userId, verificationToken };
};

export const verifyEmailToken = async (token) => {
    if (!token || typeof token !== 'string') {
        throw new Error('Jeton de vérification invalide ou manquant.');
    }

    const user = await findUserByVerificationToken(token);
    if (!user) {
        throw new Error('Jeton de vérification invalide ou déjà utilisé.');
    }

    const activated = await activateUserAccount(token);
    if (!activated) {
        throw new Error('Impossible d\'activer le compte. Veuillez réessayer.');
    }

    return user;
};