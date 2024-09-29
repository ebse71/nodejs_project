// /public/js/verification.js

document.addEventListener('DOMContentLoaded', () => {
    const sendCodeBtn = document.getElementById('send-code-btn');
    const verifyBtn = document.getElementById('verify-btn');
    const codeInputContainer = document.getElementById('code-input-container');
    const verificationCodeInput = document.getElementById('verification-code');
    const countdownElement = document.getElementById('countdown');
    const resendCodeBtn = document.getElementById('resend-code-btn');

    let countdownInterval;
    let verificationMethod = 'email'; // Varsayılan doğrulama yöntemi

    // Doğrulama yöntemi seçildiğinde
    document.querySelectorAll('input[name="auth-method"]').forEach((input) => {
        input.addEventListener('change', (event) => {
            verificationMethod = event.target.value;
        });
    });

    // Kod gönderme
    sendCodeBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini önle

        try {
            await sendVerificationCode(); // Fonksiyonu kullan
        } catch (error) {
            console.error('Kod gönderme hatası:', error);
        }
    });

    // Kodu tekrar gönderme
    resendCodeBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini önle
        try {
            await sendVerificationCode(); // Kod göndermeyi yeniden başlat
        } catch (error) {
            console.error('Kod tekrar gönderme hatası:', error);
        }
    });

    // Kod gönderme fonksiyonu
    async function sendVerificationCode() {
        try {
            const response = await fetch('/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ method: verificationMethod }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Doğrulama kodu gönderildi.');
                startCountdown();
                codeInputContainer.style.display = 'block';
                sendCodeBtn.disabled = true; // Kod gönderildikten sonra butonu pasif yap
                resendCodeBtn.style.display = 'none'; // Tekrar gönderme butonunu gizle
            } else {
                alert('Kod gönderilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kod gönderme hatası:', error);
        }
    }

    // Kod doğrulama
    verifyBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini önle

        const code = verificationCodeInput.value;

        try {
            const response = await fetch('/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Doğrulama başarılı! Yönlendiriliyorsunuz...');
                // Doğrulama başarılı, admin paneline yönlendir
                window.location.href = '../pages/adminPanel.html';
            } else {
                alert('Kod hatalı veya süresi dolmuş.');
            }
        } catch (error) {
            console.error('Doğrulama hatası:', error);
        }
    });

    // Geri sayım başlatma
    function startCountdown() {
        let timeLeft = 30;
        countdownElement.textContent = timeLeft;
        resendCodeBtn.style.display = 'none'; // Geri sayım sırasında tekrar gönderme butonunu gizle

        countdownInterval = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                resendCodeBtn.style.display = 'block'; // Geri sayım bittiğinde tekrar gönderme butonunu göster
            }
        }, 1000);
    }
});
