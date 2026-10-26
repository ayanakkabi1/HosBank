import { jest } from '@jest/globals';

const findPendingPinRequest = jest.fn();
const createPinRequest = jest.fn();

jest.unstable_mockModule('../repositories/clientPinRepository.js', () => ({
    findPendingPinRequest,
    createPinRequest
}));

const { requestPinRenewal } = await import('../services/clientPinService.js');

describe('clientPinService - requestPinRenewal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('devrait créer une demande si aucune demande PIN n’est en attente', async () => {
        findPendingPinRequest.mockResolvedValue(null);
        createPinRequest.mockResolvedValue(15);

        await expect(requestPinRenewal(7)).resolves.toBe(15);

        expect(findPendingPinRequest).toHaveBeenCalledWith(7);
        expect(createPinRequest).toHaveBeenCalledWith(7);
    });

    test('devrait refuser une nouvelle demande si une demande PIN est déjà en attente', async () => {
        findPendingPinRequest.mockResolvedValue({ id: 15 });

        await expect(requestPinRenewal(7))
            .rejects
            .toThrow('Une demande de renouvellement de PIN est déjà en cours de traitement.');

        expect(createPinRequest).not.toHaveBeenCalled();
    });
});
