function loadNavbar() {
    const navbarContainer = document.getElementById("navbar-container");
    const isMobile = window.innerWidth < 768;

    // Define o HTML para a navbar de acordo com o dispositivo
    if (isMobile) {
        navbarContainer.innerHTML = `
            <div class="navbar">
                <img src="assets/Logo.png" class="logo" alt="Logo">
                <div class="hamburger" onclick="toggleMenu()">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <div class="menu" id="navbarMenu">
                    <a href="index.html">HOME</a>
                    <a href="#produtos.html">FAÇA SEU PEDIDO</a>
                    <a href="#contato">CONTATO</a>
                    <div class="nav-icons">
                        <a href="#carrinho"><img src="assets/Carrinho.png" class="icon" alt="Carrinho"></a>
                        <a href="#conta"><img src="assets/Conta.png" class="icon" alt="Conta"></a>
                    </div>
                </div>
            </div>
        `;
    } else {
        navbarContainer.innerHTML = `
            <div class="navbar">
                <img src="assets/Logo.png" class="logo" alt="Logo">
                <div class="nav-links">
                    <a href="#home">HOME</a>
                    <a href="#pedido">FAÇA SEU PEDIDO</a>
                    <a href="#contato">CONTATO</a>
                </div>
                <div class="nav-icons">
                    <a href="#carrinho"><img src="assets/Carrinho.png" class="icon" alt="Carrinho"></a>
                    <a href="#conta"><img src="assets/Conta.png" class="icon" alt="Conta"></a>
                </div>
            </div>
        `;
    }
}

// Função para alternar o menu no mobile
function toggleMenu() {
    const menu = document.getElementById("navbarMenu");
    menu.classList.toggle("active");
}

// Carrega a navbar correta ao carregar a página
window.addEventListener("load", loadNavbar);

// Recarrega a navbar quando a janela é redimensionada
window.addEventListener("resize", loadNavbar);
