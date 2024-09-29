// twitter.js
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import pool from '../config/db.js';

console.log('Twitter Strategy Tanımlanıyor');

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    includeEmail: true
},
    async function (token, tokenSecret, profile, done) {
        console.log('Twitter Strategy İçindeyiz');

        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@twitter.com`;
            const displayName = profile.displayName || 'TwitterUser';

            console.log('Kullanıcı e-posta:', email);
            console.log('Kullanıcı adı:', displayName);

            // Veritabanında email ile kullanıcıyı kontrol et (users tablosu)
            const existingUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (existingUserByEmail.rows.length > 0) {
                console.log('Kullanıcı zaten mevcut:', existingUserByEmail.rows[0]);
            } else {
                try {
                    // Yeni kullanıcı oluştur (sadece users tablosuna ekleme yapıyoruz)
                    const newUser = await pool.query(
                        'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [displayName, 'TwitterUser', email, 'oauth_user', 'guest']
                    );
                    console.log('Yeni kullanıcı oluşturuldu:', newUser.rows[0]);
                }
                catch (insertError) {
                    console.error('Yeni kullanıcı eklenirken hata oluştu:', insertError.message);
                }
            }

            return done(null, profile);
        } catch (error) {
            console.error('Twitter Strategy Hatası:', error.message);
            return done(error);
        }
    }
));

export default passport;
