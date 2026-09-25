import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendVerificationEmail = async (
    email,
    verificationToken
) => {
    const verificationLink =
        `http://localhost:3000/auth/verify-email?token=${verificationToken}`;

    console.log(`[Email Service] Lien de vérification généré pour ${email} : ${verificationLink}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('[Email Service] Identifiants EMAIL_USER ou EMAIL_PASSWORD non configurés dans .env. Email non envoyé par SMTP, utilisez le lien ci-dessus.');
        return verificationLink;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Vérification de votre compte HosBank',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #1e3a8a; margin: 0;">HosBank</h1>
                        <p style="color: #64748b; font-size: 14px;">Votre banque en ligne sécurisée</p>
                    </div>
                    <h2 style="color: #0f172a; font-size: 20px;">Bienvenue sur HosBank !</h2>
                    <p style="color: #334155; line-height: 1.5;">
                        Merci pour votre inscription. Afin de sécuriser et activer votre compte client, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Vérifier mon adresse e-mail
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 13px;">
                        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
                        <a href="${verificationLink}" style="color: #2563eb;">${verificationLink}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
                    </p>
                </div>
            `
        });
    } catch (err) {
        console.error('[Email Service] Erreur lors de l\'envoi de l\'email SMTP :', err.message);
        
    }

    return verificationLink;
};

