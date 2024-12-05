function loadNavbar() {
    const navbarContainer = document.getElementById("navbar-container");
    const isMobile = window.innerWidth < 768;
    const menuOpen = navbarContainer.querySelector(".menu")?.classList.contains("active"); // Guarda o estado do menu

    let navbarHTML;

    if (isMobile) {
        navbarHTML = `
            <div class="navbar">
                <img src="static/img/Logo.png" class="logo" alt="Logo">
                <div class="hamburger" onclick="toggleMenu()">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <div class="menu" id="navbarMenu">
                    <a href="index.html">HOME</a>
                    <a href="produtos.html">FAÇA SEU PEDIDO</a>
                    <a href="contato.html">CONTATO</a>
                    <a href="sobre.html">SOBRE</a>
                    <div class="nav-icons">
                        <a href="carrinho.html"><img src="static/img/Carrinho.png" class="icon" alt="Carrinho"></a> <a href="conta.html"><img src="static/img/Conta.png" class="icon" alt="Conta"></a>
                    </div>
                </div>
            </div>
        `;
    } else {
        navbarHTML = `
            <div class="navbar">
                <img src="static/img/Logo.png" class="logo" alt="Logo">
                <div class="nav-links">
                    <a href="index.html">HOME</a>
                    <a href="produtos.html">FAÇA SEU PEDIDO</a>
                    <a href="contato.html">CONTATO</a>
                    <a href="sobre.html">SOBRE</a>
                </div>
                <div class="nav-icons">
                    <a href="carrinho.html"><img src="static/img/Carrinho.png" class="icon" alt="Carrinho"></a> <a href="conta.html"><img src="static/img/Conta.png" class="icon" alt="Conta"></a>
                </div>
            </div>
        `;
    }

    navbarContainer.innerHTML = navbarHTML;


    if (isMobile && menuOpen) {  // Reabre o menu se estava aberto antes do resize
        document.getElementById("navbarMenu").classList.add("active");
    }
}

function toggleMenu() {
    const menu = document.getElementById("navbarMenu");
    menu.classList.toggle("active");
    const hamburger = document.querySelector('.hamburger');
    hamburger.classList.toggle('open'); // Animação do hamburger (opcional - requer CSS)
}

window.addEventListener("load", loadNavbar);
window.addEventListener("resize", loadNavbar);