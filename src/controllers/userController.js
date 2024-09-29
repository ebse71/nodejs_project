// /src/controllers/userController.js

import userModel from '../models/userModel.js';
import { generateToken, isStrongPassword, sendPasswordResetEmail, sendTeacherEmail, generateRandomPassword, validateEmail } from '../utils/functions.js';
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcrypt';
import { Strategy as MagicLinkStrategy } from 'passport-magic-link';

const userController = {};

// Kullanıcı girişi

// /src/controllers/userController.js

userController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);

        if (user) {
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                // Eğer kullanıcı admin ise doğrulama yapmadan giriş yap
                if (user.role === 'admin') {
                    console.log('User role:', user.role);

                    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    await userModel.updateUserToken(user.user_id, token);

                    // Admin giriş için çerez ayarla
                    res.cookie('user_token', token, { maxAge: 86400 * 30 * 1000, httpOnly: true });
                    req.session.user_id = user.user_id;
                    req.session.last_activity = Date.now();

                    return res.json({ status: 'success', redirect: '../pages/adminPanel.html' });
                }

                // Diğer kullanıcılar için doğrulama sürecine geç
                const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                await userModel.updateUserToken(user.user_id, token);
                res.cookie('user_token', token, { maxAge: 86400 * 30 * 1000, httpOnly: true });
                req.session.user_id = user.user_id;
                req.session.last_activity = Date.now();
                req.session.email = user.email; // E-posta bilgisini session'a ekliyoruz

                res.json({ status: 'success', redirect: '../pages/auth.html' }); // Doğrulama sayfasına yönlendir
            } else {
                res.json({ status: 'error', message: 'Falsche E-Mail-Adresse oder falsches Passwort.' });
            }
        } else {
            res.json({ status: 'error', message: 'Falsche E-Mail-Adresse oder falsches Passwort.' });
        }
    } catch (error) {
        console.error('Fehler beim Login:', error);
        res.status(500).json({ status: 'error', message: 'Interner Serverfehler.' });
    }
};


// Admin ekleme
userController.addAdmin = async (req, res) => {
    try {
        const { name, surname, email } = req.body;

        // E-posta kontrolü
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.json({ status: 'error', message: 'Diese E-Mail-Adresse ist bereits registriert.' });
        }

        // Rastgele şifre oluşturma
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcı oluşturma
        const userId = await userModel.createUser({
            name,
            surname,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        // Şifre sıfırlama tokenı oluşturma
        const resetToken = generateToken();
        await userModel.insertPasswordResetToken(email, resetToken);

        // E-posta gönderme
        await sendPasswordResetEmail(email, resetToken);

        res.json({ status: 'success', message: 'Admin başarıyla eklendi und şifre sıfırlama e-postası gönderildi.' });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Admins:', error);
        res.status(500).json({ status: 'error', message: 'Interner Serverfehler.' });
    }
};

//// Şifre sıfırlama linki gönderme
//userController.sendResetLink = async (req, res) => {
//    const { email } = req.body;

//    if (!validateEmail(email)) {
//        return res.json({ status: 'error', message: 'Ungültige E-Mail-Adresse.' });
//    }

//    try {
//        const user = await userModel.getUserByEmail(email);

//        if (user) {
//            if (!user.userkey) {
//                return res.json({
//                    status: 'error',
//                    message: 'Bitte verwenden Sie den von Admin gesendeten Link oder das Passwort für die erste Anmeldung.',
//                    redirect: '../pages/userLogin.html'
//                });
//            }

//            const resetToken = generateToken();
//            await userModel.insertPasswordResetToken(email, resetToken);

//            await sendPasswordResetEmail(email, resetToken);

//            await userModel.logUserActivity(user.user_id, 'password_reset_request', 'Passwort-Reset-Link gesendet');

//            res.json({ status: 'success' });
//        } else {
//            // Güvenlik nedeniyle, eğer e-posta bulunamazsa yine de success döndürüyoruz
//            res.json({ status: 'success' });
//        }
//    } catch (error) {
//        console.error('Fehler beim Senden des Reset-Links:', error);
//        res.status(500).json({ status: 'error', message: 'Interner Serverfehler.' });
//    }
//};

userController.sendResetLink = async (req, res) => {
    const { email } = req.body;

    if (!validateEmail(email)) {
        return res.json({ status: 'error', message: 'Geçersiz e-posta adresi.' });
    }

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.json({ status: 'error', message: 'Kullanıcı bulunamadı.' });
        }

        // Şifre sıfırlama tokenı oluşturma
        const resetToken = generateToken(user.user_id); // user_id ile token oluştur
        await userModel.insertPasswordResetToken(email, resetToken);

        // E-posta gönderme
        await sendPasswordResetEmail(email, resetToken);

        res.json({ status: 'success', message: 'Şifre sıfırlama bağlantısı e-posta ile gönderildi.' });
    } catch (error) {
        console.error('Fehler beim Senden des Magic-Links:', error);
        res.status(500).json({ status: 'error', message: 'İç hata.' });
    }
};


