import pool from '../config/db.js';






export const getComptesByClientId = async (clientId) => {
    const [rows] = await pool.query(
        `SELECT id, rib, solde, type_compte, statut, created_at 
         FROM comptes 
         WHERE client_id = ? 
         ORDER BY created_at ASC`,
        [clientId]
    );
    return rows;
};






export const getTotalSoldeByClientId = async (clientId) => {
    const [rows] = await pool.query(
        `SELECT COALESCE(SUM(solde), 0) AS total_solde 
         FROM comptes 
         WHERE client_id = ? AND statut = 'actif'`,
        [clientId]
    );
    return parseFloat(rows[0]?.total_solde || 0);
};







export const getRecentOperationsByClientId = async (clientId, limit = 5) => {
    const [rows] = await pool.query(
        `SELECT 
            v.id,
            v.montant,
            v.motif,
            v.statut,
            v.created_at,
            cs.rib AS source_rib,
            cd.rib AS destination_rib,
            CASE 
                WHEN cs.client_id = ? THEN 'debit'
                ELSE 'credit'
            END AS sens
         FROM virements v
         JOIN comptes cs ON v.compte_source_id = cs.id
         JOIN comptes cd ON v.compte_destination_id = cd.id
         WHERE cs.client_id = ? OR cd.client_id = ?
         ORDER BY v.created_at DESC
         LIMIT ?`,
        [clientId, clientId, clientId, limit]
    );
    return rows;
};

/**
 * Crée un compte bancaire pour un client (statut inactif par défaut jusqu'à activation admin)
 * @param {string} rib 
 * @param {number} clientId 
 * @param {number} soldeInitial 
 * @param {string} typeCompte 
 * @param {string} statut 
 * @returns {Promise<number>} ID du compte créé
 */
export const createCompte = async (rib, clientId, soldeInitial = 1000.00, typeCompte = 'courant', statut = 'inactif') => {
    const [result] = await pool.query(
        `INSERT INTO comptes (rib, solde, type_compte, statut, client_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [rib, soldeInitial, typeCompte, statut, clientId]
    );
    return result.insertId;
};

/**
 * Active un compte bancaire
 * @param {number} compteId 
 * @returns {Promise<boolean>}
 */
export const activateCompteById = async (compteId) => {
    const [result] = await pool.query(
        `UPDATE comptes SET statut = 'actif' WHERE id = ?`,
        [compteId]
    );
    return result.affectedRows > 0;
};
