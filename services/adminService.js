import * as adminRepository from '../repositories/adminRepository.js';

export const getClientAssignmentData = async () => {
    const [clients, chargeClients] = await Promise.all([
        adminRepository.findClients(),
        adminRepository.findChargeClients()
    ]);

    return { clients, chargeClients };
};

export const assignClientToCharge = async (clientId, chargeId) => {
    const numericClientId = Number(clientId);
    const numericChargeId = Number(chargeId);

    if (!Number.isInteger(numericClientId) || !Number.isInteger(numericChargeId)) {
        throw new Error('Le client et le chargé client sont obligatoires.');
    }

    const [client, chargeClient] = await Promise.all([
        adminRepository.findClientById(numericClientId),
        adminRepository.findChargeClientById(numericChargeId)
    ]);

    if (!client) {
        throw new Error('Client introuvable.');
    }

    if (!chargeClient) {
        throw new Error('Chargé client introuvable.');
    }

    const assigned = await adminRepository.assignClientToCharge(
        numericClientId,
        numericChargeId
    );

    if (!assigned) {
        throw new Error("L'affectation du client a échoué.");
    }
};
