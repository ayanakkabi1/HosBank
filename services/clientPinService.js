import * as clientPinRepository from '../repositories/clientPinRepository.js';

export const requestPinRenewal = async (clientId) => {
	const pendingRequest = await clientPinRepository.findPendingPinRequest(clientId);

	if (pendingRequest) {
		throw new Error('Une demande de renouvellement de PIN est déjà en cours de traitement.');
	}

	return clientPinRepository.createPinRequest(clientId);
};
