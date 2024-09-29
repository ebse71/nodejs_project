// /public/js/menu.js

document.querySelectorAll('.sidebar ul.menu li a').forEach(function(menuItem) {
    menuItem.addEventListener('click', function(e) {
        e.preventDefault();
        const contentId = this.getAttribute('data-content');
        loadSubMenu(contentId);
    });
});

function loadSubMenu(contentId) {
    const contentArea = document.getElementById('content-area');
    let subMenuHtml = '';

    switch (contentId) {
        case 'lehrer-aktionen':
            subMenuHtml = `
                <div class="button-grid">
                    <a href="#" data-action="lehrer-hinzufuegen"><i class="fas fa-user-plus"></i>Lehrer hinzufügen</a>
                    <a href="#" data-action="lehrer-aktualisieren"><i class="fas fa-user-edit"></i>Lehrer aktualisieren</a>
                    <a href="#" data-action="lehrer-loeschen"><i class="fas fa-user-minus"></i>Lehrer löschen</a>
                    <a href="#" data-action="lehrer-liste"><i class="fas fa-list"></i>Lehrerliste</a>
                    <a href="#" data-action="lehrer-unterricht-zuweisen"><i class="fas fa-chalkboard-teacher"></i>Lehrer zuweisen</a>
                </div>
            `;
            break;
        // Diğer case'leri buraya ekleyin...
        default:
            subMenuHtml = '<p>Noch kein Inhalt verfügbar.</p>';
            break;
    }

    reverseAnimateContent(() => {
        contentArea.innerHTML = subMenuHtml;
        animateContent(() => {
            setupSubButtonListeners();
        });
    });
}

function setupSubButtonListeners() {
    const contentArea = document.getElementById('content-area');
    const subButtons = contentArea.querySelectorAll('.button-grid a');

    subButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            loadContentByAction(action);
        });
    });
}

function loadContentByAction(action) {
    const contentArea = document.getElementById('content-area');
    let contentUrl = '';

    switch (action) {
        case 'lehrer-hinzufuegen':
            contentUrl = '../pages/form_add_teacher.html';
            break;
        // Diğer case'leri buraya ekleyin...
        default:
            contentArea.innerHTML = '<p>Inhalt ist derzeit nicht verfügbar.</p>';
            return;
    }

    if (contentUrl) {
        fetch(contentUrl)
            .then(response => response.text())
            .then(html => {
                contentArea.innerHTML = html;
                setupFormSubmitListener(); // Form gönderim dinleyicisini ayarla
            })
            .catch(error => {
                contentArea.innerHTML = `<p>Fehler beim Laden des Inhalts: ${error.message}</p>`;
            });
    }
}

function setupFormSubmitListener() {
    const teacherForm = document.querySelector('.teacher-form');

    if (teacherForm) {
        teacherForm.removeEventListener('submit', formSubmitHandler);
        teacherForm.addEventListener('submit', formSubmitHandler);
    }
}

function formSubmitHandler(e) {
    e.preventDefault(); // Varsayılan form gönderimini engelle

    let formData = new FormData(this);

    fetch('/add_teacher', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        document.getElementById('content-area').innerHTML = result;
        setupFormSubmitListener(); // Form gönderim dinleyicisini tekrar ayarla
    })
    .catch(error => {
        console.error('Fehler:', error);
    });
}

function animateContent(callback) {
    const items = document.querySelectorAll('.button-grid a');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('show');
            if (index === items.length - 1 && typeof callback === 'function') {
                setTimeout(callback, 100);
            }
        }, index * 100);
    });
}

function reverseAnimateContent(callback) {
    const items = document.querySelectorAll('.button-grid a.show');
    const totalItems = items.length;

    if (totalItems === 0) {
        if (typeof callback === 'function') {
            callback();
        }
        return;
    }

    const delay = 100;

    for (let i = totalItems - 1; i >= 0; i--) {
        setTimeout(() => {
            items[i].classList.remove('show');
            items[i].style.pointerEvents = 'none';

            if (i === 0 && typeof callback === 'function') {
                setTimeout(callback, delay);
            }
        }, (totalItems - 1 - i) * delay);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.querySelector('.sidebar');

    if (menuButton && sidebar) {
        // Menü butonu tıklamasıyla sidebar göster/gizle
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Etkinin yayılmasını engelle
            sidebar.classList.toggle('open');
        });

        // Sidebar dışına tıklanınca sidebar'ı gizle
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !menuButton.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Menü öğesine tıklanınca sidebar'ı gizle
    document.querySelectorAll('.sidebar ul.menu li a').forEach(function(menuItem) {
        menuItem.addEventListener('click', function() {
            sidebar.classList.remove('open');
        });
    });
});

// Oturum zaman aşımı kontrolü
let timeout;

function startTimeout() {
    timeout = setTimeout(() => {
        alert("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
        window.location.href = "../pages/user_login.html";
    }, 5 * 60 * 1000); // 5 dakika (300.000 ms)
}

function resetTimeout() {
    clearTimeout(timeout);
    startTimeout();
}

// Sayfa yüklendiğinde veya kullanıcı etkileşimi olduğunda zamanlayıcıyı başlat/sıfırla
window.onload = startTimeout;
document.onmousemove = resetTimeout;
document.onkeydown = resetTimeout;
