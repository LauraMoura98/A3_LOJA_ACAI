$(document).ready(function () {
    // URLs da API
    const apiURLProdutos = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/produtos/";
    const apiURLCategoria = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/categorias/";
    const apiURLAcrescimos = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/acrescimos/";
    const apiURLTamanhos = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanhos/";
    const apiURLTamanhoProdutos = "https://kong-6266dc6838uss9iu0.kongcloud.dev/api/v1/tamanho-produtos/";

    let produtosCache = [];
    let categoriasCache = [];
    let acrescimosCache = [];
    let tamanhosCache = [];
    let tamanhoProdutosCache = []; // Cache para armazenar os tamanhos e seus preços

    // Função para buscar e renderizar categorias e produtos
    function buscarProdutosECategorias() {
        // Busca categorias
        $.ajax({
            url: apiURLCategoria,
            type: "GET",
            dataType: "json",
            success: function (categorias) {
                categoriasCache = categorias;

                // Após buscar categorias, busca produtos
                $.ajax({
                    url: apiURLProdutos,
                    type: "GET",
                    dataType: "json",
                    success: function (produtos) {
                        produtosCache = produtos;

                        // Busca acréscimos
                        $.ajax({
                            url: apiURLAcrescimos,
                            type: "GET",
                            dataType: "json",
                            success: function (acrescimos) {
                                acrescimosCache = acrescimos;

                                // Busca tamanhos
                                $.ajax({
                                    url: apiURLTamanhos,
                                    type: "GET",
                                    dataType: "json",
                                    success: function (tamanhos) {
                                        tamanhosCache = tamanhos;

                                        // Busca tamanhos de produtos
                                        $.ajax({
                                            url: apiURLTamanhoProdutos,
                                            type: "GET",
                                            dataType: "json",
                                            success: function (tamanhoProdutos) {
                                                tamanhoProdutosCache = tamanhoProdutos;
                                                renderizarNavbar();
                                                renderizarProdutos();
                                            },
                                            error: function () {
                                                console.error("Erro ao buscar tamanhos de produtos.");
                                            }
                                        });
                                    },
                                    error: function () {
                                        console.error("Erro ao buscar tamanhos.");
                                    }
                                });
                            },
                            error: function () {
                                console.error("Erro ao buscar acréscimos.");
                            }
                        });
                    },
                    error: function () {
                        console.error("Erro ao buscar produtos.");
                        $("#lista-produtos").html("<p>Erro ao carregar produtos.</p>");
                    }
                });
            },
            error: function () {
                console.error("Erro ao buscar categorias.");
                $("#navbar").html("<p>Erro ao carregar, servidor offline.</p>");
            }
        });
    }

    // Função para renderizar a navbar de categorias
    function renderizarNavbar() {
        const categoriasComProdutos = categoriasCache.filter(categoria =>
            produtosCache.some(produto => produto.categoria === categoria.nome)
        );

        if (categoriasComProdutos.length === 0) {
            $("#navbar").html("<p>Nenhuma categoria disponível.</p>");
            return;
        }

        const navbarHTML = `
            <div class="navbar-categorias">
                <button class="categoria-filtro" data-categoria="todos">Todos</button>
                ${categoriasComProdutos
                    .map(categoria => `
                    <button class="categoria-filtro" data-categoria="${categoria.nome}">${categoria.nome}</button>
                `).join("")}
            </div>
        `;
        $("#navbar").html(navbarHTML);

        // Configura os eventos de clique para os botões da navbar
        $(".categoria-filtro").on("click", function () {
            const categoriaSelecionada = $(this).data("categoria");
            renderizarProdutos(categoriaSelecionada);
        });
    }

// Função para renderizar os produtos com base na categoria selecionada
function renderizarProdutos(categoriaSelecionada = "todos") {
    const $container = $("#lista-produtos");
    $container.empty();

    const produtosFiltrados =
        categoriaSelecionada === "todos"
            ? produtosCache
            : produtosCache.filter(produto => produto.categoria === categoriaSelecionada);

    if (produtosFiltrados.length === 0) {
        $container.html("<p>Nenhum produto encontrado nesta categoria.</p>");
        return;
    }

    produtosFiltrados.forEach(produto => {
        // Encontrar o menor preço entre os tamanhos disponíveis para o produto
        const tamanhoProduto = tamanhoProdutosCache.find(tp => tp.Produto === produto.id);
        const precosTamanhos = tamanhoProduto ? Object.values(tamanhoProduto.Tamanhos) : [];
        const menorPreco = precosTamanhos.length > 0 ? Math.min(...precosTamanhos) : null;

        // Obter tamanhos disponíveis com descrições
        const tamanhosDisponiveis = tamanhoProduto
            ? Object.entries(tamanhoProduto.Tamanhos).map(([nome, id]) => {
                const tamanho = tamanhosCache.find(t => t.id === id);
                return tamanho ? `${tamanho.descricao} (${nome})` : null;
            }).filter(Boolean).join(", ")
            : "Indisponível";

        const acrescimosDisponiveis = produto.acrescimos.map(acresimoId => {
            const acresimo = acrescimosCache.find(ac => ac.id === acresimoId);
            return acresimo ? `${acresimo.nome} (R$ ${acresimo.preco_adicional})` : null;
        }).filter(Boolean).join(", ") || "Nenhum acréscimo disponível";

        const produtoHTML = `
            <div class="produtos-item">
                <div class="produtos-imagem">
                    <img src="${produto.imagem_url}" alt="${produto.nome}">
                </div>
                <div class="produtos-detalhes">
                    <h3>${produto.nome}</h3>
                    <p><strong>Tamanhos disponíveis:</strong> ${tamanhosDisponiveis}</p>
                    <p><strong>Descrição do produto:</strong> ${produto.descricao || ""}</p>
                    <p><strong>Acréscimos disponíveis:</strong> ${acrescimosDisponiveis}</p>
                </div>
                <div class="divisor"></div>
                <div class="produtos-preco">
                    <p>A partir de</p>
                    <p>R$ ${menorPreco !== null ? menorPreco.toFixed(2).replace('.', ',') : "Indisponível"}</p>
                </div>
            </div>
        `;
        $container.append(produtoHTML);
    });
}


    // Chama a função inicial ao carregar a página
    buscarProdutosECategorias();
});
