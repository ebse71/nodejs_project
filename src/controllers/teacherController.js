// /src/controllers/teacherController.js

import bcrypt from 'bcrypt';
import teacherModel from '../models/teacherModel.js';
import userModel from '../models/userModel.js';
import { generateRandomPassword, sendTeacherEmail, validateEmail } from '../utils/functions.js'; // validateEmail fonksiyonunu ekledik

const teacherController = {};

// Öğretmen ekleme işlemi
teacherController.addTeacher = async (req, res) => {
    const { name, surname, email, branch, additional_branch, birth_date, phone_number_1, phone_number_2 } = req.body;

    let errors = [];

    // Verilerin doğrulanması
    if (!name) errors.push('Das Namensfeld darf nicht leer sein.');
    if (!surname) errors.push('Das Nachnamenfeld darf nicht leer sein.');
    if (!email) errors.push('Das E-Mail-Feld darf nicht leer sein.');
    if (email && !validateEmail(email)) errors.push('Ungültige E-Mail-Adresse.');

    if (errors.length > 0) {
        return res.status(400).json({ status: 'error', message: 'Fehlerhafte Eingaben.', errors });
    }

    try {
        // E-posta kontrolü
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Diese E-Mail-Adresse ist bereits registriert.' });
        }

        // Kullanıcı oluşturma
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await userModel.createUser({
            name,
            surname,
            email,
            password: hashedPassword,
            role: 'teacher'
        });

        // Öğretmen ekleme
        await teacherModel.createTeacher({
            user_id: userId,
            branch,
            additional_branch,
            birth_date,
            phone_number_1,
            phone_number_2,
            email
        });

        // E-posta gönderme
        await sendTeacherEmail(email, surname);

        res.json({ status: 'success', message: 'Lehrer erfolgreich hinzugefügt und E-Mail gesendet.' });
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Lehrers:', error);
        res.status(500).json({ status: 'error', message: 'Interner Serverfehler.' });
    }
};

export default teacherController;
