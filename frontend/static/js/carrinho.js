// Função para obter um cookie
function getCookie(nome) {
    const nomeIgual = `${nome}=`;
    const partes = document.cookie.split(';');
    for (let i = 0; i < partes.length; i++) {
        let parte = partes[i].trim();
        if (parte.indexOf(nomeIgual) === 0) {
            return decodeURIComponent(parte.substring(nomeIgual.length, parte.length));
        }
    }
    return "";
}

// Função para definir um cookie
function setCookie(nome, valor, dias) {
    const dataExpiracao = new Date();
    dataExpiracao.setTime(dataExpiracao.getTime() + (dias * 24 * 60 * 60 * 1000));
    const valorCodificado = encodeURIComponent(valor);
    document.cookie = `${nome}=${valorCodificado};expires=${dataExpiracao.toUTCString()};path=/`;
}

// Função para remover um pedido pelo índice
function removerPedido(pedidoIndex) {
    const pedidos = JSON.parse(getCookie('pedidos') || '[]');
    pedidos.splice(pedidoIndex, 1);
    setCookie('pedidos', JSON.stringify(pedidos), 7);
}

// Função para buscar dados da API
async function buscarDados() {
    try {
        const produtosResponse = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/');
        const tamanhosResponse = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanhos/');
        const acrescimosResponse = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/');
        const tamanhoProdutosResponse = await fetch('https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanho-produtos/');

        const produtos = await produtosResponse.json();
        const tamanhos = await tamanhosResponse.json();
        const acrescimos = await acrescimosResponse.json();
        const tamanhoProdutos = await tamanhoProdutosResponse.json();

        return { produtos, tamanhos, acrescimos, tamanhoProdutos };
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
    }
}

// Função para renderizar os pedidos
async function renderizarPedidos() {
    const pedidosContainer = document.getElementById('lista-pedidos');
    const pedidos = JSON.parse(getCookie('pedidos') || '[]');

    if (pedidos.length === 0) {
        pedidosContainer.innerHTML = '<p>Nenhum pedido encontrado.</p>';
        return;
    }

    // Busca os dados da API
    const { produtos, tamanhos, acrescimos, tamanhoProdutos } = await buscarDados();

    let totalPedido = 0;

    const html = pedidos.map((pedido, index) => {
        // Encontrar o produto correspondente
        const produto = produtos.find(p => p.id === pedido.id_produto);
        // Encontrar o tamanho correspondente
        const tamanho = tamanhos.find(t => t.nome === pedido.tamanho_produto);

        // Encontra o preço do tamanho correspondente ao produto
        const tamanhoInfo = tamanhoProdutos.find(tp => tp.Produto === pedido.id_produto);
        const precoTamanho = tamanhoInfo ? tamanhoInfo.Tamanhos[pedido.tamanho_produto] : 0;

        // Detalhes dos acréscimos
        const detalhesAcrecimos = pedido.acrescimos.map(ac => {
            const acrescimo = acrescimos.find(a => a.id === parseInt(ac));
            return {
                nome: acrescimo ? acrescimo.nome : 'Desconhecido',
                preco: acrescimo ? parseFloat(acrescimo.preco_adicional) : 0
            };
        });

        // Calcular o preço total do produto
        const precoAcrscimos = detalhesAcrecimos.reduce((total, ac) => total + ac.preco, 0);
        const precoTotalProduto = (parseFloat(precoTamanho) || 0) + precoAcrscimos;

        // Atualizar o preço total do pedido
        totalPedido += precoTotalProduto;

        return `
            <div class="pedido-item">
                <div class="produto">
                    <p><strong>Produto:</strong> ${produto ? produto.nome : 'Desconhecido'}</p>
                    <p><strong>Tamanho:</strong> ${tamanho ? `${tamanho.descricao} - R$ ${parseFloat(precoTamanho).toFixed(2).replace('.', ',')}` : 'Desconhecido'}</p>
                    <p><strong>Acréscimos:</strong> ${detalhesAcrecimos.length > 0 ? detalhesAcrecimos.map(ac => `${ac.nome} - R$ ${ac.preco.toFixed(2).replace('.', ',')}`).join(', ') : 'Nenhum'}</p>
                    <p><strong>Preço total do produto:</strong> R$ ${precoTotalProduto.toFixed(2).replace('.', ',')}</p>
                    <button class="remover-pedido" data-index="${index}">Remover</button>
                </div>
            </div>
        `;
    }).join('');

    // Adicionar o preço total do pedido
    const totalHtml = `
        <div class="pedido-total">
            <p><strong>Preço total do pedido:</strong> R$ ${totalPedido.toFixed(2).replace('.', ',')}</p>
        </div>
    `;

    pedidosContainer.innerHTML = html + totalHtml;

    // Adicionar event listeners para os botões de remover
    document.querySelectorAll('.remover-pedido').forEach(botao => {
        botao.addEventListener('click', () => {
            const index = botao.dataset.index;
            removerPedido(index);
            renderizarPedidos(); // Atualiza a lista após a remoção
        });
    });
}

// Inicializa a renderização dos pedidos quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    renderizarPedidos();
});
