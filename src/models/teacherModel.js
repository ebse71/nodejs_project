// /src/models/teacherModel.js
import db from '../config/db.js';

const teacherModel = {};

// Öğretmen ekleme işlemi
teacherModel.createTeacher = async ({ user_id, branch, additional_branch, birth_date, phone_number_1, phone_number_2, email }) => {
    try {
        const query = `
            INSERT INTO teachers (user_id, branch, additional_branch, birth_date, phone_number_1, phone_number_2, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [user_id, branch, additional_branch, birth_date, phone_number_1, phone_number_2, email];
        await db.query(query, values);
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Lehrers:', error);
        throw error;
    }
};

export default teacherModel;
