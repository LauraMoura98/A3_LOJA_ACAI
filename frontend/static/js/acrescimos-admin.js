const BASE_URL = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/";

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

// Verifica se o usuário está autenticado
function authenticate() {
    const token = getCookie("authToken");
    return token !== null;
}

// Carrega os acréscimos da API
async function fetchAcrescimos() {
    if (!authenticate()) {
        return; // Retorna se não estiver autenticado
    }

    const token = getCookie("authToken");

    try {
        const response = await fetch(BASE_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error("Erro ao buscar acréscimos:", response.statusText);
            return; // Retorna se houver erro ao buscar
        }

        const acrescimos = await response.json();
        displayAcrescimos(acrescimos);
    } catch (error) {
        console.error("Erro ao buscar acréscimos:", error);
    }
}

// Exibe os acréscimos na lista
function displayAcrescimos(acrescimos) {
    const list = document.getElementById('acrescimos-list');
    list.innerHTML = '';

    if (acrescimos.length === 0) {
        list.innerHTML = '<li>Nenhum acréscimo encontrado.</li>';
    } else {
        acrescimos.forEach(acrescimo => {
            const item = document.createElement('li');
            item.textContent = `${acrescimo.nome} - R$ ${acrescimo.preco_adicional}`;
            item.setAttribute('data-id', acrescimo.id);

            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => editAcrescimo(acrescimo);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Deletar';
            deleteButton.onclick = () => deleteAcrescimo(acrescimo.id);

            item.appendChild(editButton);
            item.appendChild(deleteButton);
            list.appendChild(item);
        });
    }
}

// Adiciona um novo acréscimo ou edita um existente
async function addOrUpdateAcrescimo(event) {
    event.preventDefault();

    const token = getCookie("authToken");
    if (!token) {
        return; // Retorna se não estiver autenticado
    }

    const nome = document.getElementById('acrescimo-nome').value;
    const preco_adicional = document.getElementById('acrescimo-preco').value;
    const disponivel = document.getElementById('acrescimo-disponivel').checked;
    const id = document.getElementById('acrescimo-id').value; // Obtém o ID se estiver editando

    const acréscimoData = {
        nome,
        preco_adicional,
        disponivel,
    };

    try {
        let response;
        if (id) {
            // Se ID existe, atualiza um acréscimo existente
            response = await fetch(`${BASE_URL}${id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(acréscimoData),
            });
        } else {
            // Caso contrário, adiciona um novo acréscimo
            response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(acréscimoData),
            });
        }

        if (response.ok) {
            await fetchAcrescimos(); // Recarrega a lista de acréscimos
            resetForm(); // Limpa o formulário após adicionar ou editar
        } else {
            console.error("Erro ao adicionar ou editar o acréscimo:", response.statusText);
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Deleta um acréscimo existente
async function deleteAcrescimo(id) {
    const token = getCookie("authToken"); // Obtenha o token de autenticação

    try {
        const response = await fetch(`https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/${id}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json(); // Aguarde a resposta do servidor
        if (response.ok) {
            // Se a resposta for OK, independentemente da mensagem
            showMessage(productMessage, "Acréscimo deletado com sucesso", true);
        } else {
            // Se a resposta não for OK, exiba uma mensagem de erro
            showMessage(productMessage, "Erro ao deletar acréscimo", false);
        }
    } catch (error) {
        // Em caso de erro na requisição, exiba a mensagem de erro
        showMessage(productMessage, "Erro ao deletar acréscimo", false);
        console.error("Erro ao deletar o acréscimo:", error); // Log para depuração
    } finally {
        // Recarregue a página após a operação de exclusão
        location.reload();
    }
}


// Edita um acréscimo existente
function editAcrescimo(acrescimo) {
    console.log("Editando acréscimo:", acrescimo);
    const nomeInput = document.getElementById('acrescimo-nome');
    const precoInput = document.getElementById('acrescimo-preco');
    const disponivelInput = document.getElementById('acrescimo-disponivel');
    const idInput = document.getElementById('acrescimo-id');

    if (nomeInput && precoInput && disponivelInput && idInput) {
        nomeInput.value = acrescimo.nome;
        precoInput.value = acrescimo.preco_adicional;
        disponivelInput.checked = acrescimo.disponivel;
        idInput.value = acrescimo.id;

        const submitButton = document.getElementById('acrescimo-submit');
        submitButton.textContent = 'Editar Acréscimo';
        submitButton.onclick = addOrUpdateAcrescimo;
    } else {
        console.error("Um ou mais elementos não foram encontrados");
    }
}


// Limpa o formulário
function resetForm() {
    document.getElementById('acrescimo-nome').value = '';
    document.getElementById('acrescimo-preco').value = '';
    document.getElementById('acrescimo-disponivel').checked = false;
    document.getElementById('acrescimo-id').value = ''; // Limpa o ID

    const submitButton = document.getElementById('acrescimo-submit');
    submitButton.textContent = 'Adicionar Acréscimo'; // Restaura o texto do botão
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('acrescimo-form').addEventListener('submit', addOrUpdateAcrescimo);
    fetchAcrescimos(); // Carrega a lista de acréscimos na inicialização
});
