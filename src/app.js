import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './middleware/auth.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
    console.log('Sunucu 3000 portunda çalışıyor');
});
