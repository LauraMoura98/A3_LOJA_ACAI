// Função para obter o token de autenticação
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Função para buscar pedidos da API
async function fetchPedidos() {
    const token = getCookie("authToken"); // Obtenha o token de autenticação

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
    const token = getCookie("authToken"); // Obtenha o token de autenticação

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
    const token = getCookie("authToken"); // Obtenha o token de autenticação

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

// Função para buscar tamanhos e tamanhos de produtos da API
async function fetchTamanhos() {
    const token = getCookie("authToken"); // Obtenha o token de autenticação

    const [tamanhosResponse, tamanhosProdutosResponse] = await Promise.all([
        fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanhos/', {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }),
        fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanho-produtos/', {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
    ]);

    if (!tamanhosResponse.ok || !tamanhosProdutosResponse.ok) {
        throw new Error('Erro ao buscar tamanhos ou tamanhos de produtos');
    }

    const tamanhos = await tamanhosResponse.json();
    const tamanhosProdutos = await tamanhosProdutosResponse.json();

    return { tamanhos, tamanhosProdutos };
}

// Função para atualizar o status do pedido
async function updatePedidoStatus(id, status) {
    const token = getCookie("authToken"); // Obtenha o token de autenticação

    const response = await fetch(`https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/${id}/`, {
        method: 'PATCH',
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
    const token = getCookie("authToken"); // Obtenha o token de autenticação

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
        const { tamanhos, tamanhosProdutos } = await fetchTamanhos();

        // Cria um mapa para acesso rápido a produtos, acréscimos e tamanhos por ID
        const produtosMap = produtos.reduce((map, produto) => {
            map[produto.id] = produto.nome;
            return map;
        }, {});

        const acrescimosMap = acrescimos.reduce((map, acrescimo) => {
            map[acrescimo.id] = acrescimo.nome;
            return map;
        }, {});

        const tamanhosMap = tamanhos.reduce((map, tamanho) => {
            map[tamanho.id] = { nome: tamanho.nome, descricao: tamanho.descricao };
            return map;
        }, {});

        const tamanhosProdutosMap = tamanhosProdutos.reduce((map, item) => {
            if (!map[item.produto]) {
                map[item.produto] = {};
            }
            map[item.produto][item.tamanho] = item;
            return map;
        }, {});

        const pedidosContainer = document.getElementById('pedidos-container');
        pedidosContainer.innerHTML = ''; // Limpa o container antes de adicionar novos pedidos

        for (const pedido of pedidos) {
            const pedidoElement = document.createElement('div');
            pedidoElement.classList.add('pedido');

            // Converte os IDs de produtos e acréscimos para os respectivos nomes e tamanhos
            const itensHtml = pedido.itens_pedido.map(item => {
                const nomeProduto = produtosMap[item.produto] || "Produto desconhecido";
                const tamanhoInfo = tamanhosMap[item.tamanho] || { nome: "Tamanho desconhecido", descricao: "" };
                const nomesAcrescimos = item.acrescimos.map(acrescimoId => acrescimosMap[acrescimoId] || "Acréscimo desconhecido");
                return `
                    <li>${nomeProduto} (${tamanhoInfo.nome} - ${tamanhoInfo.descricao}) ${nomesAcrescimos.length > 0 ? ` (Acréscimos: ${nomesAcrescimos.join(', ')})` : ''}</li>
                `;
            }).join('');

            // Adiciona detalhes do pedido
            pedidoElement.innerHTML = `
                <h2>Pedido #${pedido.id}</h2>
                <p>Status: <span>${pedido.status}</span></p>
                <p>Senha: ${pedido.senha}</p>
                <p>Data: ${new Date(pedido.data_criacao).toLocaleString()}</p>
                <p>Itens:</p>
                <ul>${itensHtml}</ul>
                <button class="excluir" data-id="${pedido.id}">Excluir</button>
                <button class="atualizar" data-id="${pedido.id}" data-status="EM_PREPARO">Preparando</button>
                <button class="atualizar" data-id="${pedido.id}" data-status="PRONTO">Concluído</button>
                <button class="atualizar" data-id="${pedido.id}" data-status="ENTREGUE">Entregue</button>
            `;

            pedidosContainer.appendChild(pedidoElement);

            // Adiciona eventos para os botões
            const excluirButton = pedidoElement.querySelector(`.excluir`);
            excluirButton.addEventListener('click', async () => {
                await deletePedido(pedido.id);
                renderPedidos(); // Recarrega os pedidos após a exclusão
            });

            const atualizarButtons = pedidoElement.querySelectorAll(`.atualizar`);
            atualizarButtons.forEach(button => {
                button.addEventListener('click', async () => {
                    const status = button.getAttribute('data-status');
                    await updatePedidoStatus(pedido.id, status);
                    renderPedidos(); // Recarrega os pedidos após a atualização do status
                });
            });
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar pedidos. Tente novamente mais tarde.');
    }
}

// Carregar pedidos ao iniciar a página
document.addEventListener('DOMContentLoaded', renderPedidos);
