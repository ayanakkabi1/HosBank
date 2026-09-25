import { jest } from '@jest/globals';

jest.unstable_mockModule('../repositories/registerRepository.js', () => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    findUserByVerificationToken: jest.fn(),
    activateUserAccount: jest.fn()
}));

jest.unstable_mockModule('../repositories/compteRepository.js', () => ({
    createCompte: jest.fn().mockResolvedValue(1),
    getComptesByClientId: jest.fn().mockResolvedValue([])
}));

jest.unstable_mockModule('../services/emailService.js', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue('http://mocklink')
}));

jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash: jest.fn().mockResolvedValue('hashed_secret_123')
    }
}));

const {
    findUserByEmail,
    createUser,
    findUserByVerificationToken,
    activateUserAccount
} = await import('../repositories/registerRepository.js');

const {
    createCompte,
    getComptesByClientId
} = await import('../repositories/compteRepository.js');

const { register, verifyEmailToken } = await import('../services/registerService.js');

describe('registerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        test('devrait inscrire un utilisateur avec succès et retourner son id et token', async () => {
            findUserByEmail.mockResolvedValue(null);
            createUser.mockResolvedValue(42);

            const result = await register(
                'Alami',
                'Karim',
                'karim.alami@example.com',
                'Password123',
                'Password123'
            );

            expect(result.userId).toBe(42);
            expect(typeof result.verificationToken).toBe('string');
            expect(findUserByEmail).toHaveBeenCalledWith('karim.alami@example.com');
            expect(createUser).toHaveBeenCalledWith(
                'Alami',
                'Karim',
                'karim.alami@example.com',
                'hashed_secret_123',
                expect.any(String)
            );
            expect(createCompte).toHaveBeenCalledWith(
                expect.any(String),
                42,
                1000.00,
                'courant',
                'inactif'
            );
        });

        test('devrait rejeter si un champ est manquant', async () => {
            await expect(register('', 'Karim', 'karim@example.com', 'Pass1234', 'Pass1234'))
                .rejects
                .toThrow('Tous les champs sont obligatoires.');
        });

        test('devrait rejeter un format d\'email invalide', async () => {
            await expect(register('Alami', 'Karim', 'format-invalide', 'Pass1234', 'Pass1234'))
                .rejects
                .toThrow('Veuillez fournir une adresse email valide.');
        });

        test('devrait rejeter un mot de passe trop court (< 8 caractères)', async () => {
            await expect(register('Alami', 'Karim', 'karim@example.com', 'Pass1', 'Pass1'))
                .rejects
                .toThrow('Le mot de passe doit contenir au moins 8 caractères.');
        });

        test('devrait rejeter si les mots de passe ne correspondent pas', async () => {
            await expect(register('Alami', 'Karim', 'karim@example.com', 'Password123', 'DifferentPassword123'))
                .rejects
                .toThrow('Les mots de passe ne correspondent pas.');
        });

        test('devrait rejeter si l\'email est déjà utilisé', async () => {
            findUserByEmail.mockResolvedValue({ id: 1, email: 'existant@example.com' });

            await expect(register('Alami', 'Karim', 'existant@example.com', 'Password123', 'Password123'))
                .rejects
                .toThrow('Cette adresse email est déjà utilisée.');
        });
    });

    describe('verifyEmailToken', () => {
        test('devrait activer le compte si le token est valide', async () => {
            const mockUser = { id: 10, email: 'test@example.com', statut: 'en_attente' };
            findUserByVerificationToken.mockResolvedValue(mockUser);
            activateUserAccount.mockResolvedValue(true);

            const user = await verifyEmailToken('valid_token_123');

            expect(findUserByVerificationToken).toHaveBeenCalledWith('valid_token_123');
            expect(activateUserAccount).toHaveBeenCalledWith('valid_token_123');
            expect(user.id).toBe(10);
        });

        test('devrait rejeter si le token est manquant', async () => {
            await expect(verifyEmailToken(null))
                .rejects
                .toThrow('Jeton de vérification invalide ou manquant.');
        });

        test('devrait rejeter si aucun utilisateur ne correspond au token', async () => {
            findUserByVerificationToken.mockResolvedValue(null);

            await expect(verifyEmailToken('token_inexistant'))
                .rejects
                .toThrow('Jeton de vérification invalide ou déjà utilisé.');
        });
    });
});
