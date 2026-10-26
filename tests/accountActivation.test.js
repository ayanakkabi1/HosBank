import { jest } from '@jest/globals';

const mockCompte = {
    id: 101,
    rib: '230123456789012345678901',
    solde: 1000.00,
    type_compte: 'courant',
    statut: 'inactif',
    client_id: 5
};

const mockUser = {
    id: 5,
    nom: 'Benali',
    prenom: 'Samir',
    email: 'samir@example.com',
    role: 'client',
    statut: 'inactif'
};

const getCompteById = jest.fn();
const updateCompteStatus = jest.fn();
const getUserById = jest.fn();
const updateUserStatus = jest.fn();
const activateComptesByClientId = jest.fn();

jest.unstable_mockModule('../repositories/adminRepository.js', () => ({
    getCompteById,
    updateCompteStatus,
    getUserById,
    updateUserStatus,
    activateComptesByClientId,
    findClients: jest.fn(),
    findChargeClients: jest.fn(),
    findClientById: jest.fn(),
    findChargeClientById: jest.fn(),
    assignClientToCharge: jest.fn()
}));

const { toggleCompteStatus, toggleUserStatus } = await import('../services/adminService.js');

describe('Gestion de l\'activation des comptes par l\'administrateur', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('L\'admin active un compte bancaire inactif (inactif -> actif)', async () => {
        getCompteById.mockResolvedValue({ ...mockCompte, statut: 'inactif' });
        updateCompteStatus.mockResolvedValue(true);

        const newStatus = await toggleCompteStatus(101);

        expect(getCompteById).toHaveBeenCalledWith(101);
        expect(updateCompteStatus).toHaveBeenCalledWith(101, 'actif');
        expect(newStatus).toBe('actif');
    });

    test('L\'admin bloque un compte bancaire actif (actif -> bloque)', async () => {
        getCompteById.mockResolvedValue({ ...mockCompte, statut: 'actif' });
        updateCompteStatus.mockResolvedValue(true);

        const newStatus = await toggleCompteStatus(101);

        expect(updateCompteStatus).toHaveBeenCalledWith(101, 'bloque');
        expect(newStatus).toBe('bloque');
    });

    test('L\'admin active un utilisateur inactif et active ses comptes bancaires associés', async () => {
        getUserById.mockResolvedValue({ ...mockUser, statut: 'inactif' });
        updateUserStatus.mockResolvedValue(true);
        activateComptesByClientId.mockResolvedValue(1);

        const newStatus = await toggleUserStatus(5);

        expect(getUserById).toHaveBeenCalledWith(5);
        expect(updateUserStatus).toHaveBeenCalledWith(5, 'actif');
        expect(activateComptesByClientId).toHaveBeenCalledWith(5);
        expect(newStatus).toBe('actif');
    });
});
