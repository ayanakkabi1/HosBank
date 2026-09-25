import pool from '../config/db.js';

export const createVirement = async ({ clientId, sourceAccountId, destinationAccountId, amount, motif }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [sourceRows] = await connection.query(
            'SELECT id, solde, statut FROM comptes WHERE id = ? AND client_id = ? FOR UPDATE',
            [sourceAccountId, clientId]
        );
        const sourceAccount = sourceRows[0];

        if (!sourceAccount) {
            throw new Error('Compte source introuvable.');
        }

        const [destinationRows] = await connection.query(
            'SELECT id, statut FROM comptes WHERE id = ? FOR UPDATE',
            [destinationAccountId]
        );
        const destinationAccount = destinationRows[0];

        if (!destinationAccount) {
            throw new Error('Compte destination introuvable.');
        }

        if (sourceAccount.statut !== 'actif' || destinationAccount.statut !== 'actif') {
            throw new Error('Les deux comptes doivent être actifs.');
        }

        if (Number(sourceAccount.solde) < amount) {
            throw new Error('Solde insuffisant.');
        }

        await connection.query(
            'UPDATE comptes SET solde = solde - ? WHERE id = ?',
            [amount, sourceAccountId]
        );
        await connection.query(
            'UPDATE comptes SET solde = solde + ? WHERE id = ?',
            [amount, destinationAccountId]
        );

        const [result] = await connection.query(
            `INSERT INTO virements
                (montant, motif, compte_source_id, compte_destination_id, statut)
             VALUES (?, ?, ?, ?, 'valide')`,
            [amount, motif || null, sourceAccountId, destinationAccountId]
        );

        await connection.commit();
        return { id: result.insertId, amount, motif: motif || null };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const findVirementsByClientId = async (clientId) => {
    const [rows] = await pool.query(
        `SELECT v.id, v.montant, v.motif, v.statut, v.created_at,
                v.compte_source_id, v.compte_destination_id,
                source.rib AS rib_source, destination.rib AS rib_destination,
                CASE WHEN source.client_id = ? THEN 'debit' ELSE 'credit' END AS type_operation
         FROM virements v
         INNER JOIN comptes source ON source.id = v.compte_source_id
         INNER JOIN comptes destination ON destination.id = v.compte_destination_id
         WHERE source.client_id = ? OR destination.client_id = ?
         ORDER BY v.created_at DESC`,
        [clientId, clientId, clientId]
    );

    return rows;
};