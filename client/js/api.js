const BASE = 'http://localhost:8080';

async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ── Lutadores ──────────────────────────────
const API = {
  getLutadores:    (divisao) => req('GET', '/api/lutadores' + (divisao ? `?divisao=${divisao}` : '')),
  getLutador:      (id)      => req('GET', `/api/lutadores/${id}`),
  createLutador:   (d)       => req('POST', '/api/lutadores', d),
  updateLutador:   (id, d)   => req('PUT', `/api/lutadores/${id}`, d),
  deleteLutador:   (id)      => req('DELETE', `/api/lutadores/${id}`),
  transferirLutador: (id, idDivisao) => req('POST', `/api/lutadores/${id}/transferir`, { id_divisao: idDivisao }),

  // ── Divisões ──────────────────────────────
  getDivisoes:  ()     => req('GET', '/api/divisoes'),
  getDivisao:   (id)   => req('GET', `/api/divisoes/${id}`),
  createDivisao: (d)   => req('POST', '/api/divisoes', d),
  updateDivisao: (id, d) => req('PUT', `/api/divisoes/${id}`, d),
  deleteDivisao: (id)  => req('DELETE', `/api/divisoes/${id}`),

  // ── Cards ─────────────────────────────────
  getCards:    ()     => req('GET', '/api/cards'),
  getCard:     (id)   => req('GET', `/api/cards/${id}`),
  createCard:  (d)    => req('POST', '/api/cards', d),
  updateCard:  (id, d) => req('PUT', `/api/cards/${id}`, d),
  deleteCard:  (id)   => req('DELETE', `/api/cards/${id}`),

  // ── Lutas ─────────────────────────────────
  getLutas:    (card) => req('GET', '/api/lutas' + (card ? `?card=${card}` : '')),
  getLuta:     (id)   => req('GET', `/api/lutas/${id}`),
  createLuta:  (d)    => req('POST', '/api/lutas', d),
  updateLuta:  (id, d) => req('PUT', `/api/lutas/${id}`, d),
  deleteLuta:  (id)   => req('DELETE', `/api/lutas/${id}`),

  // ── Auxiliares ────────────────────────────
  getVisibilidades: () => req('GET', '/api/visibilidades'),

  // ── Views ─────────────────────────────────
  getCampeoes:  () => req('GET', '/api/views/cinturoes'),
  getAtividade: () => req('GET', '/api/views/atividade'),

  // ── Consultas ─────────────────────────────
  getLutadoresPorDivisao:   () => req('GET', '/api/consultas/lutadores-por-divisao'),
  getLutasTitulo:           () => req('GET', '/api/consultas/lutas-titulo'),
  getDivisoesSemCinturao:   () => req('GET', '/api/consultas/divisoes-sem-cinturao'),
  getLutadoresAcimaDaMedia: () => req('GET', '/api/consultas/lutadores-acima-media'),

  // ── Logs ──────────────────────────────────
  getLogsCinturao: () => req('GET', '/api/logs/cinturao'),
};
