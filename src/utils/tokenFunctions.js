// /src/utils/functions.js

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Token oluşturma fonksiyonu
export function generateToken() {
    return crypto.randomBytes(32).toString('hex'); // Rastgele bir token oluşturur
}

// Güçlü şifre kontrolü
export function isStrongPassword(password) {
    const lengthCheck = password.length >= 8; // Minimum 8 karakter (PHP tarafında 10 idi)
    const lowercaseCheck = /[a-z]/.test(password);
    const uppercaseCheck = /[A-Z]/.test(password);
    const numberCheck = /\d/.test(password);
    const symbolCheck = /[\W]/.test(password);

    return lengthCheck && lowercaseCheck && uppercaseCheck && numberCheck && symbolCheck;
}

// Şifre sıfırlama e-postası gönderme
export async function sendPasswordResetEmail(email, token) {
    const resetLink = `http://localhost:3000/reset-password?token=${encodeURIComponent(token)}`; // URL'yi localhost olarak belirtiyoruz

    // E-posta gönderimi için gerekli ayarlar
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Anfrage zum Zurücksetzen des Passworts',
        text: `Hallo,\n\nUm Ihr Passwort zurückzusetzen, klicken Sie auf den folgenden Link:\n${resetLink}\n\nMit freundlichen Grüßen,\nIhr Team`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        throw error;
    }
}

// Öğretmene e-posta gönderme fonksiyonu
export async function sendTeacherEmail(email, surname, token) {
    const resetLink = `http://localhost:3000/reset-password?token=${encodeURIComponent(token)}`; // URL'yi localhost olarak belirtiyoruz

    // E-posta gönderimi için gerekli ayarlar
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Willkommen an unserer Schule',
        text: `Sehr geehrte/r Frau/Herr ${surname},\n\nUm Ihr neues Passwort festzulegen, verwenden Sie diesen Link:\n${resetLink}\n\nDer Link ist 24 Stunden gültig und kann nur einmal verwendet werden.\n\nMit freundlichen Grüßen,\nIhr Team`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Fehler beim Senden der Lehrer-E-Mail:', error);
        throw error;
    }
}

// Oturum kontrolü (token doğrulama)
export function checkToken(req, res, next) {
    const token = req.cookies.user_token;
    if (!token) {
        return res.redirect('/pages/userLogin.html');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/pages/userLogin.html');
        }
        req.user = user;
        next();
    });
}

// Rastgele şifre oluşturma fonksiyonu
export function generateRandomPassword() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
    let randomPassword = '';
    for (let i = 0; i < 10; i++) {
        randomPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomPassword;
}
