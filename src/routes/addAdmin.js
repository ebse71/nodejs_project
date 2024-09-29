// /src/routes/addAdmin.js
import dotenv from 'dotenv';
dotenv.config();

import db from '../config/db.js';
import bcrypt from 'bcrypt';
import { generateToken, sendPasswordResetEmail, generateRandomPassword } from '../utils/functions.js'; // Fonksiyonları içe aktar

async function addAdmin() {

    // Veritabanı bağlantısını kontrol et
    try {
        await db.query('SELECT 1');
        console.log('Veritabanı bağlantısı başarılı oldu.');
    } catch (error) {
        console.error('Veritabanı bağlantısı başarısız:', error);
        return;
    }



    try {
        // Manuel olarak admin bilgilerini tanımlıyoruz
        const name = 'Admin';
        const surname = 'Admin';
        const email = 'admin@gshuenxe.de';

        console.log('Veritabanında e-posta kontrol ediliyor...');
        // Veritabanında e-postayı kontrol et
        const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
        const emailCheckResult = await db.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            console.error('Bu e-posta zaten kayıtlı.');
            return;
        }

        // 10 haneli random şifre oluştur
        const password = generateRandomPassword();

        // Şifreyi hash'leyin
        const hashedPassword = await bcrypt.hash(password, 10);

        // Admin için token oluştur
        const token = generateToken();

        console.log('Admin veritabanına ekleniyor...');
        // Admin kullanıcısını ekleyin
        const insertQuery = `
            INSERT INTO users (name, surname, email, password, role, userkey) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id
        `;
        const result = await db.query(insertQuery, [name, surname, email, hashedPassword, 'admin', token]);

        const userId = result.rows[0].user_id; // Yeni kullanıcının user_id'sini alın
        console.log('Admin veritabanına başarıyla eklendi.');

        // Şifre sıfırlama token'ını kaydedin
        const insertResetTokenQuery = `
            INSERT INTO password_resets (email, token, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '24 HOURS')
        `;
        await db.query(insertResetTokenQuery, [email, token]);

        // E-posta ile şifre sıfırlama linki gönder
        await sendPasswordResetEmail(email, token);

        console.log('Admin kullanıcı başarıyla eklendi, şifre sıfırlama linki e-posta ile gönderildi!');
    } catch (error) {
        console.error('Veritabanı hatası:', error);
    }
}

// Dosya doğrudan çalıştırıldığında addAdmin fonksiyonunu çağır
import.meta.url === `file://${process.argv[1]}`
    addAdmin();

