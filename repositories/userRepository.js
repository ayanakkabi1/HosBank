import pool from '../config/db.js';
 export const findByEmail = async (email) => {
    const [rows] = await pool.query ('SELECT * FROM users WHERE email = ?',[email]);
    return rows[0] || null;
 }