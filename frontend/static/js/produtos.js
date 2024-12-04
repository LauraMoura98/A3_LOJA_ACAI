$(document).ready(function () {
    // URLs da API
    const apiURLProdutos = "https://kong-c60ea9bb47us5w2cp.kongcloud.dev/";
    const apiURLCategoria = "http://168.75.72.27/api/v1/categorias/";

    // Função para buscar categorias e comparar com produtos
    function buscarProdutosPorCategoria() {
        let produtosCache;
        let categoriaSelecionada;

        // Primeiro, busca os produtos
        $.ajax({
            url: apiURLProdutos,
            type: "GET",
            dataType: "json",
            success: function (produtos) {
                produtosCache = produtos;

                // Busca todas as categorias
                $.ajax({
                    url: apiURLCategoria,
                    type: "GET",
                    dataType: "json",
                    success: function (categorias) {
                        // Filtra categorias correspondentes aos produtos
                        produtosCache.forEach(produto => {
                            const categoria = categorias.find(c => c.nome === produto.categoria);
                            if (categoria) {
                                produto.categoria_id = categoria.id;
                                categoriaSelecionada = categoria.id;
                            }
                        });

                        // Após encontrar a categoria, busca os produtos dessa categoria
                        if (categoriaSelecionada) {
                            buscarProdutosComCategoria(categoriaSelecionada);
                        }
                    },
                    error: function () {
                        console.error("Erro ao buscar categorias.");
                    }
                });
            },
            error: function () {
                console.error("Erro ao buscar produtos.");
            }
        });
    }

    // Função para buscar produtos específicos por categoria
    function buscarProdutosComCategoria(categoriaId) {
        $.ajax({
            url: `${apiURLProdutos}?categoria=${categoriaId}`,
            type: "GET",
            dataType: "json",
            success: function (produtos) {
                renderizarProdutos(produtos);
            },
            error: function () {
                console.error("Erro ao buscar produtos por categoria.");
            }
        });
    }

    // Função para renderizar os produtos na página
    function renderizarProdutos(produtos) {
        const $container = $("#lista-produtos");
        $container.empty();

        produtos.forEach(produto => {
            const produtoHTML = `
                <div class="produtos-item">
                    <div class="produtos-imagem">
                        <img src="${produto.imagem_url}" alt="${produto.nome}">
                    </div>
                    <div class="produtos-detalhes">
                        <h3>${produto.nome}</h3>
                        <p><strong>Tamanhos disponíveis:</strong> ${produto.tamanhos || "Único"}</p>
                        <p><strong>Descrição do produto:</strong> ${produto.descricao || ""}</p>
                    </div>
                    <div class="divisor"></div>
                    <div class="produtos-preco">
                        <p>A partir de</p>
                        <p>R$ ${produto.preco ? produto.preco.toFixed(2) : "Indisponível"}</p>
                    </div>
                </div>
            `;
            $container.append(produtoHTML);
        });
    }

    // Chama a função inicial ao carregar a página
    buscarProdutosPorCategoria();
});
