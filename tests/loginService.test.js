import { jest } from '@jest/globals';

jest.unstable_mockModule('../repositories/loginRepository.js', () => ({
    findUserByEmail: jest.fn()
}));

jest.unstable_mockModule('bcrypt', () => ({
    default: {
        compare: jest.fn()
    }
}));

const { findUserByEmail } = await import('../repositories/loginRepository.js');
const bcrypt = (await import('bcrypt')).default;
const { login } = await import('../services/loginService.js');

describe('loginService - login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('devrait réussir l\'authentification si les identifiants et le statut sont valides', async () => {
        const mockUser = {
            id: 1,
            email: 'client@hosbank.com',
            password: '$2b$10$hashedpassword',
            statut: 'actif',
            role: 'client'
        };

        findUserByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        const user = await login('client@hosbank.com', 'password123');

        expect(findUserByEmail).toHaveBeenCalledWith('client@hosbank.com');
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2b$10$hashedpassword');
        expect(user).not.toHaveProperty('password');
        expect(user.email).toBe('client@hosbank.com');
    });

    test('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
        findUserByEmail.mockResolvedValue(null);

        await expect(login('inconnu@hosbank.com', 'password123'))
            .rejects
            .toThrow('Identifiants incorrects.');
    });

    test('devrait lever une erreur si le mot de passe est incorrect', async () => {
        const mockUser = { id: 1, email: 'client@hosbank.com', password: '$2b$10$hashedpassword', statut: 'actif' };
        findUserByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(login('client@hosbank.com', 'wrongpassword'))
            .rejects
            .toThrow('Identifiants incorrects.');
    });

    test('devrait lever une erreur si le compte n\'est pas actif', async () => {
        const mockUser = { id: 1, email: 'client@hosbank.com', password: '$2b$10$hashedpassword', statut: 'en_attente' };
        findUserByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        await expect(login('client@hosbank.com', 'password123'))
            .rejects
            .toThrow('Votre compte est en attente de validation ou suspendu.');
    });
});