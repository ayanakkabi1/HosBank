import pool from '../config/db.js';

export const getClientPinById = async (id, clientId) => {
	const [rows] = await pool.query(
		'SELECT cartes.id, cartes.pin FROM cartes INNER JOIN comptes ON comptes.id = cartes.compte_id WHERE cartes.id = ? AND comptes.client_id = ?',
		[id, clientId]
	);
	return rows[0] || null;
};

export const findPendingPinRequest = async (clientId) => {
	const [rows] = await pool.query(
		'SELECT id FROM demandes WHERE client_id = ? AND type_demande = ? AND statut = "en_attente"',
		[clientId, 'renouvellement_pin']
	);
	return rows[0] || null;
};

export const createPinRequest = async (clientId) => {
	const [result] = await pool.query(
		'INSERT INTO demandes (type_demande, statut, client_id) VALUES (?, "en_attente", ?)',
		['renouvellement_pin', clientId]
	);
	return result.insertId;
};