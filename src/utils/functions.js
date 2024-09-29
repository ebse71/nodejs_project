// /src/utils/functions.js

import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Vonage } from '@vonage/server-sdk';
import userModel from '../models/userModel.js';

dotenv.config();

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});

// Token oluşturma fonksiyonu
export function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

// E-posta doğrulama fonksiyonu
export function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
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
    console.log('Token doğrulama başlatılıyor...');
    const token = req.cookies.user_token;

    if (!token) {
        console.log('Token bulunamadı, yetkisiz erişim.');
        return res.status(403).send('Forbidden: Token yok.');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token doğrulama hatası:', err.message);
            return res.status(403).send('Forbidden: Geçersiz token.');
        }

        // Token geçerli, kullanıcı ID'sini request'e ekliyoruz
        console.log('Token doğrulama başarılı, kullanıcı ID:', decoded.userId);
        req.userId = decoded.userId;
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

// Doğrulama kodunu e-posta ile gönderme
export async function sendVerificationEmail(email, verificationCode) {
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
        subject: 'Zwei-Faktor-Authentifizierung Code',
        text: `Ihr Bestätigungscode lautet: ${verificationCode}. Der Code ist 5 Minuten gültig.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Doğrulama kodu e-posta ile gönderildi:', email);
    } catch (error) {
        console.error('Doğrulama e-postası gönderilemedi:', error);
        throw error;
    }
}


export async function sendVerificationSMS(phoneNumber, verificationCode) {
    try {
        const from = 'NodeJs Adaptation';
        const text = `Your verification code is: ${verificationCode}`;

        const response = await vonage.sms.send({
            to: phoneNumber,
            from: from,
            text: text
        });

        if (response.messages[0].status === '0') {
            console.log('Doğrulama kodu SMS ile gönderildi:', phoneNumber);
        } else {
            console.error('Hata:', response.messages[0]['error-text']);
            throw new Error(response.messages[0]['error-text']);
        }
    } catch (error) {
        console.error('Doğrulama SMS\'i gönderilemedi:', error);
        throw error;
    }
}