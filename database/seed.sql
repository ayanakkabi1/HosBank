USE hosebank_db;

-- Donnees de demonstration pour le developpement local uniquement.
-- Mot de passe de tous les comptes : HosBank123!
START TRANSACTION;

INSERT IGNORE INTO users (nom, prenom, email, password, role, statut)
VALUES
    ('Admin', 'HosBank', 'admin@hosbank.local', '$2b$10$5vxO59U3BCeDUb0rJM4sEuDTnNCzlbIOq2GRpjXniT/8E8v1aEhvy', 'admin', 'actif'),
    ('Martin', 'Sofia', 'sofia.martin@hosbank.local', '$2b$10$5vxO59U3BCeDUb0rJM4sEuDTnNCzlbIOq2GRpjXniT/8E8v1aEhvy', 'charge_clientele', 'actif'),
    ('Benali', 'Aya', 'aya.benali@hosbank.local', '$2b$10$5vxO59U3BCeDUb0rJM4sEuDTnNCzlbIOq2GRpjXniT/8E8v1aEhvy', 'client', 'actif'),
    ('Dupont', 'Yanis', 'yanis.dupont@hosbank.local', '$2b$10$5vxO59U3BCeDUb0rJM4sEuDTnNCzlbIOq2GRpjXniT/8E8v1aEhvy', 'client', 'actif');

SET @charge_id = (SELECT id FROM users WHERE email = 'sofia.martin@hosbank.local');
SET @aya_id = (SELECT id FROM users WHERE email = 'aya.benali@hosbank.local');
SET @yanis_id = (SELECT id FROM users WHERE email = 'yanis.dupont@hosbank.local');

UPDATE users
SET charge_id = @charge_id
WHERE id IN (@aya_id, @yanis_id);

INSERT IGNORE INTO comptes (rib, solde, type_compte, statut, client_id)
VALUES
    ('FR76123456789000000001', 4280.50, 'courant', 'actif', @aya_id),
    ('FR76123456789000000002', 1250.00, 'epargne', 'actif', @aya_id),
    ('FR76123456789000000003', 2195.75, 'courant', 'actif', @yanis_id);

SET @aya_compte = (SELECT id FROM comptes WHERE rib = 'FR76123456789000000001');
SET @aya_epargne = (SELECT id FROM comptes WHERE rib = 'FR76123456789000000002');
SET @yanis_compte = (SELECT id FROM comptes WHERE rib = 'FR76123456789000000003');

INSERT INTO beneficiaires (nom_beneficiaire, rib, client_id)
SELECT 'Yanis Dupont', 'FR76123456789000000003', @aya_id
WHERE NOT EXISTS (
    SELECT 1 FROM beneficiaires
    WHERE nom_beneficiaire = 'Yanis Dupont' AND rib = 'FR76123456789000000003' AND client_id = @aya_id
);

INSERT IGNORE INTO cartes (numero_carte, type_carte, date_expiration, pin, plafond, statut, compte_id)
VALUES
    ('4532012345678901', 'physique', '2029-12-31', '123456', 5000.00, 'active', @aya_compte),
    ('4532012345678902', 'virtuelle', '2028-08-31', '654321', 2500.00, 'active', @yanis_compte);

INSERT INTO virements (montant, motif, compte_source_id, compte_destination_id, statut)
SELECT 180.00, 'Remboursement repas', @aya_compte, @yanis_compte, 'valide'
WHERE NOT EXISTS (
    SELECT 1 FROM virements
    WHERE montant = 180.00 AND motif = 'Remboursement repas'
      AND compte_source_id = @aya_compte AND compte_destination_id = @yanis_compte
);

INSERT INTO virements (montant, motif, compte_source_id, compte_destination_id, statut)
SELECT 350.00, 'Epargne mensuelle', @aya_compte, @aya_epargne, 'valide'
WHERE NOT EXISTS (
    SELECT 1 FROM virements
    WHERE montant = 350.00 AND motif = 'Epargne mensuelle'
      AND compte_source_id = @aya_compte AND compte_destination_id = @aya_epargne
);

INSERT INTO demandes (type_demande, statut, client_id, traite_par_id)
SELECT 'carte_virtuelle', 'valide', @aya_id, @charge_id
WHERE NOT EXISTS (
    SELECT 1 FROM demandes WHERE type_demande = 'carte_virtuelle' AND statut = 'valide' AND client_id = @aya_id
);

INSERT INTO reclamations (sujet, description, statut, client_id)
SELECT 'Question sur un virement', 'Demande de renseignement concernant le delai de traitement.', 'en_attente', @aya_id
WHERE NOT EXISTS (
    SELECT 1 FROM reclamations WHERE sujet = 'Question sur un virement' AND client_id = @aya_id
);

COMMIT;

SELECT 'Seed HosBank termine' AS message;
SELECT id, nom, prenom, email, role, statut FROM users
WHERE email IN ('admin@hosbank.local', 'sofia.martin@hosbank.local', 'aya.benali@hosbank.local', 'yanis.dupont@hosbank.local');
