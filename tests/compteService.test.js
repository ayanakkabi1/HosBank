import { jest } from '@jest/globals';

jest.unstable_mockModule('../repositories/compteRepository.js', () => ({
    getComptesByClientId: jest.fn(),
    getTotalSoldeByClientId: jest.fn(),
    getRecentOperationsByClientId: jest.fn()
}));

const compteRepository = await import('../repositories/compteRepository.js');
const { getDashboardData, formatCurrency, formatRib } = await import('../services/compteService.js');

describe('compteService - HOS-33 Isolation & Dashboard Data', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('devrait isoler strictement les données par clientId', async () => {
        const targetClientId = 101;
        const mockComptes = [
            { id: 1, rib: '123456789012345678901234', solde: 5000.00, type_compte: 'courant', statut: 'actif', client_id: 101 },
            { id: 2, rib: '987654321098765432109876', solde: 12000.50, type_compte: 'epargne', statut: 'actif', client_id: 101 }
        ];

        compteRepository.getComptesByClientId.mockResolvedValue(mockComptes);
        compteRepository.getTotalSoldeByClientId.mockResolvedValue(17000.50);
        compteRepository.getRecentOperationsByClientId.mockResolvedValue([
            { id: 1, montant: 200, motif: 'Achat', statut: 'valide', created_at: new Date().toISOString(), sens: 'debit' }
        ]);

        const data = await getDashboardData(targetClientId);

        
        expect(compteRepository.getComptesByClientId).toHaveBeenCalledWith(targetClientId);
        expect(compteRepository.getTotalSoldeByClientId).toHaveBeenCalledWith(targetClientId);
        expect(compteRepository.getRecentOperationsByClientId).toHaveBeenCalledWith(targetClientId, 5);

        expect(data.nombreComptes).toBe(2);
        expect(data.totalSolde).toBe(17000.50);
        expect(data.comptes[0].ribFormatted).toBe('1234 5678 9012 3456 7890 1234');
        expect(data.recentOperations[0].isDebit).toBe(true);
    });

    test('devrait rejeter si clientId est manquant', async () => {
        await expect(getDashboardData(null))
            .rejects
            .toThrow('Identifiant client manquant ou invalide.');
    });

    test('formatCurrency formate correctement en MAD', () => {
        const formatted = formatCurrency(1500.5);
        expect(formatted).toContain('1');
        expect(formatted).toContain('500');
    });

    test('formatRib sépare les blocs de 4 caractères', () => {
        const formatted = formatRib('123456789012');
        expect(formatted).toBe('1234 5678 9012');
    });
});
