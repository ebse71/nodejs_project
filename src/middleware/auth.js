// /src/middleware/auth.js

import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/functions.js';


const authenticateToken = (req, res, next) => {
  const token = req.cookies['user_token'];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded; // Token içindeki kullanıcı bilgileri
    next();
  });
};

export default authenticateToken;
