document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("auth-form");
    const tokenDisplay = document.getElementById("token-display");
    const shortTokenSpan = document.getElementById("short-token");
    const copyButton = document.getElementById("copy-btn");

    let fullToken = ""; // Armazena o token completo

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const apiURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/token/";

        const requestData = {
            username: username,
            password: password,
        };

        fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Erro ao autenticar. Verifique suas credenciais.");
                }
                return response.json();
            })
            .then(data => {
                if (data.access) {
                    fullToken = data.access; // Armazena o token completo
                    const shortToken = `${fullToken.slice(0, 40)}...`; // Abrevia o token
                    shortTokenSpan.textContent = shortToken;
                    tokenDisplay.style.display = "block";
                } else {
                    throw new Error("Token de acesso não encontrado na resposta.");
                }
            })
            .catch(error => {
                alert(error.message);
                tokenDisplay.style.display = "none";
            });
    });

    // Copiar o token completo ao clicar no botão
    copyButton.addEventListener("click", function () {
        navigator.clipboard.writeText(fullToken)
            .then(() => {
                alert("Token copiado para a área de transferência!");
            })
            .catch(() => {
                alert("Erro ao copiar o token.");
            });
    });
});
