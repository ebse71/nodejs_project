import express from 'express';
import path from 'path';
import userController from '../controllers/userController.js';

const router = express.Router();

// Login sayfasını sunma
router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'pages', 'userLogin.html')); 
});

// Login işlemi
router.post('/', userController.login);

export default router;
