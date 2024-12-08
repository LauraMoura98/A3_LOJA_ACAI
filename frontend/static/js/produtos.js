// Cache dos dados
let produtosCache = [];
let categoriasCache = [];
let acrescimosCache = [];
let tamanhosCache = [];
let tamanhoProdutosCache = [];

// URLs da API
const API_BASE = 'https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1';
const ENDPOINTS = {
    produtos: `${API_BASE}/produtos/`,
    categorias: `${API_BASE}/categorias/`,
    acrescimos: `${API_BASE}/acrescimos/`,
    tamanhos: `${API_BASE}/tamanhos/`,
    tamanhoProdutos: `${API_BASE}/tamanho-produtos/`
};

// Funções auxiliares
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

function renderizarNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const categoriasComProdutos = categoriasCache.filter(categoria =>
        produtosCache.some(produto => produto.categoria === categoria.nome)
    );

    const html = `
        <div class="navbar-categorias">
            <button class="categoria-filtro" data-categoria="todos">Todos</button>
            ${categoriasComProdutos.map(categoria => `
                <button class="categoria-filtro" data-categoria="${categoria.nome}">
                    ${categoria.nome}
                </button>
            `).join('')}
        </div>
    `;

    navbar.innerHTML = html;

    // Adicionar event listeners
    document.querySelectorAll('.categoria-filtro').forEach(button => {
        button.addEventListener('click', () => {
            const categoria = button.dataset.categoria;
            renderizarProdutos(categoria);
        });
    });
}

