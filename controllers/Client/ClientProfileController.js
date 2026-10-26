import * as clientProfileService from '../../services/clientProfileService.js';

export const renderClientProfile = async (req, res) => {
    try {
        const profile = await clientProfileService.getClientProfile(req.session.user.id);
        res.render('client/profile', {
            profile,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        res.status(404).render('errors/error', { message: error.message });
    }
};

export const processClientProfile = async (req, res) => {
    try {
        const profile = await clientProfileService.updateClientProfile(
            req.session.user.id,
            req.body
        );
        req.session.user.nom = profile.nom;
        req.session.user.prenom = profile.prenom;
        req.session.user.email = profile.email;
        res.redirect('/client/profile?success=Informations+personnelles+mises+a+jour');
    } catch (error) {
        res.redirect(`/client/profile?error=${encodeURIComponent(error.message)}`);
    }
};
