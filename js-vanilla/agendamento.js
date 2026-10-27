// 1) DADOS ------------------------------------------------
const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const horas = ["07:00", "08:00", "09:00", "10:00", "11:00", "17:00", "18:00", "19:00", "20:00"];

let semana = 0;          // 0 = esta semana, 1 = próxima, 2 = a seguinte...
const totalSemanas = 4;  // quantas semanas a pessoa pode ver

// Lista das reservas. Cada reserva é um objeto com o horário e os dados de contato:
// { id: "16/10/2026 17:00", nome: "Ana", email: "ana@email.com", telefone: "21 99999-9999" }
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

let horarioEscolhido = ""; // o horário que a pessoa clicou

// 2) ELEMENTOS DO HTML -----------------------------------
const tabela = document.getElementById("grade");
const mensagem = document.getElementById("status");
const modal = document.getElementById("modal");
const form = document.getElementById("form");
const resumo = document.getElementById("resumo");
const semanaTexto = document.getElementById("semanaTexto");
const botaoAnterior = document.getElementById("anterior");
const botaoProxima = document.getElementById("proxima");
const botaoDados = document.getElementById("verDados");
const caixaDados = document.getElementById("dados");

// 3) FUNÇÕES DE DATA -------------------------------------

// Descobre a data de um dia da semana que está sendo exibida.
// posicao: 0 = segunda, 1 = terça ... 5 = sábado
function pegarData(posicao) {
  const hoje = new Date();
  // getDay() devolve 0 para domingo, 1 para segunda ... 6 para sábado.
  // Esta conta transforma em: segunda = 0, terça = 1 ... domingo = 6.
  const diasDesdeSegunda = (hoje.getDay() + 6) % 7;
  // Começamos em hoje, voltamos até a segunda, pulamos as semanas e somamos a posição do dia.
  // O setDate() já ajusta sozinho a virada de mês e de ano.
  const data = new Date();
  data.setDate(hoje.getDate() - diasDesdeSegunda + semana * 7 + posicao);
  data.setHours(0, 0, 0, 0); // zera a hora: só queremos comparar o dia
  return data;
}

// Transforma uma data em texto "16/10/2026".
function formatar(data) {
  const dia = String(data.getDate()).padStart(2, "0");       // "5" vira "05"
  const mes = String(data.getMonth() + 1).padStart(2, "0");  // janeiro é 0, por isso + 1
  return dia + "/" + mes + "/" + data.getFullYear();
}

// Diz se um horário já está na lista de reservas (true ou false).
function estaReservado(id) {
  for (const reserva of reservas) {
    if (reserva.id === id) {
      return true;
    }
  }
  return false;
}

// 4) DESENHAR A TABELA -----------------------------------
function mostrarTabela() {
  // Primeiro, calculamos a data de cada dia desta semana.
  const datas = [];
  for (let i = 0; i < dias.length; i++) {
    datas.push(pegarData(i));
  }

  // Data e hora de agora, para saber o que já passou.
  const agora = new Date();

  // Texto acima da tabela: "Semana de 19/10 a 24/10".
  // slice(0, 5) pega só "19/10" do texto "19/10/2026".
  semanaTexto.textContent = "Semana de " + formatar(datas[0]).slice(0, 5) + " a " + formatar(datas[5]).slice(0, 5);

  // Desabilita os botões de navegação nas pontas.
  botaoAnterior.disabled = (semana === 0);
  botaoProxima.disabled = (semana === totalSemanas - 1);

  // Cabeçalho: cada coluna mostra o dia e a data.
  let html = "<thead><tr><th></th>";
  for (let i = 0; i < dias.length; i++) {
    html += "<th>" + dias[i] + "<small>" + formatar(datas[i]).slice(0, 5) + "</small></th>";
  }
  html += "</tr></thead><tbody>";

  // Corpo: uma linha por hora, um botão por dia.
  for (const hora of horas) {
    html += "<tr><th>" + hora + "</th>";

    for (let i = 0; i < dias.length; i++) {
      const id = formatar(datas[i]) + " " + hora;  // ex.: "16/10/2026 17:00"

      // Monta a data e hora de INÍCIO deste horário.
      // parseInt("17:00") devolve 17, que é a hora que precisamos.
      const inicio = new Date(datas[i]);
      inicio.setHours(parseInt(hora));
      const jaPassou = inicio < agora;             // true se o horário já começou

      if (estaReservado(id) || jaPassou) {
        html += '<td><button class="slot" disabled>—</button></td>';
      } else {
        html += '<td><button class="slot" data-id="' + id + '">Livre</button></td>';
      }
    }
    html += "</tr>";
  }
  html += "</tbody>";

  tabela.innerHTML = html;

  // Atualiza a caixa de dados salvos com o conteúdo atual da lista.
  // JSON.stringify transforma a lista em texto; o 2 deixa o texto indentado e legível.
  caixaDados.textContent = JSON.stringify(reservas, null, 2);

  // Ensina cada botão livre a abrir o modal.
  const botoesLivres = document.querySelectorAll(".slot:not(:disabled)");
  for (const botao of botoesLivres) {
    botao.onclick = function () {
      horarioEscolhido = botao.dataset.id;
      resumo.textContent = horarioEscolhido;
      modal.showModal();
    };
  }
}

// 5) NAVEGAR ENTRE SEMANAS -------------------------------
botaoAnterior.onclick = function () {
  semana = semana - 1;
  mostrarTabela();
};

botaoProxima.onclick = function () {
  semana = semana + 1;
  mostrarTabela();
};

// 6) ENVIAR O FORMULÁRIO ---------------------------------
form.onsubmit = function (evento) {
  evento.preventDefault();

  // Lê o que a pessoa digitou. O nome de cada campo é o atributo "name" no HTML.
  const nome = form.elements["nome"].value;
  const email = form.elements["email"].value;
  const telefone = form.elements["telefone"].value;

  // Cria o objeto da reserva e coloca na lista.
  reservas.push({ id: horarioEscolhido, nome: nome, email: email, telefone: telefone });
  localStorage.setItem("reservas", JSON.stringify(reservas));

  modal.close();
  form.reset();
  mensagem.textContent = "Reserva confirmada para " + horarioEscolhido + "!";
  mostrarTabela();
};

// 7) OUTROS BOTÕES ---------------------------------------
document.getElementById("cancelar").onclick = function () {
  modal.close();
};

// Mostra ou esconde a caixa com os dados salvos.
botaoDados.onclick = function () {
  if (caixaDados.hidden) {
    caixaDados.hidden = false;
    botaoDados.textContent = "Esconder dados salvos";
  } else {
    caixaDados.hidden = true;
    botaoDados.textContent = "Ver dados salvos";
  }
};

document.getElementById("reset").onclick = function () {
  localStorage.removeItem("reservas");
  location.reload();
};

// 8) COMEÇAR ---------------------------------------------
mostrarTabela();
