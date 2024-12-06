document.addEventListener("DOMContentLoaded", function () {
    const apiTokenURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/token/";
    const apiProductURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/";
    const apiCategoryURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/categorias/";

    const authForm = document.getElementById("auth-form");
    const productForm = document.getElementById("product-form");
    const categoryForm = document.getElementById("category-form");
    const authMessage = document.getElementById("auth-message");
    const productMessage = document.getElementById("product-message");
    const categoryMessage = document.getElementById("category-message");
    const categoriaSelect = document.getElementById("categoria");
    const tokenStatus = document.getElementById("token-status");
    const logoutButton = document.getElementById("logout-button");

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
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

    function carregarCategorias(token) {
        if (!token) return;

        fetch(apiCategoryURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(categorias => {
                categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
                categorias.forEach(categoria => {
                    const option = document.createElement("option");
                    option.value = categoria.nome;
                    option.textContent = categoria.nome;
                    categoriaSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Erro ao carregar categorias:", error));
    }

    function updateTokenStatus() {
        const token = getCookie("authToken");
        if (token) {
            tokenStatus.textContent = "Token salvo no cookie";
            tokenStatus.className = "status success";
            carregarCategorias(token);
        } else {
            tokenStatus.textContent = "Nenhum token encontrado, faça login";
            tokenStatus.className = "status error";
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
                    setCookie("authToken", data.access, 7);
                    showMessage(authMessage, "Login feito com sucesso", true);
                    updateTokenStatus();
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

    productForm.addEventListener("submit", function (event) {
        event.preventDefault();
    
        const token = getCookie("authToken");
        if (!token) return;
    
        const nome = document.getElementById("nome").value;
        const descricao = document.getElementById("descricao").value;
        const disponibilidade = document.getElementById("disponibilidade").checked;
        const imagem_url = document.getElementById("imagem_url").value;
        const categoria = categoriaSelect.value;
        const preco = parseFloat(document.getElementById("preco").value); // Obter o valor do preço
    
        fetch(apiProductURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, descricao, disponibilidade, imagem_url, categoria, preco, acrescimos: [] }), // Incluir preço
        })
            .then(response => response.json())
            .then(() => showMessage(productMessage, "Produto criado com sucesso", true))
            .catch(() => showMessage(productMessage, "Erro ao criar produto", false));
    });
    

    categoryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const token = getCookie("authToken");
        if (!token) return;

        const nome = document.getElementById("nome-categoria").value;
        const descricao = document.getElementById("descricao-categoria").value;

        fetch(apiCategoryURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, descricao }),
        })
            .then(response => response.json())
            .then(() => {
                showMessage(categoryMessage, "Categoria criada com sucesso", true);
                carregarCategorias(token); // Atualiza as categorias
            })
            .catch(() => showMessage(categoryMessage, "Erro ao criar categoria", false));
    });

    updateTokenStatus();
});
