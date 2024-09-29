// /src/routes/resetPassword.js

import express from 'express';
import path from 'path';
import userController from '../controllers/userController.js';

const router = express.Router();

// Token geçerliliğini kontrol eden route
router.get('/', async (req, res) => {

    // Token'ı URL'den al
    const token = req.query.token;
    console.log('Alınan token:', token);

    // Token varsa geçerliliğini kontrol et
    if (token) {
        try {
            const email = await userController.verifyResetToken(token);
            if (email) {
                // Token geçerli ise çerez olarak sakla
                res.cookie('reset_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 saat geçerli

                // resetPassword.html dosyasını sunma
                return res.sendFile(path.resolve('public/pages/resetPassword.html'));
            } else {
                // Token geçerli değilse hata mesajı göster
                return res.status(400).send('Ungültiger oder abgelaufener Token.');
            }
        } catch (error) {
            console.error('Fehler beim Überprüfen des Tokens:', error);
            return res.status(500).send('Interner Serverfehler.');
        }
    } else {
        // Token yoksa hata mesajı göster
        return res.status(400).send('Ungültiger oder abgelaufener Token.');
    }
});

// Şifre sıfırlama işlemi (POST)
router.post('/', userController.resetPassword);

export default router;
