import * as registerService from '../services/registerService.js';

export const renderRegister = (req, res) => {
    res.render('auth/register', {
        error: null,
        success: null,
        formData: {}
    });
};

export const processRegister = async (req, res) => {
    const {
        nom,
        prenom,
        email,
        password,
        passwordConfirmation
    } = req.body || {};

    try {
        await registerService.register(
            nom,
            prenom,
            email,
            password,
            passwordConfirmation
        );

        res.render('auth/register', {
            error: null,
            success: 'Votre compte a été créé avec succès ! Un e-mail de confirmation vous a été envoyé. Veuillez cliquer sur le lien pour activer votre accès.',
            formData: {}
        });

    } catch (error) {
        res.status(400).render('auth/register', {
            error: error.message,
            success: null,
            formData: { nom, prenom, email }
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        await registerService.verifyEmailToken(token);

        res.render('auth/verify-email', {
            success: true,
            message: 'Votre adresse e-mail a été validée avec succès ! Votre compte HosBank est maintenant actif.'
        });
    } catch (error) {
        res.status(400).render('auth/verify-email', {
            success: false,
            message: error.message || 'Le lien de validation est invalide ou a expiré.'
        });
    }
};