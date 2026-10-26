import pool from '../config/db.js';




export const getAllVirements = async (limit = 100, offset = 0) => {
    const [rows] = await pool.query(`
        SELECT v.id, v.montant, v.motif, v.statut, v.created_at,
               cs.rib AS source_rib, us.nom AS source_client_nom, us.prenom AS source_client_prenom,
               cd.rib AS dest_rib, ud.nom AS dest_client_nom, ud.prenom AS dest_client_prenom
        FROM virements v
        JOIN comptes cs ON cs.id = v.compte_source_id
        JOIN users us ON us.id = cs.client_id
        JOIN comptes cd ON cd.id = v.compte_destination_id
        JOIN users ud ON ud.id = cd.client_id
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
    `, [Number(limit), Number(offset)]);
    return rows;
};




export const getAllDemandes = async (limit = 100, offset = 0) => {
    const [rows] = await pool.query(`
        SELECT d.id, d.type_demande, d.statut, d.created_at, d.updated_at,
               u.id AS client_id, u.nom AS client_nom, u.prenom AS client_prenom, u.email AS client_email,
               c.id AS charge_id, c.nom AS charge_nom, c.prenom AS charge_prenom
        FROM demandes d
        JOIN users u ON u.id = d.client_id
        LEFT JOIN users c ON c.id = d.traite_par_id
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
    `, [Number(limit), Number(offset)]);
    return rows;
};




export const getAllReclamations = async (limit = 100, offset = 0) => {
    const [rows] = await pool.query(`
        SELECT r.id, r.sujet, r.description, r.statut, r.reponse, r.created_at, r.updated_at,
               u.id AS client_id, u.nom AS client_nom, u.prenom AS client_prenom, u.email AS client_email,
               c.id AS charge_id, c.nom AS charge_nom, c.prenom AS charge_prenom
        FROM reclamations r
        JOIN users u ON u.id = r.client_id
        LEFT JOIN users c ON c.id = r.traite_par_id
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    `, [Number(limit), Number(offset)]);
    return rows;
};




export const getSupervisionCharges = async () => {
    const [rows] = await pool.query(`
        SELECT u.id, u.nom, u.prenom, u.email, u.statut, u.created_at,
               COUNT(DISTINCT client.id) AS nb_clients_assignes,
               COUNT(DISTINCT d.id) AS nb_demandes_traitees,
               COUNT(DISTINCT r.id) AS nb_reclamations_traitees
        FROM users u
        LEFT JOIN users client ON client.charge_id = u.id
        LEFT JOIN demandes d ON d.traite_par_id = u.id
        LEFT JOIN reclamations r ON r.traite_par_id = u.id
        WHERE u.role = 'charge_clientele'
        GROUP BY u.id
        ORDER BY u.nom ASC
    `);
    return rows;
};




export const getGlobalFinancialStats = async () => {
    const [[depotsRow]] = await pool.query(`
        SELECT COALESCE(SUM(solde), 0) AS total_depots,
               COUNT(*) AS total_comptes,
               COALESCE(AVG(solde), 0) AS solde_moyen
        FROM comptes
    `);

    const [[virementsRow]] = await pool.query(`
        SELECT COALESCE(SUM(montant), 0) AS volume_virements,
               COUNT(*) AS nb_virements,
               COALESCE(AVG(montant), 0) AS virement_moyen
        FROM virements
    `);

    return {
        totalDepots: Number(depotsRow.total_depots),
        totalComptes: Number(depotsRow.total_comptes),
        soldeMoyen: Number(depotsRow.solde_moyen),
        volumeVirements: Number(virementsRow.volume_virements),
        nbVirements: Number(virementsRow.nb_virements),
        virementMoyen: Number(virementsRow.virement_moyen)
    };
};




export const getDemandesAggregation = async () => {
    const [parStatut] = await pool.query(`
        SELECT statut, COUNT(*) AS count
        FROM demandes
        GROUP BY statut
    `);

    const [parType] = await pool.query(`
        SELECT type_demande, COUNT(*) AS count
        FROM demandes
        GROUP BY type_demande
    `);

    return { parStatut, parType };
};




export const getReclamationsAggregation = async () => {
    const [parStatut] = await pool.query(`
        SELECT statut, COUNT(*) AS count
        FROM reclamations
        GROUP BY statut
    `);
    return parStatut;
};




export const getUsersAggregation = async () => {
    const [rows] = await pool.query(`
        SELECT role, statut, COUNT(*) AS count
        FROM users
        GROUP BY role, statut
    `);
    return rows;
};
