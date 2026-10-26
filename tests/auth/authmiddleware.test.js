import { jest } from '@jest/globals';
import { isAuth, isGuest, hasRole } from '../../middlewares/authmiddleware.js';

const createResponse = () => ({
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
});

describe('auth middleware', () => {
    test('isAuth calls next for an authenticated user', () => {
        const next = jest.fn();
        const response = createResponse();

        isAuth({ session: { user: { id: 1 } } }, response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(response.redirect).not.toHaveBeenCalled();
    });

    test('isAuth redirects unauthenticated users to login', () => {
        const next = jest.fn();
        const response = createResponse();

        isAuth({ session: {} }, response, next);

        expect(response.redirect).toHaveBeenCalledWith('/auth/login');
        expect(next).not.toHaveBeenCalled();
    });

    test('isGuest calls next when no user is logged in', () => {
        const next = jest.fn();
        const response = createResponse();

        isGuest({ session: {} }, response, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test.each([
        ['admin', '/admin/dashboard'],
        ['charge_clientele', '/admin/dashboard'],
        ['client', '/client/dashboard']
    ])('isGuest redirects %s users to %s', (role, location) => {
        const next = jest.fn();
        const response = createResponse();

        isGuest({ session: { user: { role } } }, response, next);

        expect(response.redirect).toHaveBeenCalledWith(location);
        expect(next).not.toHaveBeenCalled();
    });

    test('hasRole calls next for an allowed role', () => {
        const next = jest.fn();
        const response = createResponse();

        hasRole(['admin'])({ session: { user: { role: 'admin' } } }, response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(response.status).not.toHaveBeenCalled();
    });

    test.each([
        { role: 'client' },
        undefined
    ])('hasRole rejects an unauthorized user', (user) => {
        const next = jest.fn();
        const response = createResponse();

        hasRole(['admin'])({ session: { user } }, response, next);

        expect(response.status).toHaveBeenCalledWith(403);
        expect(response.send).toHaveBeenCalledWith('Accès refusé.');
        expect(next).not.toHaveBeenCalled();
    });
});
