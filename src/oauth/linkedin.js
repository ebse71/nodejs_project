import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import pool from '../config/db.js';
<<<<<<< HEAD
import axios from 'axios';

console.log('LinkedIn Strategy Tanımlanıyor');
=======


>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/linkedin/callback',
    scope: ['openid', 'profile', 'email'],
    state: true
},
    async function (accessToken, refreshToken, profile, done) {
<<<<<<< HEAD
        console.log('LinkedIn Strategy İçindeyiz');
=======
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3

        try {
            // LinkedIn profil bilgilerinden email ve ad bilgilerini al
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@linkedin.com`;
            const displayName = profile.displayName || profile.name.givenName || 'LinkedInUser';

<<<<<<< HEAD
            console.log('Kullanıcı e-posta:', email);
            console.log('Kullanıcı adı:', displayName);

            // Veritabanı işlemleri başlıyor
            console.log('Veritabanı işlemleri başlıyor...');

            // Veritabanında email ile kullanıcıyı kontrol et (users tablosu)
            const existingUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (existingUserByEmail.rows.length > 0) {
                console.log('Kullanıcı zaten mevcut:', existingUserByEmail.rows[0]);

                // OAuth bilgilerini kontrol et ve ekle
                const oauthUser = await pool.query('SELECT * FROM oauth_users WHERE provider = $1 AND user_id = $2', ['linkedin', existingUserByEmail.rows[0].user_id]);
                if (oauthUser.rows.length === 0) {
                    await pool.query(
                        'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                        ['linkedin', existingUserByEmail.rows[0].user_id, profile.id, accessToken, null]
                    );
                    console.log('Yeni LinkedIn OAuth kaydı oluşturuldu.');
                }
            } else {
                try {
                    // Yeni kullanıcı oluştur
=======
            // Veritabaninda email ile kullaniciyi kontrol et (users tablosu)
            const existingUserByEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (existingUserByEmail.rows.length > 0) {
                console.log('Kullanici zaten mevcut:', existingUserByEmail.rows[0]);
            } else {
                try {
                    // Yeni kullanici olustur (bu kisimda sadece users tablosuna ekleme yapiyoruz)
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
                    const newUser = await pool.query(
                        'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [displayName, 'LinkedInUser', email, 'oauth_user', 'guest']
                    );
<<<<<<< HEAD
                    console.log('Yeni kullanıcı oluşturuldu:', newUser.rows[0]);

                    // Yeni OAuth kullanıcı kaydı
                    await pool.query(
                        'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                        ['linkedin', newUser.rows[0].user_id, profile.id, accessToken, null]
                    );
                    console.log('Yeni LinkedIn OAuth kaydı oluşturuldu.');
                } catch (insertError) {
                    console.error('Yeni kullanıcı eklenirken hata oluştu:', insertError.message);
=======
                }
                catch (insertError) {
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
                }
            }

            return done(null, profile);
        } catch (error) {
<<<<<<< HEAD
            console.error('LinkedIn Strategy Hatası:', error.message);
=======
            console.error('LinkedIn Strategy Hatasi:', error.message);
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
            return done(error);
        }
    }
));

<<<<<<< HEAD
export async function handleLinkedInCallback(req, res) {
    console.log('LinkedIn callback fonksiyonu çalıştı');

    try {
        const code = req.query.code;
        console.log('LinkedIn authorization code:', code);

        const redirect_uri = process.env.LINKEDIN_CALLBACK_URL;

        // Access token alımı
        const tokenUrl = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}&client_id=${process.env.LINKEDIN_CLIENT_ID}&client_secret=${process.env.LINKEDIN_CLIENT_SECRET}`;
        const tokenResponse = await axios.post(tokenUrl);
        const accessToken = tokenResponse.data.access_token;
        console.log('LinkedIn Access Token:', accessToken);

        // Kullanıcı profil bilgilerini al
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

        // Veritabanı işlemleri başlıyor
        console.log('Veritabanı işlemleri başlıyor...');

        // Veritabanında kullanıcı kontrolü
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            console.log('Kullanıcı zaten mevcut:', existingUser.rows[0]);

            // OAuth bilgilerini kontrol et ve ekle
            const oauthUser = await pool.query('SELECT * FROM oauth_users WHERE provider = $1 AND user_id = $2', ['linkedin', existingUser.rows[0].user_id]);
            if (oauthUser.rows.length === 0) {
                await pool.query(
                    'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                    ['linkedin', existingUser.rows[0].user_id, profileId, accessToken, null]
                );
                console.log('Yeni LinkedIn OAuth kaydı oluşturuldu.');
            }
        } else {
            try {
                // Yeni kullanıcı ekleme
                const newUser = await pool.query(
                    'INSERT INTO users (name, surname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [name, 'LinkedInUser', email, 'oauth_user', 'guest']
                );
                console.log('Yeni kullanıcı oluşturuldu:', newUser.rows[0]);

                // Yeni OAuth kullanıcı kaydı
                await pool.query(
                    'INSERT INTO oauth_users (provider, user_id, provider_id, access_token, refresh_token) VALUES ($1, $2, $3, $4, $5)',
                    ['linkedin', newUser.rows[0].user_id, profileId, accessToken, null]
                );
                console.log('Yeni LinkedIn OAuth kaydı oluşturuldu.');
            } catch (insertError) {
                console.error('Yeni kullanıcı eklenirken hata oluştu:', insertError.message);
            }
        }

        // Kullanıcıyı üçüncü taraf sayfasına yönlendir
        res.redirect(`/pages/dritteAnbieter.html?provider=LinkedIn&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&id=${encodeURIComponent(profileId)}`);
    } catch (error) {
        console.error('Error during LinkedIn callback:', error);
        res.status(500).json({
            message: "Internal Server Error",
            error,
        });
    }
}
=======
export default passport;
>>>>>>> eadaa1bad28b12c1171e3eefe9ae27d9e5961bb3
