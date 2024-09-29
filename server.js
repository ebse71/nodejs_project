<<<<<<< HEAD
﻿import dotenv from 'dotenv';
=======
import dotenv from 'dotenv';
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
dotenv.config();
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
<<<<<<< HEAD
import passport from 'passport';
import './src/oauth/github.js';
import './src/oauth/linkedin.js';
import './src/oauth/twitter.js';
import './src/oauth/facebook.js';
import { sendVerificationEmail, sendVerificationSMS } from './src/utils/functions.js';
import userModel from './src/models/userModel.js';
=======
import passport from 'passport'; 
import fs from 'fs';
import axios from 'axios';
import pool from './src/config/db.js'; 
import './src/oauth/github.js';  
import './src/oauth/linkedin.js'; 
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3

// Import routes
import loginRoutes from './src/routes/login.js';
import resetPasswordRoutes from './src/routes/resetPassword.js';
import teacherRoutes from './src/routes/teacher.js';
import adminRoutes from './src/routes/admin.js';
import forgetPasswordRoutes from './src/routes/forgetPassword.js';
<<<<<<< HEAD
import { handleLinkedInCallback } from './src/oauth/linkedin.js';
=======

// Middleware for authentication
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
import authenticateToken from './src/middleware/auth.js';

const app = express();
app.use(cors());

// Express session middleware for session management
<<<<<<< HEAD
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-session-secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);
=======
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3

// Initialize Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    console.log('serializeUser called:', user);
    done(null, user);
});

passport.deserializeUser((user, done) => {
    console.log('deserializeUser called:', user);
    done(null, user);
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from 'public' folder
app.use(express.static('public'));

// Main route to redirect to login page
app.get('/', (req, res) => {
    res.redirect('/pages/userLogin.html');
});

// Define routes
app.use('/login', loginRoutes);
app.use('/forgetPassword', forgetPasswordRoutes);
app.use('/reset-password', resetPasswordRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', authenticateToken, adminRoutes);

<<<<<<< HEAD
// /auth.html sayfasını sunma
app.get('/auth', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'pages', 'auth.html'));
});

// /send-verification-code rotası (Doğrulama kodu gönderme)
app.post('/send-verification-code', async (req, res) => {
    const { method } = req.body; // E-posta veya SMS

    // Rastgele 5 haneli bir doğrulama kodu oluşturma
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();

    try {
        const userPhoneNumber = await userModel.getTelefonByEmail(req.session.email);

        if (method === 'email') {
            await sendVerificationEmail(req.session.email, verificationCode);
        } else if (method === 'sms') {
            if (!userPhoneNumber) {
                return res.json({ status: 'error', message: 'Telefon numarası bulunamadı.' });
            }
            await sendVerificationSMS(userPhoneNumber, verificationCode);
        }

        req.session.verificationCode = verificationCode;
        console.log('Doğrulama kodu oluşturuldu ve session’da saklandı:', verificationCode);

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Doğrulama kodu gönderme hatası:', error);
        res.json({ status: 'error', message: 'Kod gönderilirken bir hata oluştu.' });
    }
});

// /verify-code rotası (Kod doğrulama)
app.post('/verify-code', (req, res) => {
    const { code } = req.body;

    // Session'daki doğrulama kodunu al
    const sessionCode = req.session.verificationCode;

    if (code === sessionCode) {
        // Kod doğru ise session’daki kodu sil
        delete req.session.verificationCode;
        res.json({ status: 'success' });
    } else {
        res.json({ status: 'error', message: 'Kod hatalı veya süresi dolmuş.' });
    }
});

=======
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// GitHub authentication route
app.get('/auth/github', passport.authenticate('github'));

// GitHub callback route
app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
}), (req, res) => {
    const user = req.user;
    res.redirect(`/pages/dritteAnbieter.html?provider=GitHub&name=${encodeURIComponent(user.displayName)}&email=${encodeURIComponent(user.email)}&id=${encodeURIComponent(user.id)}&avatar_url=${encodeURIComponent(user.avatarUrl)}&profile_url=${encodeURIComponent(user.profileUrl)}`);
 });
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3

// LinkedIn authentication route
app.get('/auth/linkedin', passport.authenticate('linkedin'));