function renderizarProdutos(categoriaSelecionada = 'todos') {
    const container = document.getElementById('lista-produtos');
    if (!container) return;

    const produtosFiltrados = categoriaSelecionada === 'todos'
        ? produtosCache
        : produtosCache.filter(produto => produto.categoria === categoriaSelecionada);

    const html = produtosFiltrados.map(produto => {
        const tamanhoProduto = tamanhoProdutosCache.find(tp => tp.Produto === produto.id);
        
        // Obter o menor preço
        const menorPreco = tamanhoProduto
            ? Math.min(...Object.values(tamanhoProduto.Tamanhos))
            : null;

        return `
            <div class="produtos-item" data-produto-id="${produto.id}">
                <div class="produtos-imagem">
                    <img src="${produto.imagem_url}" alt="${produto.nome}">
                </div>
                <div class="produtos-detalhes">
                    <h3>${produto.nome}</h3>
                    <p><strong>Descrição:</strong> ${produto.descricao || ''}</p>
                </div>
                <div class="divisor"></div>
                <div class="preco-menor">
                    ${menorPreco !== null ? `Menor preço: <strong>R$ ${menorPreco.toFixed(2)}</strong>` : 'Preço indisponível'}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Adicionar event listeners para os produtos
    document.querySelectorAll('.produtos-item').forEach(item => {
        item.addEventListener('click', () => {
            const produtoId = parseInt(item.dataset.produtoId);
            const produto = produtosCache.find(p => p.id === produtoId);
            if (produto) mostrarModalSelecao(produto);
        });
    });
}


function mostrarModalSelecao(produto) {
    const tamanhoProduto = tamanhoProdutosCache.find(tp => tp.Produto === produto.id);

    // Criar o modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const tamanhosHTML = tamanhoProduto
        ? Object.entries(tamanhoProduto.Tamanhos).map(([nome, preco]) => {
            const tamanho = tamanhosCache.find(t => t.nome === nome); // Localiza a descrição pelo nome do tamanho
            return tamanho
                ? `
                    <div class="opcao-tamanho">
                        <input type="radio" name="tamanho" value="${nome}" id="tamanho-${nome}">
                        <label for="tamanho-${nome}">
                            ${tamanho.descricao} - R$ ${preco.toFixed(2).replace('.', ',')}
                        </label>
                    </div>
                `
                : '';
        }).join('')
        : '<p>Nenhum tamanho disponível</p>';

    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${produto.nome}</h2>
                <button class="fechar-modal">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${produto.imagem_url}" alt="${produto.nome}" style="max-width: 200px;">
                <p>${produto.descricao}</p>

                <div class="secao-tamanhos">
                    <h3>Escolha o tamanho:</h3>
                    <div class="opcoes-tamanhos">
                        ${tamanhosHTML}
                    </div>
                </div>

                <div class="secao-acrescimos">
                    <h3>Acréscimos disponíveis:</h3>
                    <div class="opcoes-acrescimos">
                        ${(produto.acrescimos || []).map(acrescimoNome => {
                            const acrescimo = acrescimosCache.find(a => a.nome === acrescimoNome);
                            return acrescimo ? `
                                <div class="opcao-acrescimo">
                                    <input type="checkbox" name="acrescimo" value="${acrescimo.id}" id="acrescimo-${acrescimo.id}">
                                    <label for="acrescimo-${acrescimo.id}">
                                        ${acrescimo.nome} (+R$ ${acrescimo.preco_adicional.replace('.', ',')})
                                    </label>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                </div>

                <button class="adicionar-carrinho">Adicionar ao Carrinho</button>
            </div>
        </div>
    `;

    modalOverlay.innerHTML = modalHTML;
    document.body.appendChild(modalOverlay);

    // Adicionar event listeners do modal
    modalOverlay.querySelector('.fechar-modal').addEventListener('click', () => {
        modalOverlay.remove();
    });

    modalOverlay.querySelector('.adicionar-carrinho').addEventListener('click', () => {
        const tamanhoSelecionado = modalOverlay.querySelector('input[name="tamanho"]:checked')?.value;
        const acrescimosSelecionados = Array.from(
            modalOverlay.querySelectorAll('input[name="acrescimo"]:checked')
        ).map(input => input.value);
    
        if (!tamanhoSelecionado) {
            alert('Por favor, selecione um tamanho.');
            return;
        }
    
        // Adicionar ao carrinho (cookie)
        adicionarAoCarrinho(produto.id, tamanhoSelecionado, acrescimosSelecionados);
        
        modalOverlay.remove();
        alert('Produto adicionado ao carrinho!');
    });
    
}



// Função principal para inicializar
async function inicializarAplicacao() {
    try {
        // Buscar todos os dados necessários
        const [produtos, categorias, acrescimos, tamanhos, tamanhoProdutos] = await Promise.all([
            fetchData(ENDPOINTS.produtos),
            fetchData(ENDPOINTS.categorias),
            fetchData(ENDPOINTS.acrescimos),
            fetchData(ENDPOINTS.tamanhos),
            fetchData(ENDPOINTS.tamanhoProdutos)
        ]);

        // Atualizar o cache
        produtosCache = produtos;
        categoriasCache = categorias;
        acrescimosCache = acrescimos;
        tamanhosCache = tamanhos;
        tamanhoProdutosCache = tamanhoProdutos;

        // Renderizar a interface
        renderizarNavbar();
        renderizarProdutos();
    } catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
        document.getElementById('navbar').innerHTML = '<p>Erro ao carregar dados do servidor.</p>';
    }
}

// Função para definir um cookie
function setCookie(nome, valor, dias) {
    const dataExpiracao = new Date();
    dataExpiracao.setTime(dataExpiracao.getTime() + (dias * 24 * 60 * 60 * 1000)); // Expiração em dias
    const valorCodificado = encodeURIComponent(valor);
    document.cookie = `${nome}=${valorCodificado};expires=${dataExpiracao.toUTCString()};path=/`;
}

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

// Função para adicionar um pedido ao cookie
function adicionarAoCarrinho(produtoId, tamanhoProduto, acrescimos) {
    // Recuperar o cookie existente, ou criar um novo se não existir
    const pedidos = JSON.parse(getCookie('pedidos') || '[]');

    // Adicionar novo pedido
    pedidos.push({ id_produto: produtoId, tamanho_produto: tamanhoProduto, acrescimos });

    // Atualizar o cookie com a nova lista de pedidos
    setCookie('pedidos', JSON.stringify(pedidos), 7); // Expira em 7 dias
}


// Iniciar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarAplicacao);