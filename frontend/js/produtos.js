$(document).ready(function() {
    // URLs da API
    const apiURLProdutos = "http://127.0.0.1:8000/api/v1/produtos/";
    const apiURLCategoria = "http://127.0.0.1:8000/api/v1/categorias/";

    // Objeto para armazenar os nomes das categorias
    const categoriaNomes = {};
    let produtosPorCategoria = {};

    // Função para buscar o nome da categoria pelo ID
    function buscarNomeCategoria(id) {
        return $.ajax({
            url: `${apiURLCategoria}${id}/?format=json`,
            type: "GET",
            dataType: "json"
        });
    }

    // Função para carregar e renderizar os produtos
    function carregarProdutos() {
        $.ajax({
            url: apiURLProdutos,
            type: "GET",
            dataType: "json",
            success: function(produtos) {
                const categorias = {};

                // Promessa para carregar todos os nomes das categorias antes de renderizar
                const promessas = produtos.map(produto => {
                    const categoriaID = produto.categoria;

                    // Verifica se o nome da categoria já está armazenado
                    if (categoriaID && !categoriaNomes[categoriaID]) {
                        return buscarNomeCategoria(categoriaID).done(function(categoriaData) {
                            categoriaNomes[categoriaID] = categoriaData.nome;
                        }).fail(function() {
                            categoriaNomes[categoriaID] = "Categoria Desconhecida";
                        });
                    }
                });

                // Após todas as promessas estarem resolvidas, organiza e renderiza os produtos
                $.when(...promessas).done(function() {
                    // Organiza os produtos em categorias usando os nomes obtidos
                    produtos.forEach(produto => {
                        // Apenas produtos disponíveis
                        if (!produto.disponibilidade) return;

                        const categoriaNome = categoriaNomes[produto.categoria] || "Outros";
                        if (!categorias[categoriaNome]) {
                            categorias[categoriaNome] = [];
                        }
                        categorias[categoriaNome].push(produto);
                    });

                    produtosPorCategoria = categorias;
                    renderizarNavbar();
                    renderizarProdutos();
                });
            },
            error: function() {
                $("#lista-produtos").html("<p>Erro ao carregar produtos.</p>");
            }
        });
    }

    // Função para renderizar a navbar de categorias
    function renderizarNavbar() {
        const navbarHTML = `
            <div class="navbar-categorias">
                <button class="categoria-filtro" data-categoria="todos">Todos</button>
                ${Object.keys(produtosPorCategoria).map(categoria => `
                    <button class="categoria-filtro" data-categoria="${categoria}">${categoria}</button>
                `).join('')}
            </div>
        `;
        $("#navbar").html(navbarHTML);

        // Configura os eventos de clique para os botões da navbar
        $(".categoria-filtro").on("click", function() {
            const categoriaSelecionada = $(this).data("categoria");
            renderizarProdutos(categoriaSelecionada);
        });
    }

    // Função para renderizar os produtos com base na categoria selecionada
    function renderizarProdutos(categoriaSelecionada = "todos") {
        $("#lista-produtos").empty();

        const categorias = categoriaSelecionada === "todos" ? produtosPorCategoria : { [categoriaSelecionada]: produtosPorCategoria[categoriaSelecionada] };

        for (const [categoria, produtos] of Object.entries(categorias)) {
            const categoriaHTML = `
                <div class="produtos-categoria">
                    <h2>${categoria}</h2>
                    <div class="produtos-lista">
                        ${produtos.map(produto => `
                            <div class="produtos-item">
                                <div class="produtos-imagem">
                                    <img src="${produto.imagem_url}" alt="${produto.nome}">
                                </div>
                                <div class="produtos-detalhes">
                                    <h3>${produto.nome}</h3>
                                    <p><strong>Tamanhos disponíveis:</strong> ${produto.tamanhos || 'Único'}</p>
                                    <p><strong>Descrição do produto:</strong> ${produto.descricao || ''}</p>
                                </div>
                                <div class="divisor"></div>
                                <div class="produtos-preco">
                                    <p>A partir de</p>
                                    <p>R$ ${produto.preco ? produto.preco.toFixed(2) : 'Indisponível'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            $("#lista-produtos").append(categoriaHTML);
        }
    }

    // Carrega os produtos ao carregar a página
    carregarProdutos();
});
