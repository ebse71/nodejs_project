// /src/routes/admin.js

import express from 'express';
import userController from '../controllers/userController.js';
import { checkToken } from '../utils/functions.js';

const router = express.Router();

// Admin panelini görüntüleme
router.get('/panel', checkToken, (req, res) => {
    res.sendFile('adminPanel.html', { root: './public/pages' });
});

// Öğretmen ekleme işlemi
router.post('/add-teacher', checkToken, userController.addTeacher);

export default router;
