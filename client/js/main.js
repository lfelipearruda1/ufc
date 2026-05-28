/* ── Estado global ─────────────────────────────────── */
let divisoes   = [];
let lutadores  = [];
let cards      = [];
let visibilidades = [];
let editId     = null;
let modalTipo  = null;

/* ── Navegação ─────────────────────────────────────── */
function showSection(nome) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + nome).classList.add('active');
  document.querySelector(`.nav-item[data-section="${nome}"]`).classList.add('active');
  document.getElementById('topbar-title').textContent = {
    lutadores: 'Lutadores', divisoes: 'Divisões', cards: 'Cards', lutas: 'Lutas',
    campeoes: 'Campeões', atividade: 'Atividade', consultas: 'Consultas', logs: 'Logs'
  }[nome] || nome;
  loaders[nome] && loaders[nome]();
}

/* ── Utilitários ───────────────────────────────────── */
function badge(cls) {
  return `<span class="badge ${cls}">`;
}

function classificacaoBadge(c) {
  const map = {
    'Elite':      'badge-elite',
    'Experiente': 'badge-exp',
    'Promessa':   'badge-promessa',
    'Estreante':  'badge-estreante',
  };
  return `<span class="badge ${map[c] || 'badge-estreante'}">${c || '-'}</span>`;
}

function tbl(headers, rows) {
  if (!rows.length) return `<div class="empty-state"><div class="icon">🥊</div><p>Nenhum registro encontrado</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table></div>`;
}

function showAlert(msg, tipo = 'error') {
  const el = document.getElementById('alert-box');
  el.className = `alert alert-${tipo}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

/* ── Modal ─────────────────────────────────────────── */
function abrirModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editId = null;
  modalTipo = null;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });

/* ════════════════════════════════════════════════════
   LUTADORES
════════════════════════════════════════════════════ */
async function carregarLutadores() {
  divisoes = await API.getDivisoes();
  const select = document.getElementById('filtro-divisao');
  select.innerHTML = '<option value="">Todas as divisões</option>' +
    divisoes.map(d => `<option value="${d.id_divisao}">${d.nome_divisao}</option>`).join('');
  await filtrarLutadores();
}

async function filtrarLutadores() {
  const idDiv = document.getElementById('filtro-divisao').value;
  try {
    lutadores = await API.getLutadores(idDiv || null);
    renderLutadores(lutadores);
  } catch(e) { showAlert('Erro ao carregar lutadores: ' + e.message); }
}

function renderLutadores(lista) {
  const rows = lista.map(l => `<tr>
    <td>${l.nome}</td>
    <td>${l.apelido}</td>
    <td>${l.cartel}</td>
    <td>${l.peso} kg</td>
    <td>${l.nacionalidade}</td>
    <td>${l.nome_divisao || '-'}</td>
    <td>${classificacaoBadge(l.classificacao)}</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" onclick="editarLutador(${l.id_lutador})">Editar</button>
      <button class="btn btn-ghost btn-sm" onclick="abrirTransferir(${l.id_lutador}, '${l.nome}')">Transferir</button>
      <button class="btn btn-danger btn-sm" onclick="deletarLutador(${l.id_lutador})">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-lutadores').innerHTML =
    tbl(['Nome','Apelido','Cartel','Peso','Nac.','Divisão','Class.','Ações'], rows);
}

function abrirModalLutador(dados = null) {
  modalTipo = 'lutador';
  editId = dados ? dados.id_lutador : null;
  const d = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Lutador' : 'Novo Lutador';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Nome</label>
        <input id="f-nome" value="${d.nome||''}"></div>
      <div class="form-group"><label>Apelido</label>
        <input id="f-apelido" value="${d.apelido||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Peso (kg)</label>
        <input id="f-peso" type="number" step="0.1" value="${d.peso||''}"></div>
      <div class="form-group"><label>Cartel (V-D-E)</label>
        <input id="f-cartel" placeholder="0-0-0" value="${d.cartel||''}"></div>
    </div>
    <div class="form-group"><label>Nacionalidade</label>
      <input id="f-nac" value="${d.nacionalidade||''}"></div>
    <div class="form-group"><label>Divisão</label>
      <select id="f-divisao">
        <option value="">Selecione...</option>
        ${divisoes.map(div => `<option value="${div.id_divisao}" ${d.id_divisao==div.id_divisao?'selected':''}>${div.nome_divisao}</option>`).join('')}
      </select></div>`;
  abrirModal();
}

async function editarLutador(id) {
  if (!divisoes.length) divisoes = await API.getDivisoes();
  const l = await API.getLutador(id);
  abrirModalLutador(l);
}

async function salvarLutador() {
  const payload = {
    nome: document.getElementById('f-nome').value,
    apelido: document.getElementById('f-apelido').value,
    peso: document.getElementById('f-peso').value,
    cartel: document.getElementById('f-cartel').value,
    nacionalidade: document.getElementById('f-nac').value,
    id_divisao: document.getElementById('f-divisao').value,
  };
  try {
    const res = editId ? await API.updateLutador(editId, payload) : await API.createLutador(payload);
    if (res.erro) { showAlert(res.erro); return; }
    showAlert(res.mensagem || 'Salvo!', 'success');
    fecharModal();
    carregarLutadores();
  } catch(e) { showAlert(e.message); }
}

async function deletarLutador(id) {
  if (!confirm('Confirma exclusão do lutador?')) return;
  const res = await API.deleteLutador(id);
  if (res.erro) { showAlert(res.erro); return; }
  showAlert('Lutador removido', 'success');
  carregarLutadores();
}

// Modal de transferência de divisão
function abrirTransferir(id, nome) {
  modalTipo = 'transferir';
  editId = id;
  document.getElementById('modal-titulo').textContent = `Transferir: ${nome}`;
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label>Nova Divisão</label>
      <select id="f-div-transferir">
        <option value="">Selecione...</option>
        ${divisoes.map(d => `<option value="${d.id_divisao}">${d.nome_divisao}</option>`).join('')}
      </select></div>`;
  abrirModal();
}

async function salvarTransferir() {
  const idDivisao = document.getElementById('f-div-transferir').value;
  if (!idDivisao) { showAlert('Selecione uma divisão'); return; }
  try {
    const res = await API.transferirLutador(editId, idDivisao);
    if (res.erro) { showAlert(res.erro); return; }
    showAlert(res.mensagem || 'Transferido!', 'success');
    fecharModal();
    carregarLutadores();
  } catch(e) { showAlert(e.message); }
}

/* ════════════════════════════════════════════════════
   DIVISÕES
════════════════════════════════════════════════════ */
async function carregarDivisoes() {
  try {
    divisoes = await API.getDivisoes();
    renderDivisoes(divisoes);
  } catch(e) { showAlert('Erro ao carregar divisões: ' + e.message); }
}

function renderDivisoes(lista) {
  const rows = lista.map(d => `<tr>
    <td>${d.nome_divisao}</td>
    <td>${d.peso_min} kg</td>
    <td>${d.peso_max} kg</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" onclick="editarDivisao(${d.id_divisao})">Editar</button>
      <button class="btn btn-danger btn-sm" onclick="deletarDivisao(${d.id_divisao})">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-divisoes').innerHTML =
    tbl(['Nome','Peso Mín.','Peso Máx.','Ações'], rows);
}

function abrirModalDivisao(dados = null) {
  modalTipo = 'divisao';
  editId = dados ? dados.id_divisao : null;
  const d = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Divisão' : 'Nova Divisão';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label>Nome da Divisão</label>
      <input id="f-nome-div" value="${d.nome_divisao||''}"></div>
    <div class="form-row">
      <div class="form-group"><label>Peso Mín. (kg)</label>
        <input id="f-peso-min" type="number" step="0.1" value="${d.peso_min||''}"></div>
      <div class="form-group"><label>Peso Máx. (kg)</label>
        <input id="f-peso-max" type="number" step="0.1" value="${d.peso_max||''}"></div>
    </div>`;
  abrirModal();
}

async function editarDivisao(id) {
  const d = await API.getDivisao(id);
  abrirModalDivisao(d);
}

async function salvarDivisao() {
  const payload = {
    nome_divisao: document.getElementById('f-nome-div').value,
    peso_min: document.getElementById('f-peso-min').value,
    peso_max: document.getElementById('f-peso-max').value,
  };
  try {
    const res = editId ? await API.updateDivisao(editId, payload) : await API.createDivisao(payload);
    if (res.erro) { showAlert(res.erro); return; }
    showAlert(res.mensagem || 'Salvo!', 'success');
    fecharModal();
    carregarDivisoes();
  } catch(e) { showAlert(e.message); }
}

async function deletarDivisao(id) {
  if (!confirm('Confirma exclusão da divisão?')) return;
  const res = await API.deleteDivisao(id);
  if (res.erro) { showAlert(res.erro); return; }
  showAlert('Divisão removida', 'success');
  carregarDivisoes();
}

/* ════════════════════════════════════════════════════
   CARDS
════════════════════════════════════════════════════ */
async function carregarCards() {
  try {
    cards = await API.getCards();
    renderCards(cards);
  } catch(e) { showAlert('Erro ao carregar cards: ' + e.message); }
}

function renderCards(lista) {
  const rows = lista.map(c => `<tr>
    <td>${c.cidade}</td>
    <td>${c.data ? c.data.substring(0,10) : '-'}</td>
    <td>${c.pais}</td>
    <td>${c.quant_lutas}</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" onclick="editarCard(${c.id_card})">Editar</button>
      <button class="btn btn-ghost btn-sm" onclick="verLutasDoCard(${c.id_card}, '${c.cidade}')">Ver Lutas</button>
      <button class="btn btn-danger btn-sm" onclick="deletarCard(${c.id_card})">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-cards').innerHTML =
    tbl(['Cidade','Data','País','Lutas','Ações'], rows);
}

function abrirModalCard(dados = null) {
  modalTipo = 'card';
  editId = dados ? dados.id_card : null;
  const d = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Card' : 'Novo Card';
  const dataVal = d.data ? d.data.substring(0,10) : '';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Cidade</label>
        <input id="f-cidade" value="${d.cidade||''}"></div>
      <div class="form-group"><label>País</label>
        <input id="f-pais" value="${d.pais||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Data</label>
        <input id="f-data" type="date" value="${dataVal}"></div>
      <div class="form-group"><label>Qtd. Lutas</label>
        <input id="f-quant-lutas" type="number" value="${d.quant_lutas||0}"></div>
    </div>`;
  abrirModal();
}

async function editarCard(id) {
  const c = await API.getCard(id);
  abrirModalCard(c);
}

async function salvarCard() {
  const payload = {
    cidade: document.getElementById('f-cidade').value,
    pais: document.getElementById('f-pais').value,
    data: document.getElementById('f-data').value,
    quant_lutas: document.getElementById('f-quant-lutas').value,
  };
  try {
    const res = editId ? await API.updateCard(editId, payload) : await API.createCard(payload);
    if (res.erro) { showAlert(res.erro); return; }
    showAlert(res.mensagem || 'Salvo!', 'success');
    fecharModal();
    carregarCards();
  } catch(e) { showAlert(e.message); }
}

async function deletarCard(id) {
  if (!confirm('Confirma exclusão do card?')) return;
  const res = await API.deleteCard(id);
  if (res.erro) { showAlert(res.erro); return; }
  showAlert('Card removido', 'success');
  carregarCards();
}

async function verLutasDoCard(idCard, cidade) {
  showSection('lutas');
  document.getElementById('filtro-card').value = idCard;
  document.getElementById('filtro-card').dispatchEvent(new Event('change'));
}

/* ════════════════════════════════════════════════════
   LUTAS
════════════════════════════════════════════════════ */
async function carregarLutas() {
  if (!visibilidades.length) visibilidades = await API.getVisibilidades();
  if (!lutadores.length)    lutadores = await API.getLutadores();
  if (!cards.length)        cards = await API.getCards();

  // popula filtro de cards
  const sel = document.getElementById('filtro-card');
  if (sel.options.length <= 1) {
    cards.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id_card;
      o.textContent = `${c.cidade} (${c.data ? c.data.substring(0,10) : '-'})`;
      sel.appendChild(o);
    });
  }
  await filtrarLutas();
}

async function filtrarLutas() {
  const idCard = document.getElementById('filtro-card').value;
  try {
    const lista = await API.getLutas(idCard || null);
    renderLutas(lista);
  } catch(e) { showAlert('Erro ao carregar lutas: ' + e.message); }
}

