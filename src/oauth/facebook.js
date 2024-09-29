// src/oauth/facebook.js
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import pool from '../config/db.js';

console.log('Facebook Strategy Tanımlanıyor');
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
    console.log('Facebook Strategy İçindeyiz');

    try {
        // Facebook profil bilgilerinden email ve ad bilgilerini al
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;
        const displayName = profile.displayName || 'FacebookUser';

        console.log('Kullanıcı e-posta:', email);
        console.log('Kullanıcı adı:', displayName);

        // Veritabanında email ile kullanıcıyı kontrol et (users tablosu)
        const existingUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUserByEmail.rows.length > 0) {
            console.log('Kullanıcı zaten mevcut:', existingUserByEmail.rows[0]);
        } else {
            try {
                // Yeni kullanıcı oluştur (bu kısımda sadece users tablosuna ekleme yapıyoruz)
                const newUser = await pool.query(
                    'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [displayName, 'FacebookUser', email, 'oauth_user', 'guest']
                );
                console.log('Yeni kullanıcı oluşturuldu:', newUser.rows[0]);
            } catch (insertError) {
                console.error('Yeni kullanıcı eklenirken hata oluştu:', insertError.message);
            }
        }

        return done(null, profile);
    } catch (error) {
        console.error('Facebook Strategy Hatası:', error.message);
        return done(error);
    }
}));

export default passport;
