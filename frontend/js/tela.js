function loadResponsiveCSS() {
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.type = "text/css";

	var width = window.innerWidth;
	var height = window.innerHeight;

	// Se a largura for menor que 768px, carrega o CSS para celulares
	if (width < 768) {
		link.href = "css/mobile.css"; // Certifique-se de que este arquivo CSS exista
	} else {
		link.href = "css/desktop.css"; // Certifique-se de que este arquivo CSS exista
	}

	document.head.appendChild(link);
}

// Chama a função ao carregar a página
window.onload = loadResponsiveCSS;

// Chama a função ao redimensionar a janela
window.onresize = loadResponsiveCSS;




function toggleMenu() {
    var menu = document.getElementById("navbarMenu");
    menu.classList.toggle("active"); // Alterna a classe para mostrar ou esconder o menu
}

// Chama a função ao redimensionar a janela para garantir que o menu esteja visível ou escondido corretamente
window.onresize = function() {
    var menu = document.getElementById("navbarMenu");
    if (window.innerWidth >= 768) {
        menu.classList.remove("active"); // Remove a classe ativa em telas maiores
    }
};




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
                    <a href="#home">HOME</a>
                    <a href="#pedido">FAÇA SEU PEDIDO</a>
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
