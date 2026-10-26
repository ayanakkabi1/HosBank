import { jest } from '@jest/globals';

const findClients = jest.fn();
const findChargeClients = jest.fn();
const findClientById = jest.fn();
const findChargeClientById = jest.fn();
const assignClientToCharge = jest.fn();

jest.unstable_mockModule('../repositories/adminRepository.js', () => ({
    findClients,
    findChargeClients,
    findClientById,
    findChargeClientById,
    assignClientToCharge
}));

const { assignClientToCharge: assignClient } = await import('../services/adminService.js');

describe('adminService - assignClientToCharge', () => {
    beforeEach(() => jest.clearAllMocks());

    test('affecte un client à un chargé client valide', async () => {
        findClientById.mockResolvedValue({ id: 7, role: 'client' });
        findChargeClientById.mockResolvedValue({ id: 3, role: 'charge_clientele' });
        assignClientToCharge.mockResolvedValue(true);

        await expect(assignClient('7', '3')).resolves.toBeUndefined();
        expect(assignClientToCharge).toHaveBeenCalledWith(7, 3);
    });

    test('refuse un utilisateur qui n’est pas chargé client', async () => {
        findClientById.mockResolvedValue({ id: 7, role: 'client' });
        findChargeClientById.mockResolvedValue(null);

        await expect(assignClient(7, 3)).rejects.toThrow('Chargé client introuvable.');
        expect(assignClientToCharge).not.toHaveBeenCalled();
    });
});
