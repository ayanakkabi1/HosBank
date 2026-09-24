import pool from '../config/db.js';

export const findClients = async () => {
    const [rows] = await pool.query(`
        SELECT
            client.id,
            client.nom,
            client.prenom,
            client.email,
            client.charge_id,
            charge.nom AS charge_nom,
            charge.prenom AS charge_prenom
        FROM users AS client
        LEFT JOIN users AS charge ON charge.id = client.charge_id
        WHERE client.role = 'client'
        ORDER BY client.nom, client.prenom
    `);
    return rows;
};

export const findChargeClients = async () => {
    const [rows] = await pool.query(
        "SELECT id, nom, prenom, email FROM users WHERE role = 'charge_clientele' ORDER BY nom, prenom"
    );
    return rows;
};

export const findChargeClientById = async (chargeId) => {
    const [rows] = await pool.query(
        "SELECT id, nom, prenom, email FROM users WHERE id = ? AND role = 'charge_clientele'",
        [chargeId]
    );
    return rows[0] || null;
};

export const findClientById = async (clientId) => {
    const [rows] = await pool.query(
        "SELECT id, nom, prenom, email, charge_id FROM users WHERE id = ? AND role = 'client'",
        [clientId]
    );
    return rows[0] || null;
};

export const assignClientToCharge = async (clientId, chargeId) => {
    const [result] = await pool.query(
        "UPDATE users SET charge_id = ? WHERE id = ? AND role = 'client'",
        [chargeId, clientId]
    );
    return result.affectedRows > 0;
};
