import { jest } from '@jest/globals';

const findClientProfileById = jest.fn();
const findClientByEmail = jest.fn();
const updateClientProfile = jest.fn();

jest.unstable_mockModule('../repositories/clientProfileRepository.js', () => ({
    findClientProfileById,
    findClientByEmail,
    updateClientProfile
}));

const { updateClientProfile: updateProfile } = await import('../services/clientProfileService.js');

describe('clientProfileService - updateClientProfile', () => {
    beforeEach(() => jest.clearAllMocks());

    test('met à jour un profil valide et normalise les données', async () => {
        findClientByEmail.mockResolvedValue(null);
        updateClientProfile.mockResolvedValue({
            id: 7,
            nom: 'Dupont',
            prenom: 'Aya',
            email: 'aya@example.com'
        });

        await expect(updateProfile(7, {
            nom: ' Dupont ',
            prenom: ' Aya ',
            email: 'AYA@EXAMPLE.COM'
        })).resolves.toMatchObject({ email: 'aya@example.com' });

        expect(updateClientProfile).toHaveBeenCalledWith(7, {
            nom: 'Dupont',
            prenom: 'Aya',
            email: 'aya@example.com'
        });
    });

    test('refuse une adresse e-mail déjà utilisée', async () => {
        findClientByEmail.mockResolvedValue({ id: 12 });

        await expect(updateProfile(7, {
            nom: 'Dupont',
            prenom: 'Aya',
            email: 'other@example.com'
        })).rejects.toThrow('Cette adresse e-mail est déjà utilisée.');

        expect(updateClientProfile).not.toHaveBeenCalled();
    });
});