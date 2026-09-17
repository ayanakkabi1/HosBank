import pool from "../config/db.js";

describe('Tests Automatisés de la Base de Données',()=>{
    afterAll(async () => {
        await pool.end();
    });
    test('Doit se connecter avec succès à la base de données MySQL', async () => {
        const connection = await pool.getConnection();
        expect(connection).toBeDefined();
        connection.release();
    });

    test('Doit exécuter une requête SQL simple (SELECT 1 + 1)', async () => {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        expect(rows[0].result).toBe(2);
    });

    test('Doit vérifier la présence de la table users', async () => {
        const [tables] = await pool.query("SHOW TABLES LIKE 'users'");
        expect(tables.length).toBeGreaterThan(0);
    });
})


