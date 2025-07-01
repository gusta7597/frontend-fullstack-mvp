// ==========================
// Configuração Base
// ==========================

const baseURL = "http://localhost:5000"; // URL base da API

// ==========================
// Funções de Moradores
// ==========================

/**
 * Lista todos os moradores na tabela HTML.
 */
async function listarMoradores() {
  const resposta = await fetch(`${baseURL}/moradores`);
  const dados = await resposta.json();
  const tbody = document.querySelector("#moradores-list tbody");
  tbody.innerHTML = "";

  dados.moradores.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.nome}</td>
      <td>R$ ${Number(m.salario).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Busca um morador pelo ID e exibe na interface.
 */
async function buscarMorador() {
  const id = document.getElementById("buscar-id").value.trim();
  const div = document.getElementById("morador-unico");

  try {
    const resposta = await fetch(`${baseURL}/moradores/${id}`);
    const dados = await resposta.json();

    if (dados.id) {
      div.innerHTML = `
        <div class="morador-card">
          <p><strong>ID:</strong> ${dados.id}</p>
          <p><strong>Nome:</strong> ${dados.nome}</p>
          <p><strong>Salário:</strong> R$ ${Number(dados.salario).toFixed(2)}</p>
        </div>
      `;
    } else {
      div.innerHTML = "Morador não encontrado.";
    }
  } catch {
    div.innerHTML = "Erro ao buscar morador.";
  }
}

/**
 * Cria um novo morador com dados do formulário.
 */
async function criarMorador() {
  const formData = new FormData();
  formData.append("nome", document.getElementById("nome").value.trim());
  formData.append("salario", parseFloat(document.getElementById("salario").value));

  try {
    await fetch(`${baseURL}/moradores`, {
      method: "POST",
      body: formData
    });
    alert("Morador criado com sucesso!");
    listarMoradores();
  } catch (error) {
    console.error("Erro ao criar morador:", error);
    alert("Erro ao criar morador.");
  }
}

/**
 * Deleta um morador pelo ID.
 */
async function deletarMorador() {
  const id = document.getElementById("deletar-id").value.trim();
  const resposta = await fetch(`${baseURL}/moradores/${id}`, {
    method: "DELETE"
  });

  if (resposta.ok) {
    alert("Morador deletado com sucesso!");
    listarMoradores();
  } else {
    alert("Erro ao deletar morador.");
  }
}

// ==========================
// Funções de Gastos
// ==========================

/**
 * Lista todos os gastos na tabela HTML.
 */
async function listarGastos() {
  const resposta = await fetch(`${baseURL}/gastos`);
  const dados = await resposta.json();
  const tbody = document.querySelector(".tabela-gastos tbody");
  tbody.innerHTML = "";

  dados.gastos.forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.id}</td>
      <td>${g.morador_id}</td>
      <td>${g.data_gasto ? new Date(g.data_gasto).toLocaleDateString("pt-BR") : "Data não informada"}</td>
      <td>${g.descricao}</td>
      <td>R$ ${Number(g.valor).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Busca os gastos de um morador pelo ID e exibe na interface.
 */
async function buscarGasto() {
  const id = document.getElementById("buscar-gasto-id").value.trim();
  const div = document.getElementById("gasto-unico");
  div.innerHTML = "";

  try {
    const resposta = await fetch(`${baseURL}/gastos/morador/${id}`);
    const dados = await resposta.json();

    if (!Array.isArray(dados.gastos) || dados.gastos.length === 0) {
      div.innerHTML = "Nenhum gasto encontrado para este morador.";
      return;
    }

    dados.gastos.forEach(gasto => {
      const card = document.createElement("div");
      card.classList.add("gasto-card");
      card.innerHTML = `
        <p><strong>ID:</strong> ${gasto.id}</p>
        <p><strong>Morador ID:</strong> ${gasto.morador_id}</p>
        <p><strong>Data do gasto:</strong> ${gasto.data_gasto ? new Date(gasto.data_gasto).toLocaleDateString("pt-BR") : "Data não informada"}</p>
        <p><strong>Descrição:</strong> ${gasto.descricao}</p>
        <p><strong>Valor:</strong> R$ ${Number(gasto.valor).toFixed(2)}</p>
      `;
      div.appendChild(card);
    });

  } catch (error) {
    console.error("Erro ao buscar gastos:", error);
    div.innerHTML = "Erro ao buscar gastos.";
  }
}

/**
 * Cria um novo gasto com dados do formulário.
 */
async function criarGasto() {
  const formData = new FormData();
  formData.append("morador_id", document.getElementById("gasto-morador-id").value.trim());
  formData.append("dataGasto", document.getElementById("data-do-gasto").value.trim());
  formData.append("descricao", document.getElementById("gasto-descricao").value.trim());
  formData.append("valor", parseFloat(document.getElementById("gasto-valor").value));

  try {
    const resposta = await fetch(`${baseURL}/gastos`, {
      method: "POST",
      body: formData
    });

    if (!resposta.ok) throw new Error("Erro ao criar gasto.");

    alert("Gasto criado com sucesso!");
    listarGastos();
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao criar gasto.");
  }
}

/**
 * Deleta um gasto pelo ID.
 */
async function deletarGasto() {
  const id = document.getElementById("deletar-gasto-id").value.trim();
  const resposta = await fetch(`${baseURL}/gastos/${id}`, {
    method: "DELETE"
  });

  if (resposta.ok) {
    alert("Gasto deletado com sucesso!");
    listarGastos();
  } else {
    alert("Erro ao deletar gasto.");
  }
}

// ==========================
// Estado Financeiro
// ==========================

/**
 * Mostra o estado financeiro de cada morador no mês atual.
 */
async function mostrarSituacao() {
  const resposta = await fetch(`${baseURL}/gastos/estado-financeiro`);
  const dados = await resposta.json();
  const div = document.getElementById("resultado-situacao");

  if (!dados.resultado || dados.resultado.length === 0) {
    div.innerHTML = "<p>Nenhum dado encontrado.</p>";
    return;
  }

  div.innerHTML = dados.resultado.map(item => `
    <p><strong>${item.nome}</strong> já gastou R$ ${item.total_gastos_mes.toFixed(2)} esse mês e está com saldo de R$ ${item.saldo_atual.toFixed(2)}</p>
  `).join("");
}

// ==========================
// Execução Inicial
// ==========================

listarMoradores();
listarGastos();
