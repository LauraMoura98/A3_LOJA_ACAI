function loadNavbar() {
    const navbarContainer = document.getElementById("navbar-container");
    const isMobile = window.innerWidth < 768;
    const menuOpen = navbarContainer.querySelector(".menu")?.classList.contains("active"); // Guarda o estado do menu

    let navbarHTML;

    if (isMobile) {
        navbarHTML = `
            <div class="navbar">
                <img src="../static/img/Logo.png" class="logo" alt="Logo">
                <div class="hamburger" onclick="toggleMenu()">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <div class="menu" id="navbarMenu">
                <a href="login.html">LOGIN</a>
                <a href="criar.html">CRIAR</a>
                <a href="editar.html">EDITAR</a>
                <a href="tamanhos.html">TAMANHOS</a>
                <a href="acrescimos.html">ACRESCIMOS</a>
                </div>
            </div>
        `;
    } else {
        navbarHTML = `
            <div class="navbar">
                <img src="../static/img/Logo.png" class="logo" alt="Logo">
                <div class="nav-links">
                <a href="login.html">LOGIN</a>
                <a href="criar.html">CRIAR</a>
                <a href="editar.html">EDITAR</a>
                <a href="tamanhos.html">TAMANHOS</a>
                <a href="acrescimos.html">ACRESCIMOS</a>
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