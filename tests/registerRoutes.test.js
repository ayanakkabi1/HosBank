import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';

jest.unstable_mockModule('../services/registerService.js', () => ({
    register: jest.fn(),
    verifyEmailToken: jest.fn()
}));

const registerService = await import('../services/registerService.js');
const registerRoute = (await import('../routes/registerRoute.js')).default;

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'test_secret',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/auth', registerRoute);

describe('registerRoute - HTTP Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /auth/register - affiche le formulaire d\'inscription', async () => {
        const response = await request(app).get('/auth/register');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Inscription - HosBank');
    });

    test('POST /auth/register - succès d\'inscription avec message de confirmation', async () => {
        registerService.register.mockResolvedValue({ userId: 1, verificationToken: 'tok123' });

        const response = await request(app)
            .post('/auth/register')
            .send({
                nom: 'Qnais',
                prenom: 'Adnane',
                email: 'adnane@example.com',
                password: 'Password123',
                passwordConfirmation: 'Password123'
            });

        expect(response.status).toBe(200);
        expect(response.text).toContain('Votre compte a été créé avec succès');
        expect(registerService.register).toHaveBeenCalled();
    });

    test('POST /auth/register - échec avec mot de passe mismatch', async () => {
        registerService.register.mockRejectedValue(new Error('Les mots de passe ne correspondent pas.'));

        const response = await request(app)
            .post('/auth/register')
            .send({
                nom: 'Qnais',
                prenom: 'Adnane',
                email: 'adnane@example.com',
                password: 'Password123',
                passwordConfirmation: 'Wrong123'
            });

        expect(response.status).toBe(400);
        expect(response.text).toContain('Les mots de passe ne correspondent pas.');
    });

    test('GET /auth/verify-email - succès avec token valide', async () => {
        registerService.verifyEmailToken.mockResolvedValue({ id: 1, email: 'test@example.com' });

        const response = await request(app).get('/auth/verify-email?token=valid_token');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Activation Réussie !');
    });

    test('GET /auth/verify-email - échec avec token invalide', async () => {
        registerService.verifyEmailToken.mockRejectedValue(new Error('Jeton de vérification invalide ou déjà utilisé.'));

        const response = await request(app).get('/auth/verify-email?token=bad_token');
        expect(response.status).toBe(400);
        expect(response.text).toContain('Échec de la validation');
    });
});