// Token geçerliliğini kontrol eden fonksiyon
userController.verifyResetToken = async (token) => {
    try {
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token çözüldü:', decoded);

        // Veritabanında token'ın mevcut olup olmadığını kontrol et
        const tokenExists = await userModel.getEmailByResetToken(token);

        if (!tokenExists) {
            console.log('Token veritabanında mevcut değil, geçersiz.');
            return null;  
        }

        return decoded.userId;  // Token geçerli ise userId döndür
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        return null;  
    }
};





// Şifre sıfırlama işlemi
userController.resetPassword = async (req, res) => {
    const { new_password, confirm_password } = req.body;

    // Çerezden token'ı al
    const token = req.cookies.reset_token;

    if (!token) {
        return res.status(400).send('Ungültiger oder abgelaufener Token.');
    }

    if (new_password !== confirm_password) {
        return res.status(400).send('Die Passwörter stimmen nicht überein.');
    }

    if (!isStrongPassword(new_password)) {
        return res.status(400).send('Das Passwort erfüllt nicht die Sicherheitsanforderungen.');
    }

    try {
        const email = await userModel.getEmailByResetToken(token);

        if (email) {
            const hashedPassword = await bcrypt.hash(new_password, 10);

            await userModel.updateUserPasswordByEmail(email, hashedPassword);
            await userModel.deletePasswordResetToken(email);
            console.log(`Token ${token} email ${email} için silindi.`);
            await userModel.logUserActivityByEmail(email, 'password_reset', 'Password was reset');

            // Çerezi sil
            res.clearCookie('reset_token');

            res.redirect('../pages/userLogin.html');
        } else {
            res.status(400).send('Ungültiger oder abgelaufener Token.');
        }
    } catch (error) {
        console.error('Fehler beim Zurücksetzen des Passworts:', error);
        res.status(500).send('Interner Serverfehler.');
    }
};

// İlk giriş kontrolü
userController.checkFirstLogin = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ status: 'error', message: 'E-Mail-Adresse wurde nicht eingegeben.' });
    }

    try {
        const user = await userModel.getUserByEmail(email);

        if (user) {
            if (!user.first_login) {
                res.json({
                    status: 'error',
                    message: 'Bitte verwenden Sie den von Admin gesendeten Link oder das Passwort für die erste Anmeldung.'
                });
            } else {
                res.json({ status: 'success', redirect: '../pages/reset_link.html' });
            }
        } else {
            res.json({ status: 'error', message: 'Diese E-Mail-Adresse ist nicht registriert.' });
        }
    } catch (error) {
        console.error('Fehler beim Überprüfen des ersten Logins:', error);
        res.status(500).json({ status: 'error', message: 'Interner Serverfehler.' });
    }
};

// Öğretmen ekleme işlemi
userController.addTeacher = async (req, res) => {
    console.log('addTeacher fonksiyonu çağrıldı.'); // İstek kontrolü
    console.log('İstek Verileri:', req.body); // Gelen form verilerini kontrol ediyoruz

    const { name, surname, email, branch, additional_branch, birth_date, phone_number_1, phone_number_2 } = req.body;
    const password = generateRandomPassword();

    let errors = [];

    // Validasyon
    if (!name) errors.push('Das Namensfeld darf nicht leer sein.');
    if (!surname) errors.push('Das Nachnamenfeld darf nicht leer sein.');
    if (!email) errors.push('Das E-Mail-Feld darf nicht leer sein.');
    if (email && !validateEmail(email)) errors.push('Ungültige E-Mail-Adresse.');

    if (errors.length > 0) {
        console.log('Validasyon Hataları:', errors);
        return res.status(400).json({ errors });
    }

    try {
        // E-posta kontrolü
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            console.log('Bu E-Mail zaten kayıtlı:', email);
            return res.status(400).json({ errors: ['Diese E-Mail-Adresse ist bereits registriert.'] });
        }

        // Kullanıcı oluşturma
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await userModel.createUser({
            name,
            surname,
            email,
            password: hashedPassword,
            role: 'teacher'
        });
        console.log('Yeni kullanıcı oluşturuldu, ID:', userId);

        // Öğretmen ekleme
        await userModel.createTeacher({
            user_id: userId,
            branch,
            additional_branch,
            birth_date,
            phone_number_1,
            phone_number_2,
            email
        });
        console.log('Öğretmen bilgileri başarıyla eklendi.');

        // Şifre sıfırlama tokenı oluşturma
        const resetToken = generateToken(userId);
        await userModel.insertPasswordResetToken(email, resetToken);

        // E-posta gönderme
        await sendTeacherEmail(email, surname, resetToken);

        res.json({ status: 'success', message: 'Lehrer erfolgreich hinzugefügt und E-Mail gesendet.' });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Lehrers:', error);
        res.status(500).json({ status: 'error', message: 'Interner Serverfehler.' });
    }
};

export default userController;
