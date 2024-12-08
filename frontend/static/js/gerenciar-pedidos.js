// Função para obter o token de autenticação
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Função para buscar pedidos da API
async function fetchPedidos() {
    const token = getCookie("conta-token"); // Obtenha o token de autenticação

    const response = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/', {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
    }
    return await response.json();
}

// Função para buscar produtos da API
async function fetchProdutos() {
    const token = getCookie("conta-token"); // Obtenha o token de autenticação

    const response = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/', {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
    }
    return await response.json();
}

// Função para buscar acréscimos da API
async function fetchAcrescimos() {
    const token = getCookie("conta-token"); // Obtenha o token de autenticação

    const response = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/', {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar acréscimos');
    }
    return await response.json();
}

// Função para atualizar o status do pedido
async function updatePedidoStatus(id, status) {
    const token = getCookie("conta-token"); // Obtenha o token de autenticação

    const response = await fetch(`https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/${id}/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        alert('Erro ao atualizar o pedido.');
    }
}

// Função para excluir o pedido
async function deletePedido(id) {
    const token = getCookie("conta-token"); // Obtenha o token de autenticação

    const response = await fetch(`https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/${id}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        alert('Erro ao excluir o pedido.');
    }
}

// Função para renderizar os pedidos na página
async function renderPedidos() {
    try {
        const pedidos = await fetchPedidos();
        const produtos = await fetchProdutos();
        const acrescimos = await fetchAcrescimos();
        
        const pedidosContainer = document.getElementById('pedidos-container');
        pedidosContainer.innerHTML = ''; // Limpa o container antes de adicionar novos pedidos

        for (const pedido of pedidos) {
            const pedidoElement = document.createElement('div');
            pedidoElement.classList.add('pedido');

            // Adiciona detalhes do pedido
            pedidoElement.innerHTML = `
                <h2>Pedido #${pedido.id}</h2>
                <p>Status: <span>${pedido.status}</span></p>
                <p>Data: ${new Date(pedido.data_criacao).toLocaleString()}</p>
                <p>Itens:</p>
                <ul>
                    ${pedido.itens_pedido.map(item => `
                        <li>${item.produto} - ${item.tamanho} ${item.acrescimos.length > 0 ? ` (Acréscimos: ${item.acrescimos.join(', ')})` : ''}</li>
                    `).join('')}
                </ul>
                <button class="excluir" data-id="${pedido.id}">Excluir</button>
                <button class="atualizar" data-id="${pedido.id}" data-status="PREPARANDO">Preparar</button>
                <button class="atualizar" data-id="${pedido.id}" data-status="CONCLUIDO">Concluir</button>
                <button class="atualizar" data-id="${pedido.id}" data-status="ENTREGUE">Entregar</button>
            `;

            pedidosContainer.appendChild(pedidoElement);
        }

        // Adiciona eventos para os botões
        pedidos.forEach(pedido => {
            const excluirButton = pedidoElement.querySelector(`.excluir[data-id="${pedido.id}"]`);
            excluirButton.addEventListener('click', async () => {
                await deletePedido(pedido.id);
                renderPedidos(); // Recarrega os pedidos após a exclusão
            });

            const atualizarButtons = pedidoElement.querySelectorAll(`.atualizar[data-id="${pedido.id}"]`);
            atualizarButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const status = button.getAttribute('data-status');
                    await updatePedidoStatus(pedido.id, status);
                    renderPedidos(); // Recarrega os pedidos após a atualização do status
                });
            });
        });
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar pedidos. Tente novamente mais tarde.');
    }
}

// Carregar pedidos ao iniciar a página
document.addEventListener('DOMContentLoaded', renderPedidos);
