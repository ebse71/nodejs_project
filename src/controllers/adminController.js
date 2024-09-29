import pool from '../config/db.js';

export const getAdminData = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM admin_panel_data');
        res.json(result.rows);
    } catch (error) {
        res.status(500).send('Serverfehler.');
    }
};
