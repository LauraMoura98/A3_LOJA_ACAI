document.addEventListener("DOMContentLoaded", function () {
    const apiProductURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/";
    const apiCategoryURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/categorias/";
    const apiAcrescimosURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/";
    
    const productForm = document.getElementById("product-form");
    const categoryForm = document.getElementById("category-form");
    const productMessage = document.getElementById("product-message");
    const categoryMessage = document.getElementById("category-message");
    const categoriaSelect = document.getElementById("categoria");
    const tokenStatus = document.getElementById("token-status");
    const logoutButton = document.getElementById("logout-button");

    let acrescimosData = [];

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

    function loadAcrescimos() {
        fetch(apiAcrescimosURL)
        .then(response => response.json())
        .then(acrescimos => {
            acrescimosData = acrescimos;
            renderAcrescimosCheckboxes(acrescimos, "product-acrescimos"); // Renderiza no formulário de produto
        })
        .catch(error => {
            console.error('Erro ao carregar acréscimos:', error);
        });
    }

    function renderAcrescimosCheckboxes(acrescimos, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ""; // Limpa o container
    
        acrescimos.forEach(acrescimo => {
            const li = document.createElement("li");
            li.className = "acrescimo-item"; // Classe para estilização
    
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = acrescimo.nome;
            checkbox.id = `acrescimo-${acrescimo.id}`;
    
            const label = document.createElement("label");
            label.htmlFor = `acrescimo-${acrescimo.id}`;
            label.textContent = `${acrescimo.nome}`;
    
            li.appendChild(checkbox);
            li.appendChild(label);
            container.appendChild(li);
        });
    }
    

    function updateTokenStatus() {
        const token = getCookie("authToken");
        if (token) {
            tokenStatus.textContent = "Token salvo no cookie";
            tokenStatus.className = "status success";
            carregarCategorias(token);
            loadAcrescimos(); // Carregar acréscimos ao atualizar o status do token
        } else {
            tokenStatus.textContent = "Nenhum token encontrado, faça login";
            tokenStatus.className = "status error";
        }
    }

    logoutButton.addEventListener("click", function () {
        deleteCookie("authToken");
        updateTokenStatus();
        showMessage(tokenStatus, "Você saiu com sucesso.", true);
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

        // Obter acréscimos selecionados
        const selectedAcrescimos = Array.from(document.querySelectorAll("#product-acrescimos input[type=checkbox]:checked")).map(checkbox => checkbox.value);

        fetch(apiProductURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome,
                descricao,
                disponibilidade,
                imagem_url,
                categoria,
                acrescimos: selectedAcrescimos // Incluir os acréscimos no corpo da requisição
            }),
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
