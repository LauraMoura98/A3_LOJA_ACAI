document.addEventListener("DOMContentLoaded", function () {
    const apiProductURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/";
    const apiCategoryURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/categorias/";
    const apiAcrescimosURL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/";


    const loadItemsButton = document.getElementById("load-items");
    const itemTypeSelect = document.getElementById("item-type");
    const itemList = document.getElementById("item-list");
    const editForm = document.getElementById("edit-form");
    const editItemForm = document.getElementById("edit-item-form");
    const editMessage = document.getElementById("edit-message");
    const deleteButton = document.getElementById("delete-button");
    const deleteCheckbox = document.getElementById("delete-checkbox");
    const acrescimosList = document.getElementById("edit-acrescimos"); // Lista de checkboxes para acréscimos

    let currentItemType = "";
    let acrescimosData = []; // Armazena os dados dos acréscimos

    editItemForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const editMessage = document.getElementById("edit-message"); // Obtém o elemento da mensagem

        const itemId = itemList.querySelector("li.selected")?.dataset.id;
        if (!itemId) {
            alert("Selecione um item para editar.");
            return;
        }


        showMessage(editMessage, "Salvando alterações...", true); // Mensagem inicial


        const apiUrl = currentItemType === "produtos" ? `${apiProductURL}${itemId}/` : `${apiCategoryURL}${itemId}/`;

        let updatedItem = {}; // Inicializa updatedItem como objeto vazio

        if (currentItemType === "produtos") {
            const selectedAcrescimos = Array.from(acrescimosList.querySelectorAll("input[type=checkbox]:checked")).map(checkbox => checkbox.value);

            updatedItem = {
                nome: document.getElementById("edit-nome").value,
                descricao: document.getElementById("edit-descricao").value,
                imagem_url: document.getElementById("edit-imagem_url").value,
                disponibilidade: document.getElementById("edit-disponibilidade").checked,
                categoria: document.getElementById("edit-categoria").value,
                acrescimos: selectedAcrescimos
            };
        } else if (currentItemType === "categorias") {
            updatedItem = {
                nome: document.getElementById("edit-nome").value,
                descricao: document.getElementById("edit-descricao").value
            };
        }

        const token = getCookie("authToken");
        if (!token) return;

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItem),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                showMessage(editMessage, `${currentItemType === "categorias" ? "Categoria" : "Produto"} atualizado com sucesso!`, true);
                // Recarrega a página após o sucesso
                location.reload();

            })
            .catch(error => {
                console.error('Error updating item:', error);
                showMessage(editMessage, `Erro ao atualizar item: ${error.message}`, false); // Mensagem de erro detalhada
            });
    });

    function showMessage(element, messageText, isSuccess) {
        element.textContent = messageText;
        element.className = `response-message ${isSuccess ? "success" : "error"}`;
        element.style.display = "block";
    }

    function loadCategories() {
        fetchData(apiCategoryURL, categories => {
            const categorySelect = document.getElementById("edit-categoria");
            categorySelect.innerHTML = "";
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.nome;
                option.textContent = category.nome;
                categorySelect.appendChild(option);
            });
        });
    }

    function loadAcrescimos() {
        fetchData(apiAcrescimosURL, acrescimos => {
            acrescimosData = acrescimos; // Armazena os dados dos acréscimos
            acrescimosList.innerHTML = ""; // Limpa a lista antes de adicionar novos itens

            acrescimos.forEach(acrescimo => {
                const li = document.createElement("li");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = acrescimo.nome; // Use o nome como valor
                checkbox.id = `acrescimo-${acrescimo.id}`; // Adiciona um ID único

                const label = document.createElement("label");
                label.htmlFor = `acrescimo-${acrescimo.id}`;
                label.textContent = `${acrescimo.nome} (+R$${acrescimo.preco_adicional})`;

                li.appendChild(checkbox);
                li.appendChild(label);
                acrescimosList.appendChild(li);
            });
        });
    }


    function fetchData(url, callback) {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => {
                console.error('Fetch error:', error);
                showMessage(editMessage, "Erro ao carregar dados.", false);
            });
    }

    function renderItems(items) {
        itemList.innerHTML = "";
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.nome} - ${item.descricao}`;
            li.dataset.id = item.id;
            li.addEventListener("click", () => {
                itemList.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
                li.classList.add("selected");
                loadItemToEdit(item);
            });
            itemList.appendChild(li);
        });
    }

    function loadItemToEdit(item) {
        document.getElementById("edit-nome").value = item.nome;
        document.getElementById("edit-descricao").value = item.descricao;

        const productFields = document.querySelectorAll("#product-fields > *");

        if (currentItemType === "produtos") {
            document.getElementById("edit-imagem_url").value = item.imagem_url;
            document.getElementById("edit-disponibilidade").checked = item.disponibilidade;
            document.getElementById("edit-categoria").value = item.categoria;
            productFields.forEach(field => field.style.display = "block");

            // Marca os checkboxes de acréscimos de acordo com o item carregado
            acrescimosList.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
                checkbox.checked = item.acrescimos.includes(checkbox.value);
            });


        } else if (currentItemType === "categorias") {
            productFields.forEach(field => {
                if (!["edit-nome", "edit-descricao"].includes(field.id)) {
                    field.style.display = "none";
                }
            });
            // Esconde a lista de acréscimos quando estiver editando uma categoria
            acrescimosList.style.display = "none";
        } else { // Mostra a lista de acréscimos quando estiver editando um produto
            acrescimosList.style.display = "block";
        }


        editForm.style.display = "block";
        editMessage.textContent = "";
    }




    loadItemsButton.addEventListener("click", function () {
        currentItemType = itemTypeSelect.value;
        const apiUrl = currentItemType === "produtos" ? apiProductURL : apiCategoryURL;
        fetchData(apiUrl, renderItems);

        // Se for produto, carrega os acréscimos
        if (currentItemType === "produtos") {
            loadAcrescimos();
        }



        itemList.parentElement.style.display = "block";
    });


    editItemForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const itemId = itemList.querySelector("li.selected")?.dataset.id;
        if (!itemId) {
            alert("Selecione um item para editar.");
            return;
        }

        const apiUrl = currentItemType === "produtos" ? `${apiProductURL}${itemId}/` : `${apiCategoryURL}${itemId}/`;

        let updatedItem;

        if (currentItemType === "produtos") {
            // Obtém os acréscimos selecionados
            const selectedAcrescimos = Array.from(acrescimosList.querySelectorAll("input[type=checkbox]:checked")).map(checkbox => checkbox.value);


            updatedItem = {
                nome: document.getElementById("edit-nome").value,
                descricao: document.getElementById("edit-descricao").value,
                imagem_url: document.getElementById("edit-imagem_url").value,
                disponibilidade: document.getElementById("edit-disponibilidade").checked,
                categoria: document.getElementById("edit-categoria").value,
                acrescimos: selectedAcrescimos // Adiciona os acréscimos selecionados
            };
        } else if (currentItemType === "categorias") {
            updatedItem = {
                nome: document.getElementById("edit-nome").value,
                descricao: document.getElementById("edit-descricao").value
            };
        }

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItem),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                showMessage(editMessage, `${currentItemType === "categorias" ? "Categoria" : "Produto"} atualizado com sucesso!`, true);
                fetchData(currentItemType === "produtos" ? apiProductURL : apiCategoryURL, renderItems);
                clearEditForm();
            })
            .catch(error => {
                console.error('Error updating item:', error);
                showMessage(editMessage, `Erro ao atualizar item: ${error.message}`, false);
            });
    });



    deleteButton.addEventListener("click", function () {
        // ... (código para exclusão permanece o mesmo)
    });


    function showMessage(element, messageText, isSuccess) { 
        element.textContent = messageText;
        element.className = `response-message ${isSuccess ? "success" : "error"}`;
        element.style.display = "block";
     }

    function clearEditForm() {
         // ... (código sem alterações)
        acrescimosList.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
            checkbox.checked = false;
        });
    }


    loadCategories();

});