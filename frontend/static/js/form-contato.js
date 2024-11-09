document.addEventListener("DOMContentLoaded", function() {
    const contactForm = document.getElementById("contactForm");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const phoneOptions = document.getElementById("phoneOptions");
    const contactOptions = document.querySelectorAll("input[name='contactOptions']");
    const phoneRegex = /^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Formatação do telefone com limite de caracteres
    phoneInput.addEventListener("input", function() {
        let input = phoneInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos

        // Limita o número máximo de dígitos a 11 (DDD + 9 + 8 dígitos)
        if (input.length > 11) {
            input = input.slice(0, 11);
        }

        // Aplica a formatação desejada
        if (input.length <= 2) {
            input = `(${input}`;
        } else if (input.length <= 7) {
            input = `(${input.slice(0, 2)}) ${input.slice(2)}`;
        } else {
            input = `(${input.slice(0, 2)}) ${input.slice(2, 7)}-${input.slice(7, 11)}`;
        }
        phoneInput.value = input;
    });

    // Mostra ou esconde as opções de contato se o telefone for preenchido
    phoneInput.addEventListener("input", function() {
        if (phoneInput.value.length > 0) {
            phoneOptions.classList.remove("hidden");
            emailInput.removeAttribute("required");
            contactOptions.forEach(option => option.setAttribute("required", "required"));
        } else {
            phoneOptions.classList.add("hidden");
            emailInput.setAttribute("required", "required");
            contactOptions.forEach(option => option.removeAttribute("required"));
        }
    });

    // Validar o formulário ao enviar
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // Limpeza do número de telefone
        const cleanedPhone = phoneInput.value.replace(/[^\d\(\)\-]/g, "");

        // Validação de e-mail e telefone
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
            alert("Por favor, insira um email válido.");
            return;
        }

        if (phoneInput.value && !phoneRegex.test(cleanedPhone)) {
            alert("Por favor, insira um telefone válido no formato (31) 90000-0000.");
            return;
        }

        // Validação das opções de contato se telefone estiver preenchido
        if (phoneInput.value) {
            const anyOptionSelected = Array.from(contactOptions).some(option => option.checked);
            if (!anyOptionSelected) {
                alert("Selecione ao menos uma preferência de contato.");
                return;
            }
        }

        // Se passar todas as validações, o formulário pode ser enviado
        alert("Formulário enviado com sucesso!");
        contactForm.reset();
        phoneOptions.classList.add("hidden");
    });
});
