import pool from '../config/db.js';

/**
 * Récupère tous les utilisateurs avec le décompte de leurs comptes bancaires
 */
export const getAllUsers = async () => {
    const [rows] = await pool.query(`
        SELECT u.id, u.nom, u.prenom, u.email, u.role, u.statut, u.created_at,
               COUNT(DISTINCT c.id) AS nb_comptes
        FROM users u
        LEFT JOIN comptes c ON c.client_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `);
    return rows;
};

/**
 * Récupère un utilisateur par son identifiant
 */
export const getUserById = async (id) => {
    const [rows] = await pool.query(
        'SELECT id, nom, prenom, email, role, statut, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

/**
 * Récupère un utilisateur par email (utile pour vérifier l'unicité)
 */
export const getUserByEmail = async (email) => {
    const [rows] = await pool.query(
        'SELECT id, email FROM users WHERE email = ?',
        [email]
    );
    return rows[0] || null;
};

/**
 * Crée un nouvel utilisateur avec rôle et statut spécifiés
 */
export const createUser = async ({ nom, prenom, email, password, role = 'client', statut = 'actif' }) => {
    const [result] = await pool.query(
        `INSERT INTO users (nom, prenom, email, password, role, statut)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nom, prenom, email, password, role, statut]
    );
    return result.insertId;
};

/**
 * Met à jour les informations d'un utilisateur (nom, prénom, email, rôle, statut)
 */
export const updateUser = async (id, { nom, prenom, email, role, statut }) => {
    const [result] = await pool.query(
        `UPDATE users
         SET nom = ?, prenom = ?, email = ?, role = ?, statut = ?
         WHERE id = ?`,
        [nom, prenom, email, role, statut, id]
    );
    return result.affectedRows > 0;
};

/**
 * Met à jour le statut d'un utilisateur (actif, inactif, etc.)
 */
export const updateUserStatus = async (id, statut) => {
    const [result] = await pool.query(
        'UPDATE users SET statut = ? WHERE id = ?',
        [statut, id]
    );
    return result.affectedRows > 0;
};

/**
 * Supprime un utilisateur par son ID
 */
export const deleteUser = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

/**
 * Récupère tous les comptes avec le nom complet de leur titulaire
 */
export const getAllComptes = async () => {
    const [rows] = await pool.query(`
        SELECT c.id, c.rib, c.solde, c.type_compte, c.statut, c.client_id, c.created_at,
               u.nom AS client_nom, u.prenom AS client_prenom, u.email AS client_email
        FROM comptes c
        JOIN users u ON u.id = c.client_id
        ORDER BY c.created_at DESC
    `);
    return rows;
};

/**
 * Récupère un compte par son ID
 */
export const getCompteById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM comptes WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

/**
 * Crée un compte bancaire
 */
export const createCompte = async ({ rib, solde = 0.00, type_compte = 'courant', statut = 'actif', client_id }) => {
    const [result] = await pool.query(
        `INSERT INTO comptes (rib, solde, type_compte, statut, client_id)
         VALUES (?, ?, ?, ?, ?)`,
        [rib, solde, type_compte, statut, client_id]
    );
    return result.insertId;
};

/**
 * Met à jour le statut d'un compte (actif, suspendu, clôturé)
 */
export const updateCompteStatus = async (id, statut) => {
    const [result] = await pool.query(
        'UPDATE comptes SET statut = ? WHERE id = ?',
        [statut, id]
    );
    return result.affectedRows > 0;
};

/**
 * Récupère toutes les cartes bancaires avec le RIB et titulaire associé
 */
export const getAllCartes = async () => {
    const [rows] = await pool.query(`
        SELECT k.id, k.numero_carte, k.type_carte, k.date_expiration, k.plafond, k.statut, k.compte_id, k.created_at,
               c.rib, u.id AS client_id, u.nom AS client_nom, u.prenom AS client_prenom
        FROM cartes k
        JOIN comptes c ON c.id = k.compte_id
        JOIN users u ON u.id = c.client_id
        ORDER BY k.created_at DESC
    `);
    return rows;
};

/**
 * Récupère une carte par son ID
 */
export const getCarteById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM cartes WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

/**
 * Crée une carte bancaire pour un compte
 */
export const createCarte = async ({ numero_carte, type_carte = 'virtuelle', date_expiration, plafond = 5000.00, statut = 'active', compte_id }) => {
    const [result] = await pool.query(
        `INSERT INTO cartes (numero_carte, type_carte, date_expiration, plafond, statut, compte_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [numero_carte, type_carte, date_expiration, plafond, statut, compte_id]
    );
    return result.insertId;
};

/**
 * Met à jour le statut d'une carte (active, bloquee, desactivee)
 */
export const updateCarteStatus = async (id, statut) => {
    const [result] = await pool.query(
        'UPDATE cartes SET statut = ? WHERE id = ?',
        [statut, id]
    );
    return result.affectedRows > 0;
};

/**
 * Active tous les comptes inactifs d'un client
 */
export const activateComptesByClientId = async (clientId) => {
    const [result] = await pool.query(
        "UPDATE comptes SET statut = 'actif' WHERE client_id = ? AND statut = 'inactif'",
        [clientId]
    );
    return result.affectedRows;
};

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
