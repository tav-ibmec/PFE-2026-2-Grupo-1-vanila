"use strict";

// ============================================================
// MAIN.JS
// Script usado nas três páginas. Ele cuida de:
//   1) menu hambúrguer (abrir e fechar no celular)
//   2) seta do hero que leva para a próxima seção
//   3) janela de contato do Hub (só existe no index.html)
// ============================================================

// ------------------------------------------------------------
// 1) MENU HAMBÚRGUER
// ------------------------------------------------------------

// Diz se o menu ligado a este botão está aberto (true ou false).
function menuEstaAberto(botao) {
  return botao.getAttribute("aria-expanded") === "true";
}

// Abre (aberto = true) ou fecha (aberto = false) o menu.
// Além da classe CSS, atualiza o aria-expanded e o aria-label do botão,
// para o leitor de tela saber se o menu está aberto ou fechado.
function mudarMenu(botao, menu, aberto) {
  menu.classList.toggle("is-open", aberto);
  botao.setAttribute("aria-expanded", String(aberto));
  botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");

  // Troca o ícone: ☰ quando fechado e × quando aberto
  const icone = botao.querySelector("span");
  if (icone) {
    icone.textContent = aberto ? "×" : "☰";
  }
}

// Liga um botão ☰ ao menu que ele controla (o id do menu está no aria-controls).
function configurarMenu(botao) {
  const menu = document.getElementById(botao.getAttribute("aria-controls"));

  // Se a página não tiver o menu, não faz nada (evita erro)
  if (!menu) {
    return;
  }

  // Clique no botão: abre se estiver fechado, fecha se estiver aberto
  botao.addEventListener("click", function () {
    mudarMenu(botao, menu, !menuEstaAberto(botao));
  });

  // Clicou em um link do menu: fecha o menu
  menu.addEventListener("click", function (evento) {
    if (evento.target.closest("a")) {
      mudarMenu(botao, menu, false);
    }
  });

  // Tecla ESC fecha o menu e devolve o foco para o botão
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menuEstaAberto(botao)) {
      mudarMenu(botao, menu, false);
      botao.focus();
    }
  });

  // Clique fora do menu e fora do botão também fecha
  document.addEventListener("click", function (evento) {
    const clicouFora =
      !menu.contains(evento.target) && !botao.contains(evento.target);
    if (menuEstaAberto(botao) && clicouFora) {
      mudarMenu(botao, menu, false);
    }
  });

  // Se a tela crescer até o layout com menu horizontal (botão escondido pelo CSS),
  // o estado de "aberto" é limpo
  window.addEventListener("resize", function () {
    if (menuEstaAberto(botao) && getComputedStyle(botao).display === "none") {
      mudarMenu(botao, menu, false);
    }
  });
}

// ------------------------------------------------------------
// 2) SETA DO HERO ("ir para a próxima seção")
// ------------------------------------------------------------

// O destino fica no atributo data-scroll-target do botão.
function configurarSetaDeRolagem(seta) {
  seta.addEventListener("click", function () {
    const destino = document.getElementById(seta.dataset.scrollTarget);
    if (!destino) {
      return;
    }

    // Respeita quem pediu "reduzir movimento" no sistema: rola sem animação
    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    destino.scrollIntoView({
      behavior: reduzirMovimento ? "auto" : "smooth",
      block: "start",
    });

    // Leva o foco junto, para quem usa teclado ou leitor de tela continuar dali.
    // tabindex="-1" deixa a seção receber foco sem entrar na ordem do Tab.
    if (!destino.hasAttribute("tabindex")) {
      destino.setAttribute("tabindex", "-1");
    }
    destino.focus({ preventScroll: true });
  });
}

// ------------------------------------------------------------
// 3) JANELA DE CONTATO DO HUB
// Mostra os dois WhatsApp sem sair do site. Usa o elemento <dialog>,
// que já fecha com ESC e prende o foco dentro dele.
// ------------------------------------------------------------

function configurarContatoDoHub(janela) {
  // Botões "Contato" (menu e rodapé) abrem a janela
  const botoesContato = document.querySelectorAll(".hub-contact-trigger");
  for (const botao of botoesContato) {
    botao.addEventListener("click", function () {
      janela.showModal();
    });
  }

  // Botão × fecha a janela
  const botaoFechar = janela.querySelector("[data-close-hub-contact]");
  if (botaoFechar) {
    botaoFechar.addEventListener("click", function () {
      janela.close();
    });
  }

  // Clique no fundo escuro (fora da caixa branca) também fecha
  janela.addEventListener("click", function (evento) {
    if (evento.target === janela) {
      janela.close();
    }
  });
}

// ------------------------------------------------------------
// INÍCIO: liga cada parte aos elementos que existem na página
// ------------------------------------------------------------

const botoesMenu = document.querySelectorAll(".menu-toggle");
for (const botao of botoesMenu) {
  configurarMenu(botao);
}

const setasDeRolagem = document.querySelectorAll(
  ".scroll-cue[data-scroll-target]",
);
for (const seta of setasDeRolagem) {
  configurarSetaDeRolagem(seta);
}

// Só existe no index.html; o teste do showModal evita erro em navegador antigo
const janelaContato = document.getElementById("hub-contact-dialog");
if (janelaContato && typeof janelaContato.showModal === "function") {
  configurarContatoDoHub(janelaContato);
}
