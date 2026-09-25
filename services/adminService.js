import bcrypt from 'bcrypt';
import * as adminRepository from '../repositories/adminRepository.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['client', 'charge_clientele', 'admin'];
const ALLOWED_USER_STATUSES = ['actif', 'inactif', 'en_attente', 'bloque'];

/**
 * Génère un RIB marocain standard de 24 chiffres (Code banque 230)
 */
export const generateRib = () => {
    let randomDigits = '';
    for (let i = 0; i < 21; i++) {
        randomDigits += Math.floor(Math.random() * 10);
    }
    return `230${randomDigits}`;
};

/**
 * Génère un numéro de carte bancaire à 16 chiffres
 */
export const generateCardNumber = () => {
    let digits = '4'; // Visa style prefix
    for (let i = 0; i < 15; i++) {
        digits += Math.floor(Math.random() * 10);
    }
    return digits;
};

/**
 * Récupère les données d'ensemble pour le panneau d'administration
 */
export const getAdminOverview = async () => {
    const [users, comptes, cartes] = await Promise.all([
        adminRepository.getAllUsers(),
        adminRepository.getAllComptes(),
        adminRepository.getAllCartes()
    ]);

    const stats = {
        totalUsers: users.length,
        nbClients: users.filter(u => u.role === 'client').length,
        nbCharges: users.filter(u => u.role === 'charge_clientele').length,
        nbAdmins: users.filter(u => u.role === 'admin').length,
        activeUsers: users.filter(u => u.statut === 'actif').length,
        totalComptes: comptes.length,
        activeComptes: comptes.filter(c => c.statut === 'actif').length,
        totalCartes: cartes.length,
        activeCartes: cartes.filter(k => k.statut === 'active').length
    };

    return { users, comptes, cartes, stats };
};

/**
 * Crée un nouvel utilisateur (avec hachage de mot de passe)
 */
export const createUser = async ({ nom, prenom, email, password, role = 'client', statut = 'actif' }) => {
    const cleanNom = nom?.trim();
    const cleanPrenom = prenom?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanNom || !cleanPrenom || !cleanEmail || !password) {
        throw new Error('Tous les champs obligatoires doivent être renseignés.');
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
        throw new Error('Format d’adresse email invalide.');
    }

    if (password.length < 6) {
        throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
    }

    if (!ALLOWED_ROLES.includes(role)) {
        throw new Error(`Rôle invalide : ${role}. Rôles autorisés : ${ALLOWED_ROLES.join(', ')}`);
    }

    const existingUser = await adminRepository.getUserByEmail(cleanEmail);
    if (existingUser) {
        throw new Error('Cette adresse email est déjà utilisée.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await adminRepository.createUser({
        nom: cleanNom,
        prenom: cleanPrenom,
        email: cleanEmail,
        password: hashedPassword,
        role,
        statut
    });

    return userId;
};

/**
 * Met à jour un utilisateur (nom, prénom, email, rôle, statut)
 */
export const updateUser = async (id, { nom, prenom, email, role, statut }) => {
    if (!id) throw new Error('ID utilisateur manquant.');

    const cleanNom = nom?.trim();
    const cleanPrenom = prenom?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanNom || !cleanPrenom || !cleanEmail) {
        throw new Error('Nom, prénom et email sont requis.');
    }

    if (!ALLOWED_ROLES.includes(role)) {
        throw new Error(`Rôle invalide : ${role}`);
    }

    if (!ALLOWED_USER_STATUSES.includes(statut)) {
        throw new Error(`Statut invalide : ${statut}`);
    }

    // Vérifier si un autre utilisateur a déjà cet email
    const existing = await adminRepository.getUserByEmail(cleanEmail);
    if (existing && existing.id !== Number(id)) {
        throw new Error('Cet email est déjà attribué à un autre compte.');
    }

    await adminRepository.updateUser(id, {
        nom: cleanNom,
        prenom: cleanPrenom,
        email: cleanEmail,
        role,
        statut
    });

    return true;
};

/**
 * Alterne l'activation d'un utilisateur (actif <-> inactif)
 * Active également les comptes bancaires inactifs si l'utilisateur est activé
 */
