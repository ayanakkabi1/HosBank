import * as beneficiaireService from '../services/beneficiareService.js';


export const renderBeneficiaires = async (req, res) => {
    const clientId = req.session.user.id;

    const beneficiaires = await beneficiaireService.getBeneficiaire(clientId);

    res.render('client/beneficiaires', {
        user: req.session.user,
        beneficiaires: beneficiaires,
        error: null,
        success: null
    });
};


export const processAddBeneficiaire = async (req, res) => {
    const { nom_beneficiaire, rib } = req.body;
    const clientId = req.session.user.id;

    try {
        await beneficiaireService.addBeneficiaire(nom_beneficiaire, rib, clientId);

        const beneficiaires = await beneficiaireService.getBeneficiaire(clientId);

        res.render('client/beneficiaires', {
            user: req.session.user,
            beneficiaires: beneficiaires,
            error: null,
            success: 'Bénéficiaire ajouté avec succès !'
        });

    } catch (error) {
        const beneficiaires = await beneficiaireService.getBeneficiaire(clientId);

        res.status(400).render('client/beneficiaires', {
            user: req.session.user,
            beneficiaires: beneficiaires,
            error: error.message,
            success: null
        });
    }
};


export const processDeleteBeneficiaire = async (req, res) => {
    const { id } = req.params;
    const clientId = req.session.user.id;

    try {
        await beneficiaireService.removeBeneficiaire(id, clientId);
        res.redirect('/client/beneficiaires');

    } catch (error) {
        const beneficiaires = await beneficiaireService.getBeneficiaire(clientId);

        res.status(400).render('client/beneficiaires', {
            user: req.session.user,
            beneficiaires: beneficiaires,
            error: error.message,
            success: null
        });
    }
};