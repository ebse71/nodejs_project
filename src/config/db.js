import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Veritabanı bağlantısını kontrol etme
async function checkDatabaseConnection() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()'); // Örnek bir sorgu
        console.log('Veritabanı bağlantısı başarılı:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Veritabanı bağlantı hatası:', err.stack);
    }
}

// Uygulama başlarken bağlantıyı kontrol et
checkDatabaseConnection();

export default {
    query: (text, params) => pool.query(text, params),
};
