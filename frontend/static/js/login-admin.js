document.addEventListener("DOMContentLoaded", function () {
    const apiTokenURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/token/";
    const authForm = document.getElementById("auth-form");
    const authMessage = document.getElementById("auth-message");
    const tokenStatus = document.getElementById("token-status");
    const logoutButton = document.getElementById("logout-button");

    const TOKEN_EXPIRATION_TIME = 30 * 60 * 1000;

    function setCookie(name, value, expirationMillis) {
        const date = new Date();
        date.setTime(date.getTime() + expirationMillis);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(nameEQ)) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }

    function showMessage(element, message, isSuccess) {
        element.textContent = message;
        element.className = `response-message ${isSuccess ? "success" : "error"}`;
        element.style.display = "block";
    }

    function updateTokenStatus() {
        const token = getCookie("authToken");
        console.log("Token encontrado:", token); // Log para depurar
        if (token) {
            tokenStatus.textContent = "Token salvo no cookie";
            tokenStatus.className = "status success";
        } else {
            tokenStatus.textContent = "Nenhum token encontrado, faça login";
            tokenStatus.className = "status error";
        }
    }

    function checkTokenExpiration() {
        const token = getCookie("authToken");
        if (!token) {
            deleteCookie("authToken"); // Remove o token, caso esteja expirado
            updateTokenStatus();
            showMessage(authMessage, "Sua sessão expirou. Faça login novamente.", false);
        }
    }

    authForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch(apiTokenURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.access) {
                    setCookie("authToken", data.access, TOKEN_EXPIRATION_TIME);
                    showMessage(authMessage, "Login feito com sucesso", true);
                    updateTokenStatus();

                    // Configura a verificação da expiração do token
                    setTimeout(() => {
                        checkTokenExpiration();
                    }, TOKEN_EXPIRATION_TIME);
                } else {
                    showMessage(authMessage, "Erro ao fazer login", false);
                }
            })
            .catch(() => showMessage(authMessage, "Erro ao fazer login", false));
    });

    logoutButton.addEventListener("click", function () {
        deleteCookie("authToken");
        updateTokenStatus();
        showMessage(authMessage, "Você saiu com sucesso.", true);
    });

    updateTokenStatus();

    // Verifica periodicamente se o token expirou
    setInterval(checkTokenExpiration, 1000);
});
