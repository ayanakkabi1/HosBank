import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';

jest.unstable_mockModule('../../services/loginService.js', () => ({
    authenticate: jest.fn()
}));

const loginService = await import('../../services/loginService.js');
const loginRoutes = (await import('../../routes/loginRoutes.js')).default;

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

app.use('/auth', loginRoutes);

describe('loginRoutes - HTTP Requests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /auth/login - redirection vers dashboard client sur connexion réussie', async () => {
        const mockUser = { id: 1, nom: 'Aya', prenom: 'N', email: 'client@hosbank.com', role: 'client' };
        loginService.authenticate.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'client@hosbank.com', password: 'password123' });

        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/client/dashboard');
    });

    test('POST /auth/login - redirection vers dashboard admin si rôle admin', async () => {
        const mockUser = { id: 2, nom: 'Admin', prenom: 'A', email: 'admin@hosbank.com', role: 'admin' };
        loginService.authenticate.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'admin@hosbank.com', password: 'password123' });

        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/admin/dashboard');
    });

    test('POST /auth/login - redirection vers dashboard employé si rôle chargé clientèle', async () => {
        const mockUser = { id: 3, nom: 'Employé', prenom: 'C', email: 'employee@hosbank.com', role: 'charge_clientele' };
        loginService.authenticate.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'employee@hosbank.com', password: 'password123' });

        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/employee/dashboard');
    });

    test('POST /auth/login - transmet les identifiants au service', async () => {
        loginService.authenticate.mockResolvedValue({
            id: 1,
            email: 'client@hosbank.com',
            role: 'client'
        });

        await request(app)
            .post('/auth/login')
            .send({ email: 'client@hosbank.com', password: 'password123' });

        expect(loginService.authenticate).toHaveBeenCalledWith(
            'client@hosbank.com',
            'password123'
        );
    });

    test('POST /auth/login - retourne statut 400 si erreur de connexion', async () => {
        loginService.authenticate.mockRejectedValue(new Error('Identifiants incorrects.'));

        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'client@hosbank.com', password: 'badpassword' });

        expect(response.status).toBe(400);
    });

    test('GET /auth/logout - détruit la session et redirige vers la connexion', async () => {
        const agent = request.agent(app);
        loginService.authenticate.mockResolvedValue({
            id: 1,
            email: 'client@hosbank.com',
            role: 'client'
        });

        await agent
            .post('/auth/login')
            .send({ email: 'client@hosbank.com', password: 'password123' });

        const response = await agent.get('/auth/logout');

        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/auth/login');
        expect(response.headers['set-cookie']).toEqual(
            expect.arrayContaining([expect.stringContaining('connect.sid=;')])
        );
    });
});