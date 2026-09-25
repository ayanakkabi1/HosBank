CREATE DATABASE IF NOT EXISTS hosebank_db;
USE hosebank_db;

-- Table Utilisateurs 
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente',
    verification_token VARCHAR(255) NULL,
    charge_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (charge_id) REFERENCES users(id) ON DELETE SET NULL
) ;

-- Table Comptes Bancaires
CREATE TABLE IF NOT EXISTS comptes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rib VARCHAR(24) NOT NULL UNIQUE,
    solde DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    type_compte VARCHAR(50) NOT NULL DEFAULT 'courant', 
    statut VARCHAR(50) NOT NULL DEFAULT 'actif',       
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
) ;

-- Table Beneficiaires 
CREATE TABLE IF NOT EXISTS beneficiaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_beneficiaire VARCHAR(100) NOT NULL,
    rib VARCHAR(24) NOT NULL,
    client_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
) ;

-- Table Virements
CREATE TABLE IF NOT EXISTS virements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    montant DECIMAL(15, 2) NOT NULL,
    motif VARCHAR(255),
    compte_source_id INT NOT NULL,
    compte_destination_id INT NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'valide',       
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compte_source_id) REFERENCES comptes(id) ON DELETE RESTRICT,
    FOREIGN KEY (compte_destination_id) REFERENCES comptes(id) ON DELETE RESTRICT
) ;

-- Table Demandes 
CREATE TABLE IF NOT EXISTS demandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_demande VARCHAR(50) NOT NULL, 
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente',    
    client_id INT NOT NULL,
    traite_par_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (traite_par_id) REFERENCES users(id) ON DELETE SET NULL
) ;

-- Table des Cartes Bancaires
CREATE TABLE IF NOT EXISTS cartes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_carte VARCHAR(16) NOT NULL UNIQUE,
    type_carte VARCHAR(50) NOT NULL DEFAULT 'virtuelle',
    date_expiration DATE NOT NULL,
    pin VARCHAR(6) NOT NULL,
    plafond DECIMAL(15, 2) NOT NULL DEFAULT 5000.00,
    statut VARCHAR(50) NOT NULL DEFAULT 'active',
    compte_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (compte_id) REFERENCES comptes(id) ON DELETE CASCADE
) ;

--  Table des Reclamations
CREATE TABLE IF NOT EXISTS reclamations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sujet VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente',
    reponse TEXT NULL,
    client_id INT NOT NULL,
    traite_par_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (traite_par_id) REFERENCES users(id) ON DELETE SET NULL
) ;