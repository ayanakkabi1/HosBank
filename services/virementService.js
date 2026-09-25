import * as virementRepository from '../repositories/virementRepository.js';

export const createVirement = async (clientId, sourceAccountId, destinationAccountId, amount, motif) => {
    const numericAmount = Number(amount);

    if (!Number.isInteger(Number(sourceAccountId)) || !Number.isInteger(Number(destinationAccountId))) {
        throw new Error('Les comptes indiqués sont invalides.');
    }

    if (Number(sourceAccountId) === Number(destinationAccountId)) {
        throw new Error('Le compte source et le compte destination doivent être différents.');
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error('Le montant doit être supérieur à zéro.');
    }

    return virementRepository.createVirement({
        clientId,
        sourceAccountId: Number(sourceAccountId),
        destinationAccountId: Number(destinationAccountId),
        amount: numericAmount,
        motif: motif?.trim() || null
    });
};

export const getVirementHistory = async (clientId) => {
    return virementRepository.findVirementsByClientId(clientId);
};