import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';

jest.unstable_mockModule('../services/compteService.js', () => ({
    getDashboardData: jest.fn()
}));

const compteService = await import('../services/compteService.js');
const clientRoutes = (await import('../routes/clientRoutes.js')).default;

const createApp = (sessionUser = null) => {
    const app = express();
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(session({
        secret: 'test_secret',
        resave: false,
        saveUninitialized: false
    }));

    // Middleware d'injection de session pour les tests
    app.use((req, res, next) => {
        if (sessionUser) {
            req.session.user = sessionUser;
        }
        next();
    });

    app.set('view engine', 'ejs');
    app.set('views', './views');

    app.use('/client', clientRoutes);
    return app;
};

describe('clientRoutes - HOS-31 / HOS-33 RBAC & HTTP Isolation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /client/dashboard - redirige vers /auth/login si non authentifié', async () => {
        const app = createApp(null);
        const response = await request(app).get('/client/dashboard');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/auth/login');
    });

    test('GET /client/dashboard - interdit l\'accès (403) si le rôle n\'est pas client', async () => {
        const app = createApp({ id: 2, role: 'admin', nom: 'Admin', prenom: 'HosBank' });
        const response = await request(app).get('/client/dashboard');
        expect(response.status).toBe(403);
        expect(response.text).toContain('Accès refusé.');
    });

    test('GET /client/dashboard - affiche le dashboard pour un client authentifié', async () => {
        const mockClient = { id: 42, role: 'client', nom: 'Qnais', prenom: 'Adnane', email: 'adnane@example.com' };
        const app = createApp(mockClient);

        compteService.getDashboardData.mockResolvedValue({
            comptes: [
                {
                    id: 1,
                    labelType: 'Compte Courant',
                    soldeFormatted: '12 500,00 MAD',
                    ribFormatted: '1234 5678 9012 3456 7890 1234',
                    badgeClass: 'badge-success',
                    statut: 'actif'
                }
            ],
            totalSolde: 12500,
            totalSoldeFormatted: '12 500,00 MAD',
            nombreComptes: 1,
            recentOperations: []
        });

        const response = await request(app).get('/client/dashboard');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Tableau de bord Client - HosBank');
        expect(response.text).toContain('12 500,00 MAD');
        expect(response.text).toContain('Bonjour, Adnane');
        // Vérification que le clientId passé au service est bien celui de la session
        expect(compteService.getDashboardData).toHaveBeenCalledWith(42);
    });
});
