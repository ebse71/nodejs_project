// /src/routes/forgetPassword.js

import express from 'express';
import userController from '../controllers/userController.js';
import path from 'path';


const router = express.Router();
router.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'pages', 'forgetPassword.html'));
});

// E-posta adresini alip sifre sifirlama linkini gönderen route
router.post('/', userController.sendResetLink);

export default router;
