import { jest } from '@jest/globals';

const findAccountsByClientId = jest.fn();
const findPendingDemand = jest.fn();
const createDemande = jest.fn();
const findAccountByIdAndClient = jest.fn();

jest.unstable_mockModule('../repositories/clientAccountRepository.js', () => ({
    findAccountsByClientId,
    findPendingDemand,
    createDemande,
    findAccountByIdAndClient
}));

const { requestSavingsAccount, getClientAccountRib } = await import('../services/clientAccountService.js');

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

    test('devrait retourner le RIB du compte si le compte appartient au client', async () => {
        findAccountByIdAndClient.mockResolvedValue({ id: 5, rib: 'FR1420041010050000000000000' });

        await expect(getClientAccountRib(7, 5)).resolves.toBe('FR1420041010050000000000000');
        expect(findAccountByIdAndClient).toHaveBeenCalledWith(5, 7);
    });

    test('devrait refuser la consultation du RIB si le compte n’appartient pas au client', async () => {
        findAccountByIdAndClient.mockResolvedValue(null);

        await expect(getClientAccountRib(7, 999))
            .rejects
            .toThrow('Compte introuvable.');
    });
});
