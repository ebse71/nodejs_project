
// Passwortregeln und Button-Status überprüfen
const passwordInput = document.getElementById('new_password');
const confirmPasswordInput = document.getElementById('confirm_password');
const submitButton = document.getElementById('submit-button');



document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', function () {
        const passwordField = this.previousElementSibling.previousElementSibling;  // İlgili şifre alanını bul
        const icon = this;

        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});




function validatePassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const lengthRule = document.getElementById('length-rule');
    const lowercaseRule = document.getElementById('lowercase-rule');
    const uppercaseRule = document.getElementById('uppercase-rule');
    const symbolRule = document.getElementById('symbol-rule');
    const numberRule = document.getElementById('number-rule');
    const matchRule = document.getElementById('match-rule');

    const rulesMet = {
        length: password.length >= 10,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        number: /\d/.test(password),
        match: password === confirmPassword
    };

    lengthRule.className = rulesMet.length ? 'valid' : 'invalid';
    lowercaseRule.className = rulesMet.lowercase ? 'valid' : 'invalid';
    uppercaseRule.className = rulesMet.uppercase ? 'valid' : 'invalid';
    symbolRule.className = rulesMet.symbol ? 'valid' : 'invalid';
    numberRule.className = rulesMet.number ? 'valid' : 'invalid';
    matchRule.className = rulesMet.match ? 'valid' : 'invalid';

    const allValid = Object.values(rulesMet).every(Boolean);
    submitButton.disabled = !allValid;
}

passwordInput.addEventListener('input', validatePassword);
confirmPasswordInput.addEventListener('input', validatePassword);