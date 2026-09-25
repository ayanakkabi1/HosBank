import * as carteService from '../services/carteService.js';


export const renderDemandeCarte = async (req, res) => {
    const clientId = req.session.user.id;
    const demandes = await carteService.getMesDemandesCarte(clientId);

    res.render('client/carte', {
        user: req.session.user,
        demandes: demandes,
        error: null,
        success: null
    });
};


export const processDemanderCarte = async (req, res) => {
    const clientId = req.session.user.id;

    try {
        await carteService.demanderCarteVirtuelle(clientId);

        const demandes = await carteService.getMesDemandesCarte(clientId);

        res.render('client/carte', {
            user: req.session.user,
            demandes: demandes,
            error: null,
            success: 'Votre demande de carte virtuelle a été soumise avec succès !'
        });

    } catch (error) {
        const demandes = await carteService.getMesDemandesCarte(clientId);

        res.status(400).render('client/carte', {
            user: req.session.user,
            demandes: demandes,
            error: error.message,
            success: null
        });
    }
};
