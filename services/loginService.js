import { findUserByEmail } from '../repositories/loginRepository.js';
import bcrypt from 'bcrypt';

export const login = async (email, password) => {
    const user = await findUserByEmail(email);
    if(!user){
        throw new Error('Identifiants incorrects.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Identifiants incorrects.');
    }
    if (user.statut !== 'actif') {
        throw new Error('Votre compte est en attente de validation ou suspendu.');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export const authenticate = login;

// express-session