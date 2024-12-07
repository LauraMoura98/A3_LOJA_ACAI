document.addEventListener("DOMContentLoaded", function () {
    const apiProdutosURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/";
    const apiTamanhosURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanhos/";
    const apiTamanhoProdutosURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanho-produtos/";

    const tamanhoForm = document.getElementById("tamanho-form");
    const tamanhoProdutoForm = document.getElementById("tamanho-produto-form");
    const produtoSelect = document.getElementById("produto-select");
    const tamanhoSelect = document.getElementById("tamanho-select");
    const tamanhoList = document.getElementById("tamanho-list");
    const tamanhoProdutoList = document.getElementById("tamanho-produto-list");
    const tokenStatus = document.getElementById("token-status");

    let produtosMap = new Map();
    let tamanhosMap = new Map(); // Mapa para armazenar tamanhos e seus IDs

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

    function showMessage(message, isSuccess) {
        alert(`${isSuccess ? "Sucesso:" : "Erro:"} ${message}`);
    }

    function fetchProdutos() {
        const token = getCookie("authToken");
        return fetch(apiProdutosURL, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => response.json())
            .then(produtos => {
                produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
                produtosMap = new Map(produtos.map(produto => [produto.id, produto.nome]));
                produtos.forEach(produto => {
                    const option = document.createElement("option");
                    option.value = produto.id;
                    option.textContent = produto.nome;
                    produtoSelect.appendChild(option);
                });
                return produtosMap;
            })
            .catch(error => {
                console.error("Erro ao carregar produtos:", error);
                throw error;
            });
    }

    function fetchTamanhos() {
        const token = getCookie("authToken");
        return fetch(apiTamanhosURL, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => response.json())
            .then(tamanhos => {
                tamanhoSelect.innerHTML = '<option value="">Selecione um tamanho</option>';
                tamanhoList.innerHTML = "";
                tamanhosMap.clear(); // Limpa o mapa antes de preenchê-lo

                tamanhos.forEach(tamanho => {
                    const option = document.createElement("option");
                    option.value = tamanho.id;
                    option.textContent = `${tamanho.nome} (${tamanho.descricao})`;
                    tamanhoSelect.appendChild(option);

                    tamanhosMap.set(tamanho.nome, tamanho.id); // Mapeia o nome para o ID

                    const li = document.createElement("li");
                    li.innerHTML = `
                        <strong>${tamanho.nome}</strong> - ${tamanho.descricao}
                        <button class="delete-tamanho" data-id="${tamanho.id}">Excluir</button>
                    `;
                    tamanhoList.appendChild(li);
                });

                attachTamanhoDeleteListeners();
            })
            .catch(error => console.error("Erro ao carregar tamanhos:", error));
    }

    function fetchTamanhoProdutos() {
        const token = getCookie("authToken");
        return fetch(apiTamanhoProdutosURL, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => response.json())
            .then(tamanhoProdutos => {
                tamanhoProdutoList.innerHTML = "";

                tamanhoProdutos.forEach(tamanhoProduto => {
                    const produtoNome = produtosMap.get(tamanhoProduto.Produto) || `Produto ID: ${tamanhoProduto.Produto}`;
                    const tamanhos = tamanhoProduto.Tamanhos;

                    const groupDiv = document.createElement("div");
                    groupDiv.className = "produto-group";
                    groupDiv.innerHTML = `<h4>${produtoNome}</h4><strong>Tamanhos:</strong><ul>`;

                    Object.entries(tamanhos).forEach(([tamanho, preco]) => {
                        const tamanhoId = tamanhosMap.get(tamanho); // Obtém o ID do tamanho pelo nome
                        const li = document.createElement("li");
                        li.innerHTML = `${tamanho}: R$ ${parseFloat(preco).toFixed(2)}
                        <button class="delete-tamanho-produto" data-produto="${tamanhoProduto.Produto}" data-tamanho="${tamanhoId}">Excluir</button>`; // Usa o ID aqui
                        groupDiv.querySelector("ul").appendChild(li);
                    });

                    groupDiv.innerHTML += "</ul>";
                    tamanhoProdutoList.appendChild(groupDiv);
                });

                attachTamanhoProdutoDeleteListeners();
            })
            .catch(error => console.error("Erro ao carregar tamanhos-produtos:", error));
    }

    function attachTamanhoDeleteListeners() {
        document.querySelectorAll(".delete-tamanho").forEach(button => {
            button.addEventListener("click", function () {
                const tamanhoId = button.getAttribute("data-id");
                const token = getCookie("authToken");

                fetch(`${apiTamanhosURL}${tamanhoId}/`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(() => {
                        showMessage("Tamanho excluído!", true);
                        fetchTamanhos();
                    })
                    .catch(() => showMessage("Erro ao excluir tamanho!", false));
            });
        });
    }

    function attachTamanhoProdutoDeleteListeners() {
        document.querySelectorAll(".delete-tamanho-produto").forEach(button => {
            button.addEventListener("click", function () {
                const produtoId = button.getAttribute("data-produto");
                const tamanhoId = button.getAttribute("data-tamanho");
                const token = getCookie("authToken");

                fetch(`${apiTamanhoProdutosURL}${produtoId}/${tamanhoId}/`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(() => {
                        showMessage("Tamanho-produto excluído!", true);
                        fetchTamanhoProdutos();
                    })
                    .catch(() => showMessage("Erro ao excluir tamanho-produto!", false));
            });
        });
    }

    tamanhoForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = document.getElementById("tamanho-nome").value;
        const descricao = document.getElementById("tamanho-descricao").value;
        const token = getCookie("authToken");

        fetch(apiTamanhosURL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, descricao }),
        })
            .then(() => {
                showMessage("Tamanho criado com sucesso!", true);
                fetchTamanhos();
            })
            .catch(() => showMessage("Erro ao criar tamanho!", false));
    });

    tamanhoProdutoForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const produtoId = produtoSelect.value;
        const tamanhoId = tamanhoSelect.value;
        const preco = parseFloat(document.getElementById("preco").value);
        const token = getCookie("authToken");

        fetch(apiTamanhoProdutosURL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify([{ produto: produtoId, tamanho: tamanhoId, preco }]),
        })
            .then(() => {
                showMessage("Tamanho-produto salvo com sucesso!", true);
                fetchTamanhoProdutos();
            })
            .catch(() => showMessage("Erro ao salvar tamanho-produto!", false));
    });

    fetchProdutos()
        .then(() => {
            fetchTamanhos();
            fetchTamanhoProdutos();
        })
        .catch(error => console.error("Erro na inicialização:", error));
});
