import * as compteService from '../services/compteService.js';






export const renderDashboard = async (req, res) => {
    try {
        const client = req.session.user;
        const dashboardData = await compteService.getDashboardData(client.id);

        res.render('client/dashboard', {
            user: client,
            ...dashboardData,
            error: null
        });
    } catch (error) {
        console.error('[Dashboard Error]', error);
        res.status(500).render('client/dashboard', {
            user: req.session.user || {},
            comptes: [],
            totalSolde: 0,
            totalSoldeFormatted: '0,00 MAD',
            nombreComptes: 0,
            recentOperations: [],
            error: 'Une erreur est survenue lors de la récupération de vos données bancaires.'
        });
    }
};