// LinkedIn callback route
<<<<<<< HEAD
app.get('/auth/linkedin/callback', handleLinkedInCallback);

// Github authentication route
app.get('/auth/github', passport.authenticate('github'));

// Github callback route
app.get(
    '/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/login',
    }),
    (req, res) => {
        const user = req.user;
        res.redirect(
            `/pages/dritteAnbieter.html?provider=GitHub&name=${encodeURIComponent(
                user.displayName
            )}&email=${encodeURIComponent(user.email)}&id=${encodeURIComponent(
                user.id
            )}&avatar_url=${encodeURIComponent(user.avatarUrl)}&profile_url=${encodeURIComponent(
                user.profileUrl
            )}`
        );
    }
);

// Twitter authentication route
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter callback route
app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', {
        failureRedirect: '/login',
    }),
    (req, res) => {
        const user = req.user;
        res.redirect(
            `/pages/dritteAnbieter.html?provider=Twitter&name=${encodeURIComponent(
                user.displayName
            )}&email=${encodeURIComponent(user.emails && user.emails[0] ? user.emails[0].value : '')}&id=${encodeURIComponent(
                user.id
            )}`
        );
    }
);

// Facebook authentication route
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook callback route
app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
    }),
    (req, res) => {
        const user = req.user;
        res.redirect(
            `/pages/dritteAnbieter.html?provider=Facebook&name=${encodeURIComponent(
                user.displayName
            )}&email=${encodeURIComponent(user.emails && user.emails[0] ? user.emails[0].value : '')}&id=${encodeURIComponent(
                user.id
            )}`
        );
    }
);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
=======
app.get('/auth/linkedin/callback', async (req, res) => {
    console.log('LinkedIn callback fonksiyonu �alisti');

    try {
        const code = req.query.code;
        console.log('LinkedIn authorization code:', code);

        const redirect_uri = process.env.LINKEDIN_CALLBACK_URL;

        // Step 2: Retrieve access token manually
        const tokenUrl = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}&client_id=${process.env.LINKEDIN_CLIENT_ID}&client_secret=${process.env.LINKEDIN_CLIENT_SECRET}`;
        const tokenResponse = await axios.post(tokenUrl);
        const accessToken = tokenResponse.data.access_token;
        console.log('LinkedIn Access Token:', accessToken);

        // Step 3: Fetch user profile using the access token
        const userProfileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const userProfile = userProfileResponse.data;
        console.log('LinkedIn Profile Data:', userProfile);

        // Create user object with LinkedIn data
        const email = userProfile.email;
        const name = userProfile.name;
        const profileId = userProfile.sub;

        // Step 4: Check if the user already exists in the database
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            console.log('Kullanici zaten mevcut:', existingUser.rows[0]);

            // OAuth bilgilerini kontrol et ve ekle
            const oauthUser = await pool.query('SELECT * FROM oauth_users WHERE provider = $1 AND user_id = $2', ['linkedin', existingUser.rows[0].user_id]);
            if (oauthUser.rows.length === 0) {
                await pool.query(
                    'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                    ['linkedin', existingUser.rows[0].user_id, profileId, accessToken, null]
                );
                console.log('Yeni LinkedIn OAuth kaydi olusturuldu.');
            }
        } else {
            // Step 5: Add new user to the database
            try {
                const newUser = await pool.query(
                    'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [name, 'LinkedInUser', email, 'oauth_user', 'guest']
                );
                console.log('Yeni kullanici olusturuldu:', newUser.rows[0]);

                // Add new OAuth user record
                await pool.query(
                    'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                    ['linkedin', newUser.rows[0].user_id, profileId, accessToken, null]
                );
                console.log('Yeni LinkedIn OAuth kaydi olusturuldu.');
            } catch (insertError) {
                console.error('Yeni kullanici eklenirken hata olustu:', insertError.message);
            }
        }

        // Step 6: Redirect to dritteAnbieter.html with user data
        res.redirect(`/pages/dritteAnbieter.html?provider=LinkedIn&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&id=${encodeURIComponent(profileId)}`);
    } catch (error) {
        console.error('Error during LinkedIn callback:', error);
        res.status(500).json({
            message: "Internal Server Error",
            error,
        });
    }
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
});
