// /src/models/adminModel.js
import db from '../config/db.js';

export const getAdminPanelData = async () => {
    try {
        const result = await db.query('SELECT * FROM admin_panel_data');
        return result.rows;
    } catch (error) {
        console.error('Fehler beim Abrufen der Admin-Panel-Daten:', error);
        throw error;
    }
};
