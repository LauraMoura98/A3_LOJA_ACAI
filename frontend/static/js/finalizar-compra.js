// Função para recuperar cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
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
function mapItemsToIDs(pedidos, produtos, tamanhos, acrescimos) {
    return pedidos.map(item => {
        const produtoID = produtos.find(prod => prod.id === item.id_produto)?.id; // Obtém o ID do produto
        const tamanhoID = tamanhos.find(tam => tam.nome === item.tamanho_produto)?.id; // Obtém o ID do tamanho
        
        // Obtém os IDs dos acréscimos, filtrando nulos
        const acrescimosIDs = item.acrescimos
            .map(ac => acrescimos.find(acr => acr.id === ac)?.id) // Tenta encontrar o ID do acréscimo
            .filter(acID => acID !== undefined); // Filtra IDs undefined (ou seja, não encontrados)

        return {
            produto: produtoID,
            tamanho: tamanhoID,
            acrescimos: acrescimosIDs.length > 0 ? acrescimosIDs : [] // Se não houver acréscimos, retorna um array vazio
        };
    });
}

// Verificar se o token está salvo e habilitar o botão de finalizar compra
document.addEventListener('DOMContentLoaded', async function() {
    const token = getCookie('conta-token');
    const finalizarButton = document.querySelector('.finalizar-compra');

    if (!finalizarButton) {
        console.error("Botão de finalizar compra não encontrado.");
        return; // Interrompe a execução se o botão não for encontrado
    }

    let produtos, tamanhos, acrescimos;

    try {
        // Buscar dados das APIs ao carregar a página
        const apiData = await fetchAPIs();
        produtos = apiData.produtos;
        tamanhos = apiData.tamanhos;
        acrescimos = apiData.acrescimos;
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados necessários. Tente novamente mais tarde.');
        return; // Interrompe a execução se houver erro ao buscar os dados
    }

    if (token) {
        finalizarButton.addEventListener('click', async function(e) {
            e.preventDefault(); // Impede o comportamento padrão do botão

            const pedidosCookie = getCookie('pedidos');
            const pedidos = JSON.parse(decodeURIComponent(pedidosCookie)); // decodifica o cookie
            const itensPedido = mapItemsToIDs(pedidos, produtos, tamanhos, acrescimos);

            const payload = {
                status: "PENDENTE",
                itens_pedido: itensPedido.filter(item => item.produto && item.tamanho) // Filtra itens com produto e tamanho
            };

            try {
                // Envio da requisição POST para a API
                const response = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/pedidos/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert('Pedido finalizado com sucesso!');
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
        finalizarButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert("Faça o Login antes de tentar finalizar a compra");
        });
    }
});
