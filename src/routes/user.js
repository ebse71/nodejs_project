// /src/routes/user.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// İlk giriş kontrolü rotası
router.post('/check_first_login', userController.checkFirstLogin);

module.exports = router;
