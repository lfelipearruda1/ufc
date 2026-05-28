const BASE = 'http://localhost:8080';

function criarErroApi(mensagem) {
  const erro = new Error(mensagem);
  erro.fromApi = true;
  return erro;
}

async function requisicao(metodo, caminho, corpo) {
  const opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (corpo !== undefined) opcoes.body = JSON.stringify(corpo);

  let resposta;
  try {
    resposta = await fetch(BASE + caminho, opcoes);
  } catch {
    throw criarErroApi('Servidor indisponível. Verifique se o servidor está em execução.');
  }

  const texto = await resposta.text();
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw criarErroApi(resposta.ok ? 'Resposta inesperada do servidor.' : `Erro ${resposta.status}.`);
  }

  if (!resposta.ok) {
    throw criarErroApi(dados?.erro || dados?.mensagem || `Erro ${resposta.status}.`);
  }

  return dados;
}

const API = {
  getLutadores: (idDivisao) =>
    requisicao('GET', '/api/lutadores' + (idDivisao ? `?divisao=${idDivisao}` : '')),
  getLutador: (id) => requisicao('GET', `/api/lutadores/${id}`),
  createLutador: (dados) => requisicao('POST', '/api/lutadores', dados),
  updateLutador: (id, dados) => requisicao('PUT', `/api/lutadores/${id}`, dados),
  deleteLutador: (id) => requisicao('DELETE', `/api/lutadores/${id}`),
  transferirLutador: (id, idDivisao) =>
    requisicao('POST', `/api/lutadores/${id}/transferir`, { id_divisao: idDivisao }),

  getDivisoes: () => requisicao('GET', '/api/divisoes'),
  getDivisao: (id) => requisicao('GET', `/api/divisoes/${id}`),
  createDivisao: (dados) => requisicao('POST', '/api/divisoes', dados),
  updateDivisao: (id, dados) => requisicao('PUT', `/api/divisoes/${id}`, dados),
  deleteDivisao: (id) => requisicao('DELETE', `/api/divisoes/${id}`),
  recalcularCarteis: (id) => requisicao('POST', `/api/divisoes/${id}/recalcular`),

  getCards: () => requisicao('GET', '/api/cards'),
  getCard: (id) => requisicao('GET', `/api/cards/${id}`),
  createCard: (dados) => requisicao('POST', '/api/cards', dados),
  updateCard: (id, dados) => requisicao('PUT', `/api/cards/${id}`, dados),
  deleteCard: (id) => requisicao('DELETE', `/api/cards/${id}`),

  getLutas: (idCard) => requisicao('GET', '/api/lutas' + (idCard ? `?card=${idCard}` : '')),
  getMetodosLuta: () => requisicao('GET', '/api/lutas/metodos'),
  getLuta: (id) => requisicao('GET', `/api/lutas/${id}`),
  createLuta: (dados) => requisicao('POST', '/api/lutas', dados),
  updateLuta: (id, dados) => requisicao('PUT', `/api/lutas/${id}`, dados),
  deleteLuta: (id) => requisicao('DELETE', `/api/lutas/${id}`),

  getVisibilidades: () => requisicao('GET', '/api/visibilidades'),
  getCinturoes: () => requisicao('GET', '/api/cinturoes'),

  getCampeoes: () => requisicao('GET', '/api/views/cinturoes'),
  getAtividade: () => requisicao('GET', '/api/views/atividade'),

  getLutadoresPorDivisao: (pesoMinimo, minimoAtletas) => {
    const params = new URLSearchParams();
    if (pesoMinimo != null && pesoMinimo !== '') params.set('peso_min', pesoMinimo);
    if (minimoAtletas != null && minimoAtletas !== '') params.set('min_atletas', minimoAtletas);
    const query = params.toString();
    return requisicao('GET', '/api/consultas/lutadores-por-divisao' + (query ? `?${query}` : ''));
  },
  getLutasTitulo: () => requisicao('GET', '/api/consultas/lutas-titulo'),
  getLutadoresAcimaDaMedia: (idDivisao) => {
    const query = idDivisao ? `?divisao=${idDivisao}` : '';
    return requisicao('GET', `/api/consultas/lutadores-acima-media${query}`);
  },
};
