document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("auth-form");
    const tokenDisplay = document.getElementById("token-display");
    const tokenParagraph = document.getElementById("token");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Configura a URL da API
        const apiURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/token/";

        // Corpo da requisição
        const requestData = {
            username: username,
            password: password,
        };

        // Realiza o POST
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
                // Exibe o token na página
                if (data.token) {
                    tokenParagraph.textContent = data.token;
                    tokenDisplay.style.display = "block";
                } else {
                    throw new Error("Resposta inesperada da API.");
                }
            })
            .catch(error => {
                // Lida com erros
                alert(error.message);
                tokenDisplay.style.display = "none";
            });
    });
});
