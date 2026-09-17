import { jest } from '@jest/globals';

const query = jest.fn();

jest.unstable_mockModule('../config/db.js', () => ({
    default: { query }
}));

const { findUserByEmail } = await import('../repositories/loginRepository.js');

describe('loginRepository - findUserByEmail', () => {
    beforeEach(() => {
        query.mockReset();
    });

    test('returns the first user matching the email', async () => {
        const user = { id: 1, email: 'client@hosbank.com' };
        query.mockResolvedValue([[user]]);

        await expect(findUserByEmail(user.email)).resolves.toEqual(user);
        expect(query).toHaveBeenCalledWith(
            'SELECT * FROM users WHERE email = ?',
            [user.email]
        );
    });

    test('returns null when the email does not exist', async () => {
        query.mockResolvedValue([[]]);

        await expect(findUserByEmail('unknown@hosbank.com')).resolves.toBeNull();
    });

    test('propagates database errors', async () => {
        const databaseError = new Error('Database unavailable');
        query.mockRejectedValue(databaseError);

        await expect(findUserByEmail('client@hosbank.com'))
            .rejects
            .toBe(databaseError);
    });
});
