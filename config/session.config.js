import dotenv from 'dotenv';
dotenv.config();
export default {
   secret: process.env.SESSION_SECRET || 'un_secret_super_fort',
  resave: false,
  saveUninitialized: false,
  cookie : { 
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Passe en HTTPS en production
    sameSite: 'lax'
  }
}