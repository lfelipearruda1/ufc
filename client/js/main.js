let divisoes = [];
let lutadores = [];
let cards = [];
let visibilidades = [];
let cinturoes = [];
let metodosLuta = [];
let editId = null;
let modalTipo = null;
let consultaAtiva = 'lutadores-por-divisao';
let eventosPorMes = [];

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const TITULOS_SECAO = {
  dashboard: 'Painel',
  lutadores: 'Atletas',
  divisoes: 'Divisões',
  cards: 'Eventos',
  lutas: 'Confrontos',
  campeoes: 'Cinturões',
  atividade: 'Desempenho',
  consultas: 'Consultas',
};

const COL_LABELS = {
  nome: 'Nome',
  apelido: 'Apelido',
  cartel: 'Cartel',
  peso: 'Peso (kg)',
  peso_min: 'Peso Mín.',
  peso_max: 'Peso Máx.',
  nacionalidade: 'Nac.',
  classificacao: 'Class.',
  nome_divisao: 'Divisão',
  cidade: 'Cidade',
  pais: 'País',
  data: 'Data',
  data_hora: 'Data / Hora',
  quant_lutas: 'Confrontos',
  quant_rounds: 'Rounds',
  num_edicao: 'Edição',
  metodo: 'Método',
  resultado: 'Resultado',
  visibilidade: 'Visibilidade',
  tipo_cinturao: 'Tipo de Cinturão',
  nome_divisao_cinturao: 'Cinturão',
  nome_lutador: 'Atleta',
  apelido_desafiante: 'Desafiante',
  apelido_desafiado: 'Desafiado',
  nome_desafiante: 'Desafiante',
  nome_desafiado: 'Desafiado',
  total_lutadores: 'Atletas',
  total_lutas: 'Lutas',
  total_vitorias: 'Vitórias',
  total_derrotas: 'Derrotas',
  total_empates: 'Empates',
  media_lutas: 'Média de Lutas',
  receita_por_pagante: 'Receita / Pagante',
};

const TOAST_ICONS = {
  error: '<svg class="toast-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/></svg>',
  success: '<svg class="toast-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-3.5"/></svg>',
  info: '<svg class="toast-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5h.01"/></svg>',
};

const loaders = {
  dashboard: carregarDashboard,
  lutadores: carregarLutadores,
  divisoes: carregarDivisoes,
  cards: carregarCards,
  lutas: carregarLutas,
  campeoes: carregarCampeoes,
  atividade: carregarAtividade,
  consultas: carregarConsultas,
};

function escapeHtml(texto) {
  if (texto == null) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function labelColuna(coluna) {
  return COL_LABELS[coluna] || coluna.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function parseDataEvento(dataTexto) {
  if (!dataTexto) return null;
  const texto = String(dataTexto).trim();
  let match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      chave: `${match[1]}-${match[2]}`,
      rotulo: `${MESES_CURTOS[+match[2] - 1]}/${match[1].slice(-2)}`,
    };
  }
  match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const mes = String(+match[2]).padStart(2, '0');
    return {
      chave: `${match[3]}-${mes}`,
      rotulo: `${MESES_CURTOS[+match[2] - 1]}/${String(match[3]).slice(-2)}`,
    };
  }
  return null;
}

function agruparEventosPorMes(listaCards) {
  const mapa = {};
  listaCards.forEach(card => {
    const parsed = parseDataEvento(card.data);
    if (!parsed) return;
    if (!mapa[parsed.chave]) {
      mapa[parsed.chave] = { label: parsed.rotulo, value: 0, key: parsed.chave };
    }
    mapa[parsed.chave].value++;
  });
  return Object.values(mapa).sort((a, b) => a.key.localeCompare(b.key));
}

function extrairVitorias(cartel) {
  return parseInt(String(cartel || '0').split('-')[0], 10) || 0;
}

function erroApi(erro, mensagemPadrao) {
  return erro?.fromApi && erro.message ? erro.message : mensagemPadrao;
}

function classificacaoBadge(classificacao) {
  const classes = {
    Elite: 'badge-elite',
    Experiente: 'badge-exp',
    Promessa: 'badge-promessa',
    Estreante: 'badge-estreante',
  };
  const classe = classes[classificacao] || 'badge-estreante';
  return `<span class="badge ${classe}">${escapeHtml(classificacao || '-')}</span>`;
}

function montarTabela(cabecalhos, linhasHtml) {
  if (!linhasHtml.length) {
    return '<div class="empty-state"><div class="icon">—</div><p>Nenhum registro encontrado</p></div>';
  }
  const linhasNumeradas = linhasHtml.map((linha, indice) =>
    linha.replace('<tr>', `<tr><td class="row-num">${indice + 1}</td>`)
  );
  return `<div class="table-wrap"><table>
    <thead><tr><th class="row-num">#</th>${cabecalhos.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
    <tbody>${linhasNumeradas.join('')}</tbody>
  </table></div>`;
}

function montarTabelaDados(lista, opcoes = {}) {
  if (!Array.isArray(lista) || !lista.length) {
    return '<div class="empty-state"><div class="icon">—</div><p>Nenhum registro encontrado</p></div>';
  }
  const colunas = Object.keys(lista[0]).filter(coluna => !/^id(_|$)/i.test(coluna));
  const linhas = lista.map(registro =>
    `<tr>${colunas.map(coluna => `<td>${escapeHtml(registro[coluna] ?? '-')}</td>`).join('')}</tr>`
  );
  return montarTabela(colunas.map(labelColuna), linhas);
}

function montarIndicadorResumo(total, rotulo) {
  return `<div class="view-summary">
    <div class="view-summary-value">${escapeHtml(String(total))}</div>
    <div class="view-summary-label">${escapeHtml(rotulo)}</div>
  </div>`;
}

function showToast(mensagem, tipo = 'error', duracao = 4500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `${TOAST_ICONS[tipo] || TOAST_ICONS.info}<span class="toast-body"></span><button type="button" class="toast-close" aria-label="Fechar">&times;</button>`;
  toast.querySelector('.toast-body').textContent = mensagem;

  const fechar = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    toast.style.transition = 'opacity 0.15s, transform 0.15s';
    setTimeout(() => toast.remove(), 150);
  };

  toast.querySelector('.toast-close').addEventListener('click', fechar);
  container.appendChild(toast);
  if (duracao > 0) setTimeout(fechar, duracao);
}

function showAlert(mensagem, tipo = 'error') {
  showToast(mensagem, tipo);
}

let confirmResolver = null;

function showConfirm(mensagem, opcoes = {}) {
  const {
    titulo = 'Confirmar ação',
    confirmar = 'Confirmar',
    cancelar = 'Cancelar',
    perigo = false,
  } = opcoes;

  return new Promise(resolve => {
    if (confirmResolver) confirmResolver(false);

    const overlay = document.getElementById('confirm-overlay');
    const botaoOk = document.getElementById('confirm-ok');
    const botaoCancelar = document.getElementById('confirm-cancelar');

    document.getElementById('confirm-titulo').textContent = titulo;
    document.getElementById('confirm-mensagem').textContent = mensagem;
    botaoOk.textContent = confirmar;
    botaoCancelar.textContent = cancelar;
    botaoOk.className = perigo ? 'btn btn-danger' : 'btn btn-primary';

    const finalizar = resultado => {
      overlay.classList.add('hidden');
      document.removeEventListener('keydown', onTecla);
      confirmResolver = null;
      resolve(resultado);
    };

    const onTecla = evento => {
      if (evento.key === 'Escape') finalizar(false);
      if (evento.key === 'Enter') finalizar(true);
    };

    confirmResolver = finalizar;
    botaoOk.onclick = () => finalizar(true);
    botaoCancelar.onclick = () => finalizar(false);
    overlay.onclick = evento => {
      if (evento.target === overlay) finalizar(false);
    };

    overlay.classList.remove('hidden');
    document.addEventListener('keydown', onTecla);
    botaoCancelar.focus();
  });
}

function abrirModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editId = null;
  modalTipo = null;
}