function renderLutas(lista) {
  const rows = lista.map(l => `<tr>
    <td>${l.apelido_desafiante || l.id_desafiante}</td>
    <td>${l.apelido_desafiado  || l.id_desafiado}</td>
    <td>${l.metodo}</td>
    <td>${l.resultado}</td>
    <td>${l.quant_rounds}</td>
    <td>${l.visibilidade || '-'}</td>
    <td class="actions">
      <button class="btn btn-ghost btn-sm" onclick="editarLuta(${l.id_luta})">Editar</button>
      <button class="btn btn-danger btn-sm" onclick="deletarLuta(${l.id_luta})">Excluir</button>
    </td>
  </tr>`);
  document.getElementById('tabela-lutas').innerHTML =
    tbl(['Desafiante','Desafiado','Método','Resultado','Rounds','Visib.','Ações'], rows);
}

function abrirModalLuta(dados = null) {
  modalTipo = 'luta';
  editId = dados ? dados.id_luta : null;
  const d = dados || {};
  document.getElementById('modal-titulo').textContent = dados ? 'Editar Luta' : 'Nova Luta';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label>Desafiante</label>
        <select id="f-desafiante">
          <option value="">Selecione...</option>
          ${lutadores.map(l => `<option value="${l.id_lutador}" ${d.id_desafiante==l.id_lutador?'selected':''}>${l.apelido} - ${l.nome}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Desafiado</label>
        <select id="f-desafiado">
          <option value="">Selecione...</option>
          ${lutadores.map(l => `<option value="${l.id_lutador}" ${d.id_desafiado==l.id_lutador?'selected':''}>${l.apelido} - ${l.nome}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-group"><label>Card</label>
      <select id="f-card">
        <option value="">Selecione...</option>
        ${cards.map(c => `<option value="${c.id_card}" ${d.id_card==c.id_card?'selected':''}>${c.cidade} (${c.data?c.data.substring(0,10):'-'})</option>`).join('')}
      </select></div>
    <div class="form-row">
      <div class="form-group"><label>Método</label>
        <select id="f-metodo">
          ${['Nocaute','Nocaute técnico','Finalização','Decisão unânime','Decisão dividida','Decisão majoritária','Desqualificação','Sem contestação'].map(m => `<option ${d.metodo===m?'selected':''}>${m}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Resultado</label>
        <input id="f-resultado" value="${d.resultado||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Rounds</label>
        <input id="f-rounds" type="number" min="1" max="5" value="${d.quant_rounds||3}"></div>
      <div class="form-group"><label>Visibilidade</label>
        <select id="f-visibilidade">
          <option value="">Selecione...</option>
          ${visibilidades.map(v => `<option value="${v.id_visibilidade}" ${d.id_visibilidade==v.id_visibilidade?'selected':''}>${v.visibilidade}</option>`).join('')}
        </select></div>
    </div>`;
  abrirModal();
}

async function editarLuta(id) {
  const l = await API.getLuta(id);
  abrirModalLuta(l);
}

async function salvarLuta() {
  const payload = {
    metodo: document.getElementById('f-metodo').value,
    resultado: document.getElementById('f-resultado').value,
    quant_rounds: document.getElementById('f-rounds').value,
    id_desafiante: document.getElementById('f-desafiante').value,
    id_desafiado: document.getElementById('f-desafiado').value,
    id_card: document.getElementById('f-card').value,
    id_visibilidade: document.getElementById('f-visibilidade').value,
  };
  try {
    const res = editId ? await API.updateLuta(editId, payload) : await API.createLuta(payload);
    if (res.erro) { showAlert(res.erro); return; }
    showAlert(res.mensagem || 'Salvo!', 'success');
    fecharModal();
    filtrarLutas();
  } catch(e) { showAlert(e.message); }
}

async function deletarLuta(id) {
  if (!confirm('Confirma exclusão da luta?')) return;
  const res = await API.deleteLuta(id);
  if (res.erro) { showAlert(res.erro); return; }
  showAlert('Luta removida', 'success');
  filtrarLutas();
}

/* ════════════════════════════════════════════════════
   CAMPEÕES (view)
════════════════════════════════════════════════════ */
async function carregarCampeoes() {
  try {
    const lista = await API.getCampeoes();
    if (!Array.isArray(lista)) { document.getElementById('tabela-campeoes').innerHTML = `<div class="alert alert-error">${lista.erro||'Erro'}</div>`; return; }
    if (!lista.length) { document.getElementById('tabela-campeoes').innerHTML = '<div class="empty-state"><div class="icon">🏆</div><p>Nenhum campeão registrado</p></div>'; return; }
    const cols = Object.keys(lista[0]);
    const rows = lista.map(r => '<tr>' + cols.map(c => `<td>${r[c]??'-'}</td>`).join('') + '</tr>');
    document.getElementById('tabela-campeoes').innerHTML = tbl(cols, rows);
  } catch(e) { showAlert('Erro ao carregar campeões: ' + e.message); }
}

/* ════════════════════════════════════════════════════
   ATIVIDADE (view)
════════════════════════════════════════════════════ */
async function carregarAtividade() {
  try {
    const lista = await API.getAtividade();
    if (!Array.isArray(lista)) { document.getElementById('tabela-atividade').innerHTML = `<div class="alert alert-error">${lista.erro||'Erro'}</div>`; return; }
    if (!lista.length) { document.getElementById('tabela-atividade').innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>Sem dados de atividade</p></div>'; return; }
    const cols = Object.keys(lista[0]);
    const rows = lista.map(r => '<tr>' + cols.map(c => `<td>${r[c]??'-'}</td>`).join('') + '</tr>');
    document.getElementById('tabela-atividade').innerHTML = tbl(cols, rows);
  } catch(e) { showAlert('Erro ao carregar atividade: ' + e.message); }
}

/* ════════════════════════════════════════════════════
   CONSULTAS
════════════════════════════════════════════════════ */
let consultaAtiva = 'lutadores-por-divisao';

async function carregarConsultas() {
  await showConsulta(consultaAtiva);
}

async function showConsulta(tipo) {
  consultaAtiva = tipo;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[data-consulta="${tipo}"]`)?.classList.add('active');

  const el = document.getElementById('consulta-resultado');
  el.innerHTML = '<div class="empty-state"><div class="icon">⏳</div><p>Carregando...</p></div>';

  try {
    const fnMap = {
      'lutadores-por-divisao':   API.getLutadoresPorDivisao,
      'lutas-titulo':            API.getLutasTitulo,
      'divisoes-sem-cinturao':   API.getDivisoesSemCinturao,
      'lutadores-acima-media':   API.getLutadoresAcimaDaMedia,
    };
    const lista = await fnMap[tipo]();
    if (!Array.isArray(lista) || !lista.length) {
      el.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>Nenhum resultado</p></div>';
      return;
    }
    const cols = Object.keys(lista[0]);
    const rows = lista.map(r => '<tr>' + cols.map(c => `<td>${r[c]??'-'}</td>`).join('') + '</tr>');
    el.innerHTML = tbl(cols, rows);
  } catch(e) { el.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
}

/* ════════════════════════════════════════════════════
   LOGS
════════════════════════════════════════════════════ */
async function carregarLogs() {
  try {
    const lista = await API.getLogsCinturao();
    if (!Array.isArray(lista)) { document.getElementById('tabela-logs').innerHTML = `<div class="alert alert-error">${lista.erro||'Erro'}</div>`; return; }
    if (!lista.length) { document.getElementById('tabela-logs').innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>Nenhum log encontrado</p></div>'; return; }
    const cols = Object.keys(lista[0]);
    const rows = lista.map(r => '<tr>' + cols.map(c => `<td>${r[c]??'-'}</td>`).join('') + '</tr>');
    document.getElementById('tabela-logs').innerHTML = tbl(cols, rows);
  } catch(e) { showAlert('Erro ao carregar logs: ' + e.message); }
}

/* ════════════════════════════════════════════════════
   SALVAR (dispatch do modal)
════════════════════════════════════════════════════ */
function salvar() {
  const map = {
    lutador: salvarLutador,
    transferir: salvarTransferir,
    divisao: salvarDivisao,
    card: salvarCard,
    luta: salvarLuta,
  };
  map[modalTipo] && map[modalTipo]();
}

/* ════════════════════════════════════════════════════
   LOADERS por seção
════════════════════════════════════════════════════ */
const loaders = {
  lutadores:  carregarLutadores,
  divisoes:   carregarDivisoes,
  cards:      carregarCards,
  lutas:      carregarLutas,
  campeoes:   carregarCampeoes,
  atividade:  carregarAtividade,
  consultas:  carregarConsultas,
  logs:       carregarLogs,
};

/* ════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // navegação
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => showSection(item.dataset.section));
  });

  // filtro de lutas por card
  document.getElementById('filtro-card')?.addEventListener('change', filtrarLutas);

  // inicia na tela de lutadores
  showSection('lutadores');
});
