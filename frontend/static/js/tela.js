
var width = window.innerWidth;
var height = window.innerHeight;



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
