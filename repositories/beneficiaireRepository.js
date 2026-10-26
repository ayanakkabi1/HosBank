import pool from '../config/db.js';

export const getBeneficiairesByClientId = async (clientId) => {
    const [rows] = await pool.query(
        `SELECT id, nom_beneficiaire, rib, client_id, created_at 
         FROM beneficiaires 
         WHERE client_id = ? 
         ORDER BY created_at DESC`,
        [clientId]
    );
    return rows;
};


export const findBeneficiaireByRibAndClient = async (rib, clientId) => {
    const [rows] = await pool.query(
        `SELECT id, nom_beneficiaire, rib, client_id 
         FROM beneficiaires 
         WHERE rib = ? AND client_id = ?`,
        [rib, clientId]
    );
    return rows[0] || null;
};


export const createBeneficiaire = async (nomBeneficiaire, rib, clientId) => {
    const [result] = await pool.query(
        `INSERT INTO beneficiaires (nom_beneficiaire, rib, client_id) 
         VALUES (?, ?, ?)`,
        [nomBeneficiaire, rib, clientId]
    );
    return result.insertId;
};


export const deleteBeneficiaire = async (id, clientId) => {
    const [result] = await pool.query(
        `DELETE FROM beneficiaires 
         WHERE id = ? AND client_id = ?`,
        [id, clientId]
    );
    return result.affectedRows > 0;
};
