import {pool} from "../config/db.js";
export const findAccountByClientId = async(clientId)=>{
    const [rows ] = await pool.Query("SELECT * FROM comptes WHERE client.id = ?", [clientId]);
    return rows;
};
export const findAccountByIdAndClient = async (accountId, clientId) => {
    const [rows] = await pool.query(
        'SELECT id, rib, solde, type_compte, statut FROM comptes WHERE id = ? AND client_id = ?',
        [accountId, clientId]
    );
    return rows[0] || null;
};
export const findPendingDemand = async (clientId, typeDemande) => {
    const [rows] = await pool.query(
        'SELECT id FROM demandes WHERE client_id = ? AND type_demande = ? AND statut = "en_attente"',
        [clientId, typeDemande]
    );
    return rows[0] || null;
};

export const createDemande = async (clientId, typeDemande) => {
    const [result] = await pool.query(
        'INSERT INTO demandes (type_demande, statut, client_id) VALUES (?, "en_attente", ?)',
        [typeDemande, clientId]
    );
    return result.insertId;
};
