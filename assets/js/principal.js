// Efeito de header sólido ao rolar
const cabecalho = document.getElementById("cabecalho-principal");
const logo = document.getElementById("logo-principal");
const menu = document.getElementById("menu-principal");
const botao = document.getElementById("botao-proposta");

window.addEventListener("scroll", function () {

    if (window.scrollY > 80) {

        // Header fica branco
        cabecalho.classList.add("bg-white", "shadow-lg");

        // Logo e menu ficam verde institucional
        logo.classList.remove("text-white");
        logo.classList.add("text-[#0F4D35]");

        menu.classList.remove("text-white");
        menu.classList.add("text-[#0F4D35]");

        // Botão vira sólido verde
        botao.classList.remove("border-white", "text-white");
        botao.classList.add("bg-[#0F4D35]", "text-white");

    } else {

        // Header volta transparente
        cabecalho.classList.remove("bg-white", "shadow-lg");

        // Logo e menu voltam brancos
        logo.classList.remove("text-[#0F4D35]");
        logo.classList.add("text-white");

        menu.classList.remove("text-[#0F4D35]");
        menu.classList.add("text-white");

        // Botão volta outline branco
        botao.classList.remove("bg-[#0F4D35]");
        botao.classList.add("border-white", "text-white");

    }

});

// Contadores animados
const elementosContador = document.querySelectorAll("[data-contador]");

elementosContador.forEach(elemento => {
    const valorFinal = parseInt(elemento.getAttribute("data-contador"));
    let contador = 0;

    const intervalo = setInterval(() => {
        contador += 1;
        elemento.textContent = contador;

        if (contador >= valorFinal) {
            clearInterval(intervalo);
        }
    }, 20);
});
// ================= FILTRO DE PROJETOS =================

const botoesFiltro = document.querySelectorAll(".botao-filtro");
const cartoesProjeto = document.querySelectorAll(".cartao-projeto");

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", function () {

        document.querySelector(".botao-filtro.ativo")?.classList.remove("ativo");
        this.classList.add("ativo");

        const categoria = this.getAttribute("data-categoria");

        cartoesProjeto.forEach(cartao => {
            if (categoria === "todos" || cartao.getAttribute("data-categoria") === categoria) {
                cartao.style.display = "block";
            } else {
                cartao.style.display = "none";
            }
        });
    });
});

/*// ================= MODAL PROJETO =================


function abrirModalProjeto(nomeProjeto) {
    const modal = document.getElementById("modal-projeto");
    const titulo = document.getElementById("titulo-modal-projeto");

    titulo.textContent = nomeProjeto;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function fecharModalProjeto() {
    const modal = document.getElementById("modal-projeto");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}


*/




const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        // Remove active
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filter = button.getAttribute("data-filter");

        projectCards.forEach(card => {
            const category = card.getAttribute("data-category");

            if (filter === "all" || category === filter) {
                card.style.display = "block";
                card.style.opacity = "1";
                card.style.transform = "scale(1)";
            } else {
                card.style.display = "none";
            }
        });

    });
});




