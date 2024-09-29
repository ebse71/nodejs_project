import express from 'express';
import path from 'path';
import { checkToken } from '../utils/functions.js';
import userController from '../controllers/userController.js'; // Öğretmen ekleme işlemi burada yer alacak

const router = express.Router();

// Oturum kontrolü ve öğretmen ekleme sayfasını sunma
router.get('/add', checkToken, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'pages', 'formAddTeacher.html'));
});

// Öğretmen ekleme işlemi
router.post('/add', checkToken, userController.addTeacher);

export default router;
