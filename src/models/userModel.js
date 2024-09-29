// /src/models/userModel.js

import db from '../config/db.js'; 

const userModel = {};


// E-posta ile kullanıcıyı getir
userModel.getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]); 
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
};

// Telefon numarasını e-posta ve role'a göre al
userModel.getTelefonByEmail = async (email) => {
    try {
        // 1. Users tablosundan user_id ve role'u al
        const userQuery = 'SELECT user_id, role FROM users WHERE email = $1';
        const userResult = await db.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return null; // Kullanıcı bulunamadı
        }

        const { user_id, role } = userResult.rows[0];
        let phoneQuery;
        let phoneResult;

        // 2. Kullanıcının rolüne göre telefon numarasını al
        switch (role) {
            case 'teacher':
                phoneQuery = 'SELECT phone_number_1 FROM teachers WHERE user_id = $1';
                break;
            case 'student':
                phoneQuery = 'SELECT phone_number_1 FROM students WHERE user_id = $1';
                break;
            case 'parent':
                phoneQuery = 'SELECT phone_number_1 FROM parents WHERE user_id = $1';
                break;
            default:
                return null; // Bilinmeyen rol
        }

        phoneResult = await db.query(phoneQuery, [user_id]);

        // 3. Telefon numarasını döndür
        if (phoneResult.rows.length > 0) {
            return phoneResult.rows[0].phone_number_1;
        } else {
            return null; // Telefon numarası bulunamadı
        }
    } catch (error) {
        console.error('Telefon numarası alınırken hata:', error);
        throw error;
    }
};

<<<<<<< HEAD


=======
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
// userModel.js
userModel.getUserById = async (userId) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        return result.rows[0];  // Kullanıcıyı döndür
    } catch (error) {
        console.error('Kullanıcıyı alırken hata:', error);
        throw error;
    }
};


userModel.getTokenInfo = async (token) => {
    const query = `
        SELECT email, expires_at FROM password_resets WHERE token = $1
    `;
    const values = [token];

    try {
        const result = await db.query(query, values);
        return result.rows[0]; // Token bilgilerini döndür
    } catch (error) {
        console.error('Fehler beim Abrufen des Token-Infos:', error);
        throw error;
    }
};




// Kullanıcı token güncelle
userModel.updateUserToken = async (userId, token) => {
    try {
        await db.query('UPDATE users SET userkey = $1 WHERE user_id = $2', [token, userId]);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Benutzer-Tokens:', error);
        throw error;
    }
};

// Kullanıcı aktivitesi kaydet (activity_type ve activity_details ile)
userModel.logUserActivity = async (userId, activityType, activityDetails) => {
    try {
        await db.query(
            'INSERT INTO user_activity_logs (user_id, activity_type, activity_details) VALUES ($1, $2, $3)',
            [userId, activityType, activityDetails]
        );
    } catch (error) {
        console.error('Fehler beim Protokollieren der Benutzeraktivität:', error);
        throw error;
    }
};

// E-posta ile kullanıcı aktivitesi kaydet
userModel.logUserActivityByEmail = async (email, activityType, activityDetails) => {
    try {
        const user = await userModel.getUserByEmail(email);
        if (user) {
            await userModel.logUserActivity(user.user_id, activityType, activityDetails);
        }
    } catch (error) {
        console.error('Fehler beim Protokollieren der Benutzeraktivität per E-Mail:', error);
        throw error;
    }
};

// Kullanıcı oluştur
userModel.createUser = async ({ name, surname, email, password, role }) => {
    try {
        const result = await db.query(
            'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
            [name, surname, email, password, role]
        );
        return result.rows[0].user_id; // Yeni kullanıcının user_id'sini döndür
    } catch (error) {
        console.error('Fehler beim Erstellen des Benutzers:', error);
        throw error;
    }
};

// Şifre sıfırlama token'ı ekleme
userModel.insertPasswordResetToken = async (email, token) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token 24 saat geçerli olacak

    const query = `
        INSERT INTO password_resets (email, token, expires_at)
        VALUES ($1, $2, $3)
    `;
    const values = [email, token, expiresAt];

    try {
        await db.query(query, values);
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Passwort-Reset-Tokens:', error);
        throw error;
    }
};

// Şifreyi e-posta ile güncelle
userModel.updateUserPasswordByEmail = async (email, hashedPassword) => {
    try {
        await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Benutzerpassworts:', error);
        throw error;
    }
};

// Şifre sıfırlama tokenı sil
userModel.deletePasswordResetToken = async (email) => {
    try {
        await db.query('DELETE FROM password_resets WHERE email = $1', [email]);
    } catch (error) {
        console.error('Fehler beim Löschen des Passwort-Reset-Tokens:', error);
        throw error;
    }
};

// E-posta ile reset tokenını getir
userModel.getEmailByResetToken = async (token) => {
    try {
        const result = await db.query('SELECT email FROM password_resets WHERE token = $1', [token]);
        return result.rows[0]?.email; // İlk sonucu döndür
    } catch (error) {
        console.error('Fehler beim Abrufen der E-Mail durch den Reset-Token:', error);
        throw error;
    }
};

// Öğretmen oluştur
userModel.createTeacher = async ({ user_id, branch, additional_branch, birth_date, phone_number_1, phone_number_2, email }) => {
    try {
        await db.query(
            'INSERT INTO teachers (user_id, branch, additional_branch, birth_date, phone_number_1, phone_number_2, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [user_id, branch, additional_branch, birth_date, phone_number_1, phone_number_2, email]
        );
    } catch (error) {
        console.error('Fehler beim Erstellen des Lehrers:', error);
        throw error;
    }
};

export default userModel;
