import { jest } from '@jest/globals';

const createVirementRepository = jest.fn();
const findVirementsByClientId = jest.fn();

jest.unstable_mockModule('../repositories/virementRepository.js', () => ({
    createVirement: createVirementRepository,
    findVirementsByClientId
}));

const { createVirement, getVirementHistory } = await import('../services/virementService.js');

describe('virementService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('crée un virement avec un montant valide', async () => {
        createVirementRepository.mockResolvedValue({ id: 10 });

        await expect(createVirement(7, '1', '2', '125.50', 'Facture'))
            .resolves.toEqual({ id: 10 });

        expect(createVirementRepository).toHaveBeenCalledWith({
            clientId: 7,
            sourceAccountId: 1,
            destinationAccountId: 2,
            amount: 125.5,
            motif: 'Facture'
        });
    });

    test('refuse un montant nul ou négatif', async () => {
        await expect(createVirement(7, 1, 2, 0))
            .rejects.toThrow('Le montant doit être supérieur à zéro.');

        expect(createVirementRepository).not.toHaveBeenCalled();
    });

    test('refuse le même compte source et destination', async () => {
        await expect(createVirement(7, 1, 1, 50))
            .rejects.toThrow('Le compte source et le compte destination doivent être différents.');
    });

    test('retourne l’historique du client', async () => {
        const history = [{ id: 10, montant: '125.50' }];
        findVirementsByClientId.mockResolvedValue(history);

        await expect(getVirementHistory(7)).resolves.toEqual(history);
        expect(findVirementsByClientId).toHaveBeenCalledWith(7);
    });
});