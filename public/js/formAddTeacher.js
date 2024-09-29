function setupFormSubmitListener() {
    const form = document.getElementById('teacherForm');

    if (form) {
        console.log('Form bulundu.');

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('Form gönderildi.');

            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => (data[key] = value));

            // Önceki hataları temizle
            const emailField = document.getElementById('email');
            emailField.classList.remove('error-input');
            const messageDiv = document.getElementById('message');
            messageDiv.style.display = 'none';
            messageDiv.innerHTML = '';

            try {
                const response = await fetch('/teacher/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                console.log('Sunucudan cevap alındı:', result);

                if (response.ok && result.status === 'success') {
                    messageDiv.innerHTML = `<p class="success">${result.message}</p>`;
                    messageDiv.style.display = 'block';
                    this.reset();
                } else {
                    // Hata mesajını göster
                    messageDiv.innerHTML = `<p class="error">${result.errors ? result.errors.join(', ') : 'Bir hata oluştu.'}</p>`;
                    messageDiv.style.display = 'block';

                    // E-posta alanını vurgula
                    if (result.errors && result.errors.includes('Diese E-Mail-Adresse ist bereits registriert.')) {
                        emailField.classList.add('error-input'); // Adds the red border
                        emailField.focus();
                    }
                }
            } catch (error) {
                console.error('Fehler:', error);
                messageDiv.innerHTML = `<p class="error">Es gab einen Fehler bei der Verarbeitung: ${error.message}</p>`;
                messageDiv.style.display = 'block';
            }
        });
    } else {
        console.error('Form bulunamadı.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setupFormSubmitListener();
});
