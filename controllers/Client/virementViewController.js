import * as virementService from '../../services/virementService.js';
import * as compteService from '../../services/compteService.js';
import * as beneficiaireService from '../../services/beneficiareService.js';
import pool from '../../config/db.js';

/**
 * Résout un RIB en compte_id depuis la base de données
 */
const resolveRibToCompteId = async (rib) => {
    const [rows] = await pool.query(
        'SELECT id FROM comptes WHERE rib = ? AND statut = "actif"',
        [rib]
    );
    return rows[0] ? rows[0].id : null;
};

/**
 * Affiche la page de virement avec les données nécessaires.
 */
export const renderVirement = async (req, res) => {
    const clientId = req.session.user.id;

    try {
        const [dashboardData, beneficiaires, virements] = await Promise.all([
            compteService.getDashboardData(clientId),
            beneficiaireService.getBeneficiaire(clientId),
            virementService.getVirementHistory(clientId)
        ]);

        res.render('client/virement', {
            user: req.session.user,
            comptes: dashboardData.comptes || [],
            beneficiaires: beneficiaires || [],
            virements: virements || [],
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('[Virement Render Error]', error);
        res.status(500).render('errors/error', { message: error.message });
    }
};

/**
 * Traite la soumission du formulaire de virement.
 * Le formulaire envoie sourceAccountId (id compte) et beneficiaireId (id beneficiaire)
 * On résout le RIB du bénéficiaire en compte_id destination.
 */
export const processVirement = async (req, res) => {
    const clientId = req.session.user.id;
    const { sourceAccountId, beneficiaireId, amount, motif } = req.body;

    const renderWithError = async (errorMsg) => {
        try {
            const [dashboardData, beneficiaires, virements] = await Promise.all([
                compteService.getDashboardData(clientId),
                beneficiaireService.getBeneficiaire(clientId),
                virementService.getVirementHistory(clientId)
            ]);
            return res.status(400).render('client/virement', {
                user: req.session.user,
                comptes: dashboardData.comptes || [],
                beneficiaires: beneficiaires || [],
                virements: virements || [],
                error: errorMsg,
                success: null
            });
        } catch {
            return res.status(500).render('errors/error', { message: errorMsg });
        }
    };

    try {
        // Récupérer le bénéficiaire et résoudre son RIB en compte_id
        const beneficiaires = await beneficiaireService.getBeneficiaire(clientId);
        const beneficiaire = beneficiaires.find(b => String(b.id) === String(beneficiaireId));

        if (!beneficiaire) {
            return renderWithError('Bénéficiaire introuvable.');
        }

        const destinationAccountId = await resolveRibToCompteId(beneficiaire.rib);
        if (!destinationAccountId) {
            return renderWithError(`Aucun compte actif trouvé pour le RIB de ${beneficiaire.nom_beneficiaire}.`);
        }

        await virementService.createVirement(
            clientId,
            sourceAccountId,
            destinationAccountId,
            amount,
            motif
        );

        res.redirect('/client/virement?success=Virement+effectué+avec+succès');
    } catch (error) {
        console.error('[Virement Process Error]', error);
        return renderWithError(error.message);
    }
};
