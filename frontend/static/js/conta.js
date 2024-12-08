// Alternar entre abas
document.getElementById('loginTab').addEventListener('click', function () {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    this.classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
});

document.getElementById('registerTab').addEventListener('click', function () {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    this.classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
});

// Função para salvar cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// Função para apagar cookie
function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Função para recuperar cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Exibir mensagem de boas-vindas
function showWelcomeMessage() {
    const username = getCookie('username');
    if (username) {
        document.getElementById('welcomeMessage').classList.remove('hidden');
        document.getElementById('username').textContent = username;
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    }
}

// Gera hash SHA-1 dos primeiros 6 caracteres
async function generateUsername(inputUsername, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${inputUsername}@${hashHex.slice(0, 6)}`;
}

// Função para validar o username
function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9@.+-_]+$/;
    return regex.test(username);
}

// Função de login
async function performLogin(username, password) {
    const realUsername = await generateUsername(username, password);

    const response = await fetch(
        'https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/usuarios/login/',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: realUsername, password }),
        }
    );

    if (response.ok) {
        const data = await response.json();
        setCookie('conta-token', data.access, 30);
        setCookie('username', username, 30);

        showWelcomeMessage();
        return true;
    }
    return false;
}

// Registro de usuário
document.getElementById('register').addEventListener('submit', async function (e) {
    e.preventDefault();
    let username = document.getElementById('registerUsername').value.trim(); // Remover espaços
    const password = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value;

    // Validação do username
    if (!isValidUsername(username)) {
        alert('Username inválido. Use apenas letras, números e os símbolos @, ., +, -, _.');
        return;
    }

    const realUsername = await generateUsername(username, password);

    const response = await fetch(
        'https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/usuarios/registrar/',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: realUsername, password, email }),
        }
    );

    if (response.ok) {
        const loginSuccess = await performLogin(username, password);
        if (!loginSuccess) {
            alert('Registro realizado com sucesso, mas houve um erro ao fazer login automático. Por favor, faça login manualmente.');
            document.getElementById('loginTab').click();
        }
    } else {
        alert('Erro ao registrar. Verifique os dados e tente novamente.');
    }
});

// Login de usuário
document.getElementById('login').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim(); // Remover espaços
    const password = document.getElementById('loginPassword').value;

    const loginSuccess = await performLogin(username, password);
    if (!loginSuccess) {
        alert('Erro ao fazer login. Verifique suas credenciais.');
    }
});

// Logout
document.getElementById('logout').addEventListener('click', function () {
    deleteCookie('conta-token');
    deleteCookie('username');
    location.reload();
});

// Exibir mensagem de boas-vindas ao carregar a página
document.addEventListener('DOMContentLoaded', showWelcomeMessage);
