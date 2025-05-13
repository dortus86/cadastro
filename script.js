const form = document.getElementById("form");
const tabela = document.getElementById("tabela-body");

let editIndex = -1;
const dadosSalvos = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const transportadora = form.transportadora.value.trim();
  const placa = form.placa.value.trim();
  const motorista = form.motorista.value.trim();
  const rg = form.rg.value.trim();
  const nf = form.nf.value.trim();
  const po = form.po.value.trim();
  const fornecedor = form.fornecedor.value.trim();

  if (!transportadora || !placa || !motorista || !rg) {
    alert("Preencha os campos fixos primeiro.");
    return;
  }

  // Validação: RG e NF devem conter apenas números
  if (!/^\d+$/.test(rg)) {
    alert("O campo RG deve conter apenas números.");
    return;
  }

  if (!/^\d+$/.test(nf)) {
    alert("O campo Nota Fiscal deve conter apenas números.");
    return;
  }

  // Validação do Pedido (PO)
  if (!validarPO(po)) {
    alert(
      "O campo Pedido (PO) deve conter apenas números (exatos 10 dígitos) ou alfanumérico (até 15 caracteres)."
    );
    return;
  }

  const dados = {
    transportadora,
    placa,
    motorista,
    rg,
    nf,
    po,
    fornecedor,
  };

  if (editIndex === -1) {
    adicionarLinha(dados);
  } else {
    atualizarLinha(dados, editIndex);
    editIndex = -1;
  }

  // Limpa apenas os campos variáveis
  form.nf.value = "";
  form.po.value = "";
  form.fornecedor.value = "";
});

// Função de validação do PO
function validarPO(po) {
  const soNumeros = /^\d+$/;
  const contemLetra = /[a-zA-Z]/;

  if (soNumeros.test(po)) {
    return po.length === 10; // apenas números: exatamente 10 dígitos
  } else if (contemLetra.test(po)) {
    return po.length <= 15; // se contém letras: até 15 caracteres
  }
  return false;
}

function adicionarLinha(dados) {
  const tr = document.createElement("tr");

  for (const key in dados) {
    const td = document.createElement("td");
    td.textContent = dados[key];
    tr.appendChild(td);
  }

  const tdAcoes = document.createElement("td");

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "Editar";
  btnEdit.className = "btn-edit";
  btnEdit.onclick = () => editarLinha(tr);

  const btnDelete = document.createElement("button");
  btnDelete.textContent = "Excluir";
  btnDelete.className = "btn-delete";
  btnDelete.onclick = () => {
      const index = Array.from(tabela.children).indexOf(tr);
      dadosSalvos.splice(index, 1);
      tr.remove();
  };

  tdAcoes.appendChild(btnEdit);
  tdAcoes.appendChild(btnDelete);
  tr.appendChild(tdAcoes);

  tabela.appendChild(tr);
  dadosSalvos.push(dados);
}

function editarLinha(tr) {
  const dados = tr.querySelectorAll("td");
  form.nf.value = dados[4].textContent;
  form.po.value = dados[5].textContent;
  form.fornecedor.value = dados[6].textContent;

  editIndex = Array.from(tabela.children).indexOf(tr);
  tr.remove();
  dadosSalvos.splice(editIndex, 1);
}

function atualizarLinha(dados, index) {
  adicionarLinha(dados); // adiciona no final
}

function salvarDados() {
  console.log("Salvando dados:", dadosSalvos);

  alert("Dados prontos para salvar em banco de dados ou CSV.");
  // Aqui você pode usar fetch() ou Ajax para enviar os dados ao backend
}
// Apenas números
const numericOnly = (input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
  });
};

// Campo RG e Nota Fiscal
const rgInput = document.getElementById("rg");
const nfInput = document.getElementById("nf");

numericOnly(rgInput);
numericOnly(nfInput);

// Campo Pedido (PO)
const poInput = document.getElementById("po");
poInput.addEventListener("input", () => {
  let value = poInput.value;

  if (/^\d+$/.test(value)) {
    // Apenas números: limitar a 10 dígitos
    poInput.value = value.slice(0, 10);
  } else {
    // Alfanumérico: limitar a 15 caracteres
    poInput.value = value.slice(0, 15);
  }
});

function salvarDadosServidor() {
  const tabela = document.getElementById("dadosTabela");
  if (!tabela) {
    alert("Tabela de dados não encontrada.");
    return;
  }

  const linhas = tabela.querySelectorAll("tbody tr");
  if (linhas.length === 0) {
    alert("Nenhum dado para salvar.");
    return;
  }

  let dados = [];

  linhas.forEach((row) => {
    const cols = row.querySelectorAll("td");
    const rowData = [...cols].slice(0, 7).map((td) => td.innerText.trim());
    dados.push(rowData);
  });

  fetch("salvar_dados.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dados }),
  })
    .then((response) => response.text())
    .then((msg) => {
      alert(msg);

      // Limpa a tabela após salvar
      document.querySelector("#dadosTabela tbody").innerHTML = "";

      // Limpa os campos fixos
      document.getElementById("transportadora").value = "";
      document.getElementById("placa").value = "";
      document.getElementById("motorista").value = "";
      document.getElementById("rg").value = "";

      // (Opcional) Foca no primeiro campo novamente
      document.getElementById("transportadora").focus();

      // Scroll para o topo do formulário
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
    .catch((err) => alert("Erro ao salvar dados: " + err));
}

// Estrutura do Modal para Pesquisa
function abrirPopupPesquisa() {
    document.getElementById("modalPesquisa").style.display = "block";
}

function fecharPopupPesquisa() {
    document.getElementById("modalPesquisa").style.display = "none";
    document.getElementById("resultadoPesquisa").innerHTML = "";
    document.getElementById("formPesquisa").reset();
}

document.getElementById("formPesquisa").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch("pesquisar_dados.php", {
        method: "POST",
        body: formData,
    })
    .then((res) => res.text())
    // .then((data) => {
    //     document.getElementById("resultadoPesquisa").innerHTML = data;
    // })
    .catch((err) => {
        alert("Erro ao buscar dados: " + err);
    });
});

function buscarDados() {
  const notaFiscal = document.getElementById("filtroNotaFiscal").value;
  const pedidoPO = document.getElementById("filtroPedido").value;
  const fornecedor = document.getElementById("filtroFornecedor").value;
  const dataInicio = document.getElementById("filtroDataInicio").value;
  const dataFim = document.getElementById("filtroDataFim").value;

  const url = `pesquisar_dados.php?notaFiscal=${encodeURIComponent(
    notaFiscal
  )}&pedidoPO=${encodeURIComponent(pedidoPO)}&fornecedor=${encodeURIComponent(
    fornecedor
  )}&dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(
    dataFim
  )}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector("#dadosTabela tbody");
      const mensagem = document.getElementById("mensagemNenhumResultado");
      tbody.innerHTML = "";

      if (data.length === 0) {
        mensagem.style.display = "block";
      } else {
        mensagem.style.display = "none";
        data.forEach((item) => {
          const tr = document.createElement("tr");
          item.forEach((campo) => {
            const td = document.createElement("td");
            td.textContent = campo;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });

        // Fecha o modal se houver resultados
        const modal = document.getElementById("modalPesquisa");
        if (modal) {
          modal.style.display = "none";
        }
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
    });
}
function limparTabela() {
  const tbody = document.querySelector("#dadosTabela tbody");
  tbody.innerHTML = "";
  const mensagem = document.getElementById("mensagemPesquisa");
  mensagem.innerHTML = "";
}