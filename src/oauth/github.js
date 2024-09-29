<<<<<<< HEAD
﻿import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import pool from '../config/db.js';  

console.log('Github Strategy Tanımlanıyor');

=======
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import pool from '../config/db.js';  

>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
// GitHub OAuth Stratejisi
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            // GitHub API'den gelen email bilgisi
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
            const displayName = profile.displayName || profile.username;

            // Veritabaninda email ile kullaniciyi kontrol et (users tablosu)
            const existingUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (existingUserByEmail.rows.length > 0) {
                // Email ile kayitli kullanici varsa, oauth bilgilerini kaydet
                const oauthUser = await pool.query('SELECT * FROM oauth_users WHERE provider = $1 AND user_id = $2', ['github', existingUserByEmail.rows[0].user_id]);

                if (oauthUser.rows.length === 0) {
                    // Eger oauth_users tablosunda kayit yoksa kaydet
                    await pool.query(
                        'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                        ['github', existingUserByEmail.rows[0].user_id, profile.id, accessToken, refreshToken]
                    );
                }
            } else {
                // Eger email ile kayitli kullanici yoksa, yeni kullanici olustur
                const newUser = await pool.query(
                    'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
<<<<<<< HEAD
                    [displayName, 'GitHubUser', email, 'oauth_user', 'guest']  // 'guest' rolünü burada kullanabilirsiniz
=======
                    [displayName, 'GitHubUser', email, 'oauth_user', 'guest']  // 'guest' rol�n� burada kullanabilirsiniz
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
                );

                // Yeni kullanicinin oauth bilgilerini kaydet
                await pool.query(
                    'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                    ['github', newUser.rows[0].user_id, profile.id, accessToken, refreshToken]
                );
            }

            return done(null, profile);
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;
