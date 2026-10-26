import pool from "../config/db.js";

export const findUserByEmail = async(email)=>{
    const [rows] = await pool.query(
        "SELECT * from users WHERE email = ?",
        [email]
    );
    return rows[0] || null;
};

export const createUser = async (nom, prenom, email, password, verificationToken) => {
    const [result] = await pool.query(
        `INSERT INTO users (nom, prenom, email, password, statut, role, verification_token)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nom, prenom, email, password, 'en_attente', 'client', verificationToken]
    );
    return result.insertId;
};

export const findUserByVerificationToken = async (token) => {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE verification_token = ?",
        [token]
    );
    return rows[0] || null;
};

export const activateUserAccount = async (token) => {
    const [result] = await pool.query(
        "UPDATE users SET statut = 'actif', verification_token = NULL WHERE verification_token = ?",
        [token]
    );
    return result.affectedRows > 0;
};