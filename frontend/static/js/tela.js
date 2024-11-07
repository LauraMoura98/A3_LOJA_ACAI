function loadResponsiveCSS() {
	var link = document.createElement("link");
	link.rel = "stylesheet";
	link.type = "text/css";

	var width = window.innerWidth;
	var height = window.innerHeight;

	// Se a largura for menor que 768px, carrega o CSS para celulares
	if (width < 768) {
		link.href = "static/css/mobile.css"; // Certifique-se de que este arquivo CSS exista
	} else {
		link.href = "static/css/desktop.css"; // Certifique-se de que este arquivo CSS exista
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