export const toggleUserStatus = async (id) => {
    if (!id) throw new Error('ID utilisateur manquant.');

    const user = await adminRepository.getUserById(id);
    if (!user) throw new Error('Utilisateur introuvable.');

    const newStatus = user.statut === 'actif' ? 'inactif' : 'actif';
    await adminRepository.updateUserStatus(id, newStatus);

    // Si l'administrateur active le client, activer également ses comptes bancaires inactifs
    if (newStatus === 'actif' && adminRepository.activateComptesByClientId) {
        await adminRepository.activateComptesByClientId(id);
    }

    return newStatus;
};

/**
 * Crée un compte bancaire pour un utilisateur
 */
export const createCompteForUser = async ({ clientId, soldeInitial = 0, typeCompte = 'courant' }) => {
    if (!clientId) throw new Error('Client requis pour créer un compte.');

    const user = await adminRepository.getUserById(clientId);
    if (!user) throw new Error('Utilisateur introuvable.');

    const rib = generateRib();
    const compteId = await adminRepository.createCompte({
        rib,
        solde: Number(soldeInitial) || 0.00,
        type_compte: typeCompte,
        statut: 'actif',
        client_id: clientId
    });

    return { compteId, rib };
};

/**
 * Alterne le statut d'un compte (actif <-> bloque)
 */
export const toggleCompteStatus = async (compteId) => {
    if (!compteId) throw new Error('ID compte manquant.');

    const compte = await adminRepository.getCompteById(compteId);
    if (!compte) throw new Error('Compte introuvable.');

    const newStatus = compte.statut === 'actif' ? 'bloque' : 'actif';
    await adminRepository.updateCompteStatus(compteId, newStatus);
    return newStatus;
};

/**
 * Émet une nouvelle carte bancaire pour un compte
 */
export const createCarteForCompte = async ({ compteId, typeCarte = 'virtuelle', plafond = 5000.00 }) => {
    if (!compteId) throw new Error('Compte requis pour créer une carte.');

    const compte = await adminRepository.getCompteById(compteId);
    if (!compte) throw new Error('Compte bancaire introuvable.');

    const numeroCarte = generateCardNumber();
    
    // Date d'expiration : +3 ans à la fin du mois
    const now = new Date();
    const expDate = new Date(now.getFullYear() + 3, now.getMonth() + 1, 0);
    const dateExpiration = expDate.toISOString().split('T')[0];

    const carteId = await adminRepository.createCarte({
        numero_carte: numeroCarte,
        type_carte: typeCarte,
        date_expiration: dateExpiration,
        plafond: Number(plafond) || 5000.00,
        statut: 'active',
        compte_id: compteId
    });

    return { carteId, numeroCarte, dateExpiration };
};

/**
 * Alterne le statut d'une carte (active <-> bloquee)
 */
export const toggleCarteStatus = async (carteId) => {
    if (!carteId) throw new Error('ID carte manquant.');

    const carte = await adminRepository.getCarteById(carteId);
    if (!carte) throw new Error('Carte introuvable.');

    const newStatus = carte.statut === 'active' ? 'bloquee' : 'active';
    await adminRepository.updateCarteStatus(carteId, newStatus);
    return newStatus;
};

export const getClientAssignmentData = async () => {
    const [clients, chargeClients] = await Promise.all([
        adminRepository.findClients(),
        adminRepository.findChargeClients()
    ]);

    return { clients, chargeClients };
};

export const assignClientToCharge = async (clientId, chargeId) => {
    const numericClientId = Number(clientId);
    const numericChargeId = Number(chargeId);

    if (!Number.isInteger(numericClientId) || !Number.isInteger(numericChargeId)) {
        throw new Error('Le client et le chargé client sont obligatoires.');
    }

    const [client, chargeClient] = await Promise.all([
        adminRepository.findClientById(numericClientId),
        adminRepository.findChargeClientById(numericChargeId)
    ]);

    if (!client) {
        throw new Error('Client introuvable.');
    }

    if (!chargeClient) {
        throw new Error('Chargé client introuvable.');
    }

    const assigned = await adminRepository.assignClientToCharge(
        numericClientId,
        numericChargeId
    );

    if (!assigned) {
        throw new Error("L'affectation du client a échoué.");
    }
};
