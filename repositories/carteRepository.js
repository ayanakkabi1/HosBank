import pool from '../config/db.js';






export const createDemandeCarte = async (clientId) => {
    const [result] = await pool.query(
        `INSERT INTO demandes (type_demande, statut, client_id) 
         VALUES ('carte_virtuelle', 'en_attente', ?)`,
        [clientId]
    );
    return result.insertId;
};






export const getDemandesCarteByClientId = async (clientId) => {
    const [rows] = await pool.query(
        `SELECT id, type_demande, statut, created_at 
         FROM demandes 
         WHERE client_id = ? AND type_demande = 'carte_virtuelle' 
         ORDER BY created_at DESC`,
        [clientId]
    );
    return rows;
};
