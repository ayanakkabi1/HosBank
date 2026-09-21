import { jest } from '@jest/globals';

const findAccountsByClientId = jest.fn();
const findPendingDemand = jest.fn();
const createDemande = jest.fn();

jest.unstable_mockModule('../repositories/clientAccountRepository.js', () => ({
    findAccountsByClientId,
    findPendingDemand,
    createDemande
}));

const { requestSavingsAccount } = await import('../services/clientAccountService.js');

describe('clientAccountService - requestSavingsAccount', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('devrait créer une demande si le client n’a pas de compte d’épargne et aucune demande en cours', async () => {
        findAccountsByClientId.mockResolvedValue([{ type_compte: 'courant' }]);
        findPendingDemand.mockResolvedValue(null);
        createDemande.mockResolvedValue(123);

        await expect(requestSavingsAccount(7)).resolves.toBe(123);

        expect(findAccountsByClientId).toHaveBeenCalledWith(7);
        expect(findPendingDemand).toHaveBeenCalledWith(7, 'ouverture_compte_epargne');
        expect(createDemande).toHaveBeenCalledWith(7, 'ouverture_compte_epargne');
    });

    test('devrait refuser une demande si le client possède déjà un compte d’épargne', async () => {
        findAccountsByClientId.mockResolvedValue([
            { type_compte: 'courant' },
            { type_compte: 'epargne' }
        ]);

        await expect(requestSavingsAccount(7))
            .rejects
            .toThrow('Vous possédez déjà un compte d\'épargne.');

        expect(createDemande).not.toHaveBeenCalled();
    });

    test('devrait refuser une demande si une demande d’ouverture est déjà en cours', async () => {
        findAccountsByClientId.mockResolvedValue([{ type_compte: 'courant' }]);
        findPendingDemand.mockResolvedValue({ id: 40 });

        await expect(requestSavingsAccount(7))
            .rejects
            .toThrow('Une demande d\'ouverture de compte d\'épargne est déjà en cours de traitement.');

        expect(createDemande).not.toHaveBeenCalled();
    });
});