async function carregarDashboard() {
  try {
    const [listaAtletas, listaDivisoes, listaEventos, listaConfrontos] = await Promise.all([
      API.getLutadores(),
      API.getDivisoes(),
      API.getCards(),
      API.getLutas(),
    ]);

    document.getElementById('kpi-atletas').textContent = listaAtletas.length;
    document.getElementById('kpi-divisoes').textContent = listaDivisoes.length;
    document.getElementById('kpi-eventos').textContent = listaEventos.length;
    document.getElementById('kpi-confrontos').textContent = listaConfrontos.length;

    try {
      const campeoes = await API.getCampeoes();
      document.getElementById('kpi-cinturoes').textContent =
        Array.isArray(campeoes) ? campeoes.length : '—';
    } catch {
      document.getElementById('kpi-cinturoes').textContent = '—';
    }

    const mapaDivisoes = {};
    listaAtletas.forEach(atleta => {
      const nomeDivisao = atleta.nome_divisao || 'Sem divisão';
      mapaDivisoes[nomeDivisao] = (mapaDivisoes[nomeDivisao] || 0) + 1;
    });
    const dadosDivisoes = Object.entries(mapaDivisoes)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    Charts.bar(document.getElementById('chart-bar-div'), dadosDivisoes);

    const classificacoes = { Elite: 0, Experiente: 0, Promessa: 0, Estreante: 0 };
    listaAtletas.forEach(atleta => {
      if (atleta.classificacao in classificacoes) classificacoes[atleta.classificacao]++;
    });
    const dadosClassificacao = Object.entries(classificacoes)
      .map(([label, value]) => ({ label, value }))
      .filter(item => item.value > 0);
    Charts.donut(document.getElementById('chart-donut-class'), dadosClassificacao, {
      centerLabel: listaAtletas.length,
      centerSub: 'atletas',
    });

    eventosPorMes = agruparEventosPorMes(listaEventos);
    Charts.line(document.getElementById('chart-line-eventos'), eventosPorMes);

    const mapaMetodos = {};
    listaConfrontos.forEach(confronto => {
      mapaMetodos[confronto.metodo] = (mapaMetodos[confronto.metodo] || 0) + 1;
    });
    const dadosMetodos = Object.entries(mapaMetodos).map(([label, value]) => ({ label, value }));
    Charts.segments(document.getElementById('chart-metodos'), dadosMetodos);

    const dadosVitorias = listaAtletas
      .map(atleta => ({
        label: atleta.apelido || atleta.nome,
        value: extrairVitorias(atleta.cartel),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    Charts.hbar(document.getElementById('chart-hbar-atletas'), dadosVitorias);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar o painel.'));
  }
}

function showSection(nomeSecao) {
  document.querySelectorAll('.section').forEach(secao => secao.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.getElementById('section-' + nomeSecao).classList.add('active');
  document.querySelector(`.nav-item[data-section="${nomeSecao}"]`).classList.add('active');
  document.getElementById('topbar-title').textContent = TITULOS_SECAO[nomeSecao] || nomeSecao;
  if (loaders[nomeSecao]) loaders[nomeSecao]();
}

async function carregarLutadores() {
  try {
    divisoes = await API.getDivisoes();
    const select = document.getElementById('filtro-divisao');
    select.innerHTML =
      '<option value="">Todas as divisões</option>' +
      divisoes
        .map(divisao =>
          `<option value="${divisao.id_divisao}">${escapeHtml(divisao.nome_divisao)}</option>`
        )
        .join('');
    await filtrarLutadores();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar os atletas.'));
  }
}

async function filtrarLutadores() {
  const idDivisao = document.getElementById('filtro-divisao').value;
  try {
    lutadores = await API.getLutadores(idDivisao || null);
    renderLutadores(lutadores);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível filtrar os atletas.'));
  }
}

function renderLutadores(lista) {
  const linhas = lista.map(atleta => `<tr>
    <td>${escapeHtml(atleta.nome)}</td>
    <td>${escapeHtml(atleta.apelido)}</td>
    <td>${escapeHtml(atleta.cartel)}</td>
    <td>${escapeHtml(atleta.peso)} kg</td>
    <td>${escapeHtml(atleta.nacionalidade)}</td>
    <td>${escapeHtml(atleta.nome_divisao || '-')}</td>
    <td>${classificacaoBadge(atleta.classificacao)}</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" data-action="editar-lutador" data-id="${atleta.id_lutador}">Editar</button>
      <button class="btn btn-ghost btn-sm" data-action="transferir-lutador" data-id="${atleta.id_lutador}">Transferir</button>
      <button class="btn btn-danger btn-sm" data-action="excluir-lutador" data-id="${atleta.id_lutador}">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-lutadores').innerHTML = montarTabela(
    ['Nome', 'Apelido', 'Cartel', 'Peso', 'Nac.', 'Divisão', 'Class.', 'Ações'],
    linhas
  );
}

function abrirModalLutador(dados = null) {
  modalTipo = 'lutador';
  editId = dados ? dados.id_lutador : null;
  const atleta = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Atleta' : 'Novo Atleta';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Nome</label>
        <input id="f-nome" value="${escapeHtml(atleta.nome || '')}"></div>
      <div class="form-group"><label>Apelido</label>
        <input id="f-apelido" value="${escapeHtml(atleta.apelido || '')}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Peso (kg)</label>
        <input id="f-peso" type="number" step="0.1" value="${escapeHtml(atleta.peso || '')}"></div>
      <div class="form-group"><label>Cartel (V-D-E)</label>
        <input id="f-cartel" placeholder="0-0-0" value="${escapeHtml(atleta.cartel || '')}"></div>
    </div>
    <div class="form-group"><label>Nacionalidade</label>
      <input id="f-nac" value="${escapeHtml(atleta.nacionalidade || '')}"></div>
    <div class="form-group"><label>Divisão</label>
      <select id="f-divisao">
        <option value="">Selecione...</option>
        ${divisoes
          .map(
            divisao =>
              `<option value="${divisao.id_divisao}" ${atleta.id_divisao == divisao.id_divisao ? 'selected' : ''}>${escapeHtml(divisao.nome_divisao)}</option>`
          )
          .join('')}
      </select></div>`;
  abrirModal();
}

async function editarLutador(id) {
  try {
    if (!divisoes.length) divisoes = await API.getDivisoes();
    const atleta = await API.getLutador(id);
    abrirModalLutador(atleta);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar o atleta.'));
  }
}

async function salvarLutador() {
  const payload = {
    nome: document.getElementById('f-nome').value.trim(),
    apelido: document.getElementById('f-apelido').value.trim(),
    peso: document.getElementById('f-peso').value,
    cartel: document.getElementById('f-cartel').value.trim(),
    nacionalidade: document.getElementById('f-nac').value.trim(),
    id_divisao: document.getElementById('f-divisao').value,
  };
  if (!payload.nome) {
    showAlert('O nome do atleta é obrigatório.');
    return;
  }
  try {
    const resposta = editId
      ? await API.updateLutador(editId, payload)
      : await API.createLutador(payload);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert(resposta?.mensagem || 'Atleta salvo com sucesso.', 'success');
    fecharModal();
    carregarLutadores();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível salvar o atleta.'));
  }
}

async function deletarLutador(id) {
  const confirmado = await showConfirm('Esta ação não pode ser desfeita. Deseja excluir este atleta?', {
    titulo: 'Excluir atleta',
    confirmar: 'Excluir',
    perigo: true,
  });
  if (!confirmado) return;
  try {
    const resposta = await API.deleteLutador(id);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert('Atleta removido com sucesso.', 'success');
    carregarLutadores();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível excluir o atleta.'));
  }
}

function abrirTransferir(idLutador) {
  const atleta = lutadores.find(item => item.id_lutador === idLutador);
  modalTipo = 'transferir';
  editId = idLutador;
  document.getElementById('modal-titulo').textContent = `Transferir: ${atleta?.nome || 'Atleta'}`;
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label>Nova Divisão</label>
      <select id="f-div-transferir">
        <option value="">Selecione...</option>
        ${divisoes
          .map(
            divisao =>
              `<option value="${divisao.id_divisao}">${escapeHtml(divisao.nome_divisao)}</option>`
          )
          .join('')}
      </select></div>`;
  abrirModal();
}

async function salvarTransferir() {
  const idDivisao = document.getElementById('f-div-transferir').value;
  if (!idDivisao) {
    showAlert('Selecione uma divisão antes de transferir.');
    return;
  }
  try {
    const resposta = await API.transferirLutador(editId, idDivisao);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert(resposta?.mensagem || 'Atleta transferido com sucesso.', 'success');
    fecharModal();
    carregarLutadores();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível realizar a transferência.'));
  }
}

async function carregarDivisoes() {
  try {
    divisoes = await API.getDivisoes();
    renderDivisoes(divisoes);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar as divisões.'));
  }
}

function renderDivisoes(lista) {
  const linhas = lista.map(divisao => `<tr>
    <td>${escapeHtml(divisao.nome_divisao)}</td>
    <td>${escapeHtml(divisao.peso_min)} kg</td>
    <td>${escapeHtml(divisao.peso_max)} kg</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" data-action="editar-divisao" data-id="${divisao.id_divisao}">Editar</button>
      <button class="btn btn-ghost btn-sm" data-action="recalcular-divisao" data-id="${divisao.id_divisao}" data-nome="${escapeHtml(divisao.nome_divisao)}">Recalcular</button>
      <button class="btn btn-danger btn-sm" data-action="excluir-divisao" data-id="${divisao.id_divisao}">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-divisoes').innerHTML = montarTabela(
    ['Nome', 'Peso Mín.', 'Peso Máx.', 'Ações'],
    linhas
  );
}

function abrirModalDivisao(dados = null) {
  modalTipo = 'divisao';
  editId = dados ? dados.id_divisao : null;
  const divisao = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Divisão' : 'Nova Divisão';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label>Nome da Divisão</label>
      <input id="f-nome-div" value="${escapeHtml(divisao.nome_divisao || '')}"></div>
    <div class="form-row">
      <div class="form-group"><label>Peso Mín. (kg)</label>
        <input id="f-peso-min" type="number" step="0.1" value="${escapeHtml(divisao.peso_min || '')}"></div>
      <div class="form-group"><label>Peso Máx. (kg)</label>
        <input id="f-peso-max" type="number" step="0.1" value="${escapeHtml(divisao.peso_max || '')}"></div>
    </div>`;
  abrirModal();
}

async function editarDivisao(id) {
  try {
    const divisao = await API.getDivisao(id);
    abrirModalDivisao(divisao);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar a divisão.'));
  }
}

async function salvarDivisao() {
  const payload = {
    nome_divisao: document.getElementById('f-nome-div').value.trim(),
    peso_min: document.getElementById('f-peso-min').value,
    peso_max: document.getElementById('f-peso-max').value,
  };
  if (!payload.nome_divisao) {
    showAlert('O nome da divisão é obrigatório.');
    return;
  }
  try {
    const resposta = editId
      ? await API.updateDivisao(editId, payload)
      : await API.createDivisao(payload);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert(resposta?.mensagem || 'Divisão salva com sucesso.', 'success');
    fecharModal();
    carregarDivisoes();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível salvar a divisão.'));
  }
}

async function recalcularCarteisDivisao(idDivisao, nomeDivisao) {
  const confirmado = await showConfirm(
    `Executar sp_recalcular_carteis_divisao para a divisão ${nomeDivisao}?`,
    { titulo: 'Recalcular cartéis', confirmar: 'Recalcular' }
  );
  if (!confirmado) return;
  try {
    const resposta = await API.recalcularCarteis(idDivisao);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert(resposta?.mensagem || 'Cartéis recalculados com sucesso.', 'success');
    carregarLutadores();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível recalcular os cartéis.'));
  }
}

async function deletarDivisao(id) {
  const confirmado = await showConfirm('Esta ação não pode ser desfeita. Deseja excluir esta divisão?', {
    titulo: 'Excluir divisão',
    confirmar: 'Excluir',
    perigo: true,
  });
  if (!confirmado) return;
  try {
    const resposta = await API.deleteDivisao(id);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert('Divisão removida com sucesso.', 'success');
    carregarDivisoes();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível excluir a divisão.'));
  }
}

async function carregarCards() {
  try {
    cards = await API.getCards();
    renderCards(cards);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar os eventos.'));
  }
}

function renderCards(lista) {
  const linhas = lista.map(evento => `<tr>
    <td>${escapeHtml(evento.cidade)}</td>
    <td>${escapeHtml(evento.data ? evento.data.substring(0, 10) : '-')}</td>
    <td>${escapeHtml(evento.pais)}</td>
    <td>${escapeHtml(evento.quant_lutas)}</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" data-action="editar-card" data-id="${evento.id_card}">Editar</button>
      <button class="btn btn-ghost btn-sm" data-action="ver-lutas-card" data-id="${evento.id_card}">Ver Confrontos</button>
      <button class="btn btn-danger btn-sm" data-action="excluir-card" data-id="${evento.id_card}">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-cards').innerHTML = montarTabela(
    ['Cidade', 'Data', 'País', 'Confrontos', 'Ações'],
    linhas
  );
}

function abrirModalCard(dados = null) {
  modalTipo = 'card';
  editId = dados ? dados.id_card : null;
  const evento = dados || {};
  const dataValor = evento.data ? evento.data.substring(0, 10) : '';
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Evento' : 'Novo Evento';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Cidade</label>
        <input id="f-cidade" value="${escapeHtml(evento.cidade || '')}"></div>
      <div class="form-group"><label>País</label>
        <input id="f-pais" value="${escapeHtml(evento.pais || '')}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Data</label>
        <input id="f-data" type="date" value="${escapeHtml(dataValor)}"></div>
      <div class="form-group"><label>Qtd. Confrontos</label>
        <input id="f-quant-lutas" type="number" value="${escapeHtml(evento.quant_lutas || 0)}"></div>
    </div>`;
  abrirModal();
}

async function editarCard(id) {
  try {
    const evento = await API.getCard(id);
    abrirModalCard(evento);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar o evento.'));
  }
}

async function salvarCard() {
  const payload = {
    cidade: document.getElementById('f-cidade').value.trim(),
    pais: document.getElementById('f-pais').value.trim(),
    data: document.getElementById('f-data').value,
    quant_lutas: document.getElementById('f-quant-lutas').value,
  };
  if (!payload.cidade) {
    showAlert('A cidade do evento é obrigatória.');
    return;
  }
  try {
    const resposta = editId
      ? await API.updateCard(editId, payload)
      : await API.createCard(payload);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert(resposta?.mensagem || 'Evento salvo com sucesso.', 'success');
    fecharModal();
    carregarCards();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível salvar o evento.'));
  }
}

async function deletarCard(id) {
  const confirmado = await showConfirm('Esta ação não pode ser desfeita. Deseja excluir este evento?', {
    titulo: 'Excluir evento',
    confirmar: 'Excluir',
    perigo: true,
  });
  if (!confirmado) return;
  try {
    const resposta = await API.deleteCard(id);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert('Evento removido com sucesso.', 'success');
    carregarCards();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível excluir o evento.'));
  }
}

async function verLutasDoCard(idCard) {
  showSection('lutas');
  document.getElementById('filtro-card').value = idCard;
  document.getElementById('filtro-card').dispatchEvent(new Event('change'));
}

function metodoIgual(a, b) {
  return a && b && String(a).toLowerCase() === String(b).toLowerCase();
}

function validarFormularioLuta(payload) {
  if (!payload.id_desafiante || !payload.id_desafiado) {
    return 'Selecione o desafiante e o desafiado.';
  }
  if (payload.id_desafiante === payload.id_desafiado) {
    return 'O desafiante e o desafiado não podem ser o mesmo atleta.';
  }
  if (!payload.id_card) return 'Selecione o evento.';
  if (!payload.id_visibilidade) return 'Selecione a visibilidade.';
  if (!payload.resultado) return 'Informe o resultado.';
  if (!metodosLuta.some(m => metodoIgual(m, payload.metodo))) {
    return 'Selecione um método de vitória válido.';
  }
  const rounds = Number(payload.quant_rounds);
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 5) {
    return 'Rounds deve estar entre 1 e 5.';
  }
  return null;
}

async function carregarLutas() {
  try {
    if (!visibilidades.length) visibilidades = await API.getVisibilidades();
    if (!cinturoes.length) cinturoes = await API.getCinturoes();
    if (!metodosLuta.length) metodosLuta = await API.getMetodosLuta();
    if (!lutadores.length) lutadores = await API.getLutadores();
    if (!cards.length) cards = await API.getCards();

    const select = document.getElementById('filtro-card');
    if (select.options.length <= 1) {
      cards.forEach(evento => {
        const opcao = document.createElement('option');
        opcao.value = evento.id_card;
        opcao.textContent = `${evento.cidade} (${evento.data ? evento.data.substring(0, 10) : '-'})`;
        select.appendChild(opcao);
      });
    }
    await filtrarLutas();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar os confrontos.'));
  }
}

async function filtrarLutas() {
  const idCard = document.getElementById('filtro-card').value;
  try {
    const lista = await API.getLutas(idCard || null);
    renderLutas(lista);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível filtrar os confrontos.'));
  }
}

function formatarCinturao(confronto) {
  if (!confronto.id_cinturao) return '-';
  const tipo = confronto.tipo_cinturao || '';
  const divisao = confronto.nome_divisao_cinturao || '';
  return divisao ? `${tipo} — ${divisao}` : tipo || String(confronto.id_cinturao);
}

function renderLutas(lista) {
  const linhas = lista.map(confronto => `<tr>
    <td>${escapeHtml(confronto.apelido_desafiante || confronto.id_desafiante)}</td>
    <td>${escapeHtml(confronto.apelido_desafiado || confronto.id_desafiado)}</td>
    <td>${escapeHtml(formatarCinturao(confronto))}</td>
    <td>${escapeHtml(confronto.metodo)}</td>
    <td>${escapeHtml(confronto.resultado)}</td>
    <td>${escapeHtml(confronto.quant_rounds)}</td>
    <td>${escapeHtml(confronto.visibilidade || '-')}</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" data-action="editar-luta" data-id="${confronto.id_luta}">Editar</button>
      <button class="btn btn-danger btn-sm" data-action="excluir-luta" data-id="${confronto.id_luta}">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-lutas').innerHTML = montarTabela(
    ['Desafiante', 'Desafiado', 'Cinturão', 'Método', 'Resultado', 'Rounds', 'Visib.', 'Ações'],
    linhas
  );
}

async function abrirModalLuta(dados = null) {
  if (!metodosLuta.length) {
    try {
      metodosLuta = await API.getMetodosLuta();
    } catch (erro) {
      showAlert(erroApi(erro, 'Não foi possível carregar os métodos de vitória.'));
      return;
    }
  }
  modalTipo = 'luta';
  editId = dados ? dados.id_luta : null;
  const confronto = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Confronto' : 'Novo Confronto';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Desafiante</label>
        <select id="f-desafiante">
          <option value="">Selecione...</option>
          ${lutadores
            .map(
              atleta =>
                `<option value="${atleta.id_lutador}" ${confronto.id_desafiante == atleta.id_lutador ? 'selected' : ''}>${escapeHtml(atleta.apelido)} - ${escapeHtml(atleta.nome)}</option>`
            )
            .join('')}
        </select></div>
      <div class="form-group"><label>Desafiado</label>
        <select id="f-desafiado">
          <option value="">Selecione...</option>
          ${lutadores
            .map(
              atleta =>
                `<option value="${atleta.id_lutador}" ${confronto.id_desafiado == atleta.id_lutador ? 'selected' : ''}>${escapeHtml(atleta.apelido)} - ${escapeHtml(atleta.nome)}</option>`
            )
            .join('')}
        </select></div>
    </div>
    <div class="form-group"><label>Evento</label>
      <select id="f-card">
        <option value="">Selecione...</option>
        ${cards
          .map(
            evento =>
              `<option value="${evento.id_card}" ${confronto.id_card == evento.id_card ? 'selected' : ''}>${escapeHtml(evento.cidade)} (${evento.data ? evento.data.substring(0, 10) : '-'})</option>`
          )
          .join('')}
      </select></div>
    <div class="form-group"><label>Disputa de Cinturão</label>
      <select id="f-cinturao">
        <option value="">Não — luta comum</option>
        ${cinturoes
          .map(
            c =>
              `<option value="${c.id_cinturao}" ${confronto.id_cinturao == c.id_cinturao ? 'selected' : ''}>${escapeHtml(c.tipo_cinturao)} — ${escapeHtml(c.nome_divisao)}</option>`
          )
          .join('')}
      </select></div>
    <div class="form-row">
      <div class="form-group"><label>Método</label>
        <select id="f-metodo" required>
          ${metodosLuta
            .map(
              metodo =>
                `<option value="${escapeHtml(metodo)}" ${metodoIgual(confronto.metodo, metodo) ? 'selected' : ''}>${escapeHtml(metodo)}</option>`
            )
            .join('')}
        </select></div>
      <div class="form-group"><label>Resultado</label>
        <input id="f-resultado" value="${escapeHtml(confronto.resultado || '')}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Rounds</label>
        <input id="f-rounds" type="number" min="1" max="5" value="${escapeHtml(confronto.quant_rounds || 3)}"></div>
      <div class="form-group"><label>Visibilidade</label>
        <select id="f-visibilidade">
          <option value="">Selecione...</option>
          ${visibilidades
            .map(
              item =>
                `<option value="${item.id_visibilidade}" ${confronto.id_visibilidade == item.id_visibilidade ? 'selected' : ''}>${escapeHtml(item.visibilidade)}</option>`
            )
            .join('')}
        </select></div>
    </div>`;
  abrirModal();
}

async function editarLuta(id) {
  try {
    const confronto = await API.getLuta(id);
    abrirModalLuta(confronto);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar o confronto.'));
  }
}

async function salvarLuta() {
  const payload = {
    metodo: document.getElementById('f-metodo').value,
    resultado: document.getElementById('f-resultado').value.trim(),
    quant_rounds: document.getElementById('f-rounds').value,
    id_desafiante: document.getElementById('f-desafiante').value,
    id_desafiado: document.getElementById('f-desafiado').value,
    id_card: document.getElementById('f-card').value,
    id_visibilidade: document.getElementById('f-visibilidade').value,
    id_cinturao: document.getElementById('f-cinturao').value,
  };
  const erroValidacao = validarFormularioLuta(payload);
  if (erroValidacao) {
    showAlert(erroValidacao);
    return;
  }
  try {
    const resposta = editId
      ? await API.updateLuta(editId, payload)
      : await API.createLuta(payload);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert(resposta?.mensagem || 'Confronto salvo com sucesso.', 'success');
    fecharModal();
    filtrarLutas();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível salvar o confronto.'));
  }
}

async function deletarLuta(id) {
  const confirmado = await showConfirm('Esta ação não pode ser desfeita. Deseja excluir este confronto?', {
    titulo: 'Excluir confronto',
    confirmar: 'Excluir',
    perigo: true,
  });
  if (!confirmado) return;
  try {
    const resposta = await API.deleteLuta(id);
    if (resposta?.erro) {
      showAlert(resposta.erro);
      return;
    }
    showAlert('Confronto removido com sucesso.', 'success');
    filtrarLutas();
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível excluir o confronto.'));
  }
}

async function carregarCampeoes() {
  try {
    const lista = await API.getCampeoes();
    const container = document.getElementById('tabela-campeoes');
    if (!Array.isArray(lista) || !lista.length) {
      container.innerHTML =
        '<div class="empty-state"><div class="icon">—</div><p>Nenhum cinturão registrado</p></div>';
      return;
    }
    container.innerHTML =
      montarIndicadorResumo(lista.length, 'Cinturões em disputa') + montarTabelaDados(lista);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar os cinturões.'));
  }
}

async function carregarAtividade() {
  try {
    const lista = await API.getAtividade();
    const container = document.getElementById('tabela-atividade');
    if (!Array.isArray(lista) || !lista.length) {
      container.innerHTML =
        '<div class="empty-state"><div class="icon">—</div><p>Sem dados de desempenho</p></div>';
      return;
    }
    container.innerHTML =
      montarIndicadorResumo(lista.length, 'Atletas monitorados') + montarTabelaDados(lista);
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar o desempenho.'));
  }
}

async function carregarConsultas() {
  await prepararFiltrosConsulta();
  await showConsulta(consultaAtiva);
}

async function prepararFiltrosConsulta() {
  if (!divisoes.length) {
    try {
      divisoes = await API.getDivisoes();
    } catch {
      divisoes = [];
    }
  }
  const select = document.getElementById('filtro-consulta-divisao');
  if (select) {
    select.innerHTML =
      '<option value="">Todas as divisões</option>' +
      divisoes
        .map(
          divisao =>
            `<option value="${divisao.id_divisao}">${escapeHtml(divisao.nome_divisao)}</option>`
        )
        .join('');
  }
}

async function showConsulta(tipoConsulta) {
  consultaAtiva = tipoConsulta;
  document.querySelectorAll('.tab-btn').forEach(botao => botao.classList.remove('active'));
  document.querySelector(`.tab-btn[data-consulta="${tipoConsulta}"]`)?.classList.add('active');

  const filtrosDivisao = document.getElementById('filtros-consulta-divisao');
  const filtrosPeso = document.getElementById('filtros-consulta-peso');
  filtrosDivisao.classList.toggle('hidden', tipoConsulta !== 'lutadores-acima-media');
  filtrosPeso.classList.toggle('hidden', tipoConsulta !== 'lutadores-por-divisao');

  const container = document.getElementById('consulta-resultado');
  container.innerHTML = '<div class="empty-state"><div class="icon">—</div><p>Carregando...</p></div>';

  try {
    let lista;
    if (tipoConsulta === 'lutadores-por-divisao') {
      const pesoMinimo = document.getElementById('filtro-peso-min').value || 70;
      const minimoAtletas = document.getElementById('filtro-min-atletas').value || 3;
      lista = await API.getLutadoresPorDivisao(pesoMinimo, minimoAtletas);
    } else if (tipoConsulta === 'lutadores-acima-media') {
      const idDivisao = document.getElementById('filtro-consulta-divisao').value;
      lista = await API.getLutadoresAcimaDaMedia(idDivisao || null);
    } else if (tipoConsulta === 'lutas-titulo') {
      lista = await API.getLutasTitulo();
    }

    if (!Array.isArray(lista) || !lista.length) {
      container.innerHTML =
        '<div class="empty-state"><div class="icon">—</div><p>Nenhum resultado</p></div>';
      return;
    }

    let graficoHtml = '';
    if (tipoConsulta === 'lutadores-por-divisao') {
      graficoHtml = '<div id="consulta-chart" class="consulta-chart"></div>';
    } else if (tipoConsulta === 'lutas-titulo') {
      graficoHtml = `<div class="view-summary"><div class="view-summary-value">${lista.length}</div><div class="view-summary-label">Lutas de título por nocaute</div></div>`;
    }

    container.innerHTML = graficoHtml + montarTabelaDados(lista);

    if (tipoConsulta === 'lutadores-por-divisao') {
      const dadosGrafico = lista.map(item => ({
        label: item.nome_divisao,
        value: Number(item.total_lutadores) || 0,
      }));
      Charts.bar(document.getElementById('consulta-chart'), dadosGrafico);
    }
  } catch (erro) {
    showAlert(erroApi(erro, 'Não foi possível carregar a consulta.'));
    container.innerHTML =
      '<div class="empty-state"><div class="icon">—</div><p>Não foi possível carregar os dados</p></div>';
  }
}

function salvar() {
  const acoes = {
    lutador: salvarLutador,
    transferir: salvarTransferir,
    divisao: salvarDivisao,
    card: salvarCard,
    luta: salvarLuta,
  };
  if (acoes[modalTipo]) acoes[modalTipo]();
}

document.addEventListener('click', evento => {
  const botaoPeriodo = evento.target.closest('.filter-btn[data-period]');
  if (botaoPeriodo) {
    const card = botaoPeriodo.closest('.chart-card');
    card.querySelectorAll('.filter-btn').forEach(botao => botao.classList.remove('active'));
    botaoPeriodo.classList.add('active');
    const periodo = botaoPeriodo.dataset.period;
    const dados =
      periodo === '6m'
        ? eventosPorMes.slice(-6)
        : periodo === '12m'
          ? eventosPorMes.slice(-12)
          : eventosPorMes;
    Charts.line(document.getElementById('chart-line-eventos'), dados);
    return;
  }

  const botaoAcao = evento.target.closest('[data-action]');
  if (!botaoAcao) return;
  const acao = botaoAcao.dataset.action;
  const id = Number(botaoAcao.dataset.id);

  if (acao === 'editar-lutador') editarLutador(id);
  if (acao === 'transferir-lutador') abrirTransferir(id);
  if (acao === 'excluir-lutador') deletarLutador(id);
  if (acao === 'editar-divisao') editarDivisao(id);
  if (acao === 'recalcular-divisao') recalcularCarteisDivisao(id, botaoAcao.dataset.nome);
  if (acao === 'excluir-divisao') deletarDivisao(id);
  if (acao === 'editar-card') editarCard(id);
  if (acao === 'ver-lutas-card') verLutasDoCard(id);
  if (acao === 'excluir-card') deletarCard(id);
  if (acao === 'editar-luta') editarLuta(id);
  if (acao === 'excluir-luta') deletarLuta(id);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => showSection(item.dataset.section));
  });
  document.getElementById('filtro-card')?.addEventListener('change', filtrarLutas);
  document.getElementById('filtro-peso-min')?.addEventListener('change', () => showConsulta(consultaAtiva));
  document.getElementById('filtro-min-atletas')?.addEventListener('change', () => showConsulta(consultaAtiva));
  document.getElementById('filtro-consulta-divisao')?.addEventListener('change', () => showConsulta(consultaAtiva));
  document.addEventListener('keydown', evento => {
    if (evento.key !== 'Escape') return;
    if (!document.getElementById('confirm-overlay').classList.contains('hidden')) return;
    fecharModal();
  });
  showSection('dashboard');
});
