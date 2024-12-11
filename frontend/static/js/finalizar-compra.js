// Função para recuperar cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Função para criar ou apagar um cookie
function setCookie(name, value, days) {
    if (value === null) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } else {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/;`;
    }
}

// Função para buscar produtos, tamanhos e acréscimos da API
async function fetchAPIs() {
    const [produtosResponse, tamanhosResponse, acrescimosResponse] = await Promise.all([
        fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/'),
        fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanhos/'),
        fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/')
    ]);

    if (!produtosResponse.ok || !tamanhosResponse.ok || !acrescimosResponse.ok) {
        throw new Error('Erro ao buscar dados das APIs');
    }

    const produtos = await produtosResponse.json();
    const tamanhos = await tamanhosResponse.json();
    const acrescimos = await acrescimosResponse.json();

    return { produtos, tamanhos, acrescimos };
}

// Função para mapear os itens do cookie para os IDs da API
function mapItemsToIDs(pedidos, produtos, tamanhos) {
    return pedidos.map(item => {
        const produtoID = produtos.find(prod => prod.id === item.id_produto)?.id;
        const tamanhoID = tamanhos.find(tam => tam.nome === item.tamanho_produto)?.id;
        const acrescimosIDs = item.acrescimos.map(ac => parseInt(ac, 10));

        return {
            produto: produtoID,
            tamanho: tamanhoID,
            acrescimos: acrescimosIDs
        };
    });
}

// Função para verificar o status do pedido
async function verificarStatusPedido(id) {
    try {
        const response = await fetch(`https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/`);
        if (!response.ok) throw new Error('Erro ao buscar status do pedido.');

        const pedidos = await response.json();
        const pedido = pedidos.find(p => p.id === id);

        if (pedido) {
            alert(`Status do pedido #${pedido.id}: ${pedido.status}`);
        } else {
            alert('Pedido não encontrado. Limpando informações salvas.');
            setCookie('comprado', null); // Apaga o cookie se o pedido não for encontrado
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao verificar status do pedido.');
    }
}

// Verificar se o token está salvo e habilitar o botão de finalizar compra
document.addEventListener('DOMContentLoaded', async function () {
    const token = getCookie('conta-token');
    const finalizarButton = document.querySelector('.finalizar-compra');

    if (!finalizarButton) {
        console.error("Botão de finalizar compra não encontrado.");
        return;
    }

    let produtos, tamanhos, acrescimos;

    try {
        const apiData = await fetchAPIs();
        produtos = apiData.produtos;
        tamanhos = apiData.tamanhos;
        acrescimos = apiData.acrescimos;
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados necessários. Tente novamente mais tarde.');
        return;
    }

    if (token) {
        finalizarButton.addEventListener('click', async function (e) {
            e.preventDefault();

            const pedidosCookie = getCookie('pedidos');
            const pedidos = JSON.parse(decodeURIComponent(pedidosCookie));
            const itensPedido = mapItemsToIDs(pedidos, produtos, tamanhos);

            const payload = {
                status: "PENDENTE",
                itens_pedido: itensPedido.filter(item => item.produto && item.tamanho)
            };

            try {
                const response = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const pedido = await response.json();

                    // Salva o ID e a senha no cookie "comprado"
                    setCookie('pedidos', null); // Apaga o cookie dos pedidos
                    setCookie('comprado', JSON.stringify({ id: pedido.id, senha: pedido.senha }), 7);

                    // Exibe mensagem com ID e senha
                    alert(`Pedido #${pedido.id} finalizado com sucesso! Aqui está a senha para retirar o seu pedido: ${pedido.senha}. Por favor, tire um print da tela`);

                    // Verificar status do pedido após finalização
                    verificarStatusPedido(pedido.id);
                } else {
                    const errorData = await response.json();
                    console.error(errorData);
                    alert('Erro ao finalizar o pedido. Verifique os dados e tente novamente.');
                }
            } catch (error) {
                console.error(error);
                alert('Erro ao processar a compra. Verifique sua conexão e tente novamente.');
            }
        });
    } else {
        finalizarButton.addEventListener('click', function (e) {
            e.preventDefault();
            alert("Faça o Login antes de tentar finalizar a compra");
        });
    }
});
