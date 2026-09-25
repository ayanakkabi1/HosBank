import pool from '../config/db.js';

export const findClientProfileById = async (clientId) => {
    const [rows] = await pool.query(
        'SELECT id, nom, prenom, email FROM users WHERE id = ? AND role = "client"',
        [clientId]
    );
    return rows[0] || null;
};

export const findClientByEmail = async (email, clientId) => {
    const [rows] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id <> ?',
        [email, clientId]
    );
    return rows[0] || null;
};

export const updateClientProfile = async (clientId, profile) => {
    await pool.query(
        'UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ? AND role = "client"',
        [profile.nom, profile.prenom, profile.email, clientId]
    );
    return findClientProfileById(clientId);
};

export const assignClientTochargeClient = async (clientId , charge_id) => {
    const [rows] =await pool.query(
        'UPDATE users Set charge_id = ? WHERE id = ? AND role ="client"',
        [charge_id,clientId]
    )
    return result.affectedrows >0;
}