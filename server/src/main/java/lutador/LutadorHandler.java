package lutador;

import com.sun.net.httpserver.HttpExchange;
import infra.BaseHandler;
import shared.JsonUtil;

import java.util.Map;

public class LutadorHandler extends BaseHandler {

    private final LutadorDAO dao = new LutadorDAO();

    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path  = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getQuery();
        String[] partes = path.split("/");

        boolean temId = partes.length >= 4 && !partes[3].isEmpty();
        boolean isTransferir = partes.length >= 5 && "transferir".equals(partes[4]);
        int id = temId ? Integer.parseInt(partes[3]) : -1;

        if (isTransferir && "POST".equals(method)) {
            Map<String, String> dados = JsonUtil.parseJsonToMap(lerBody(exchange));
            int idDivisao = Integer.parseInt(dados.get("id_divisao"));
            dao.transferirDivisao(id, idDivisao);
            responder(exchange, 200, JsonUtil.sucesso("Lutador transferido com sucesso"));
            return;
        }

        switch (method) {
            case "GET":
                if (temId) {
                    responder(exchange, 200, dao.buscarPorId(id));
                } else if (query != null && query.startsWith("divisao=")) {
                    int idDiv = Integer.parseInt(query.split("=")[1]);
                    responder(exchange, 200, dao.listarPorDivisao(idDiv));
                } else {
                    responder(exchange, 200, dao.listar());
                }
                break;

            case "POST": {
                Lutador l = parseLutador(JsonUtil.parseJsonToMap(lerBody(exchange)));
                boolean ok = dao.inserir(l);
                responder(exchange, ok ? 201 : 500,
                    ok ? JsonUtil.sucesso("Lutador criado") : JsonUtil.erro("Erro ao inserir"));
                break;
            }

            case "PUT": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                Lutador l = parseLutador(JsonUtil.parseJsonToMap(lerBody(exchange)));
                l.setIdLutador(id);
                boolean ok = dao.atualizar(l);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Lutador atualizado") : JsonUtil.erro("Lutador não encontrado"));
                break;
            }

            case "DELETE": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                boolean ok = dao.deletar(id);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Lutador removido") : JsonUtil.erro("Lutador não encontrado"));
                break;
            }

            default:
                responder(exchange, 405, JsonUtil.erro("Método não permitido"));
        }
    }

    private Lutador parseLutador(Map<String, String> d) {
        Lutador l = new Lutador();
        if (d.containsKey("apelido"))       l.setApelido(d.get("apelido"));
        if (d.containsKey("nome"))          l.setNome(d.get("nome"));
        if (d.containsKey("peso"))          l.setPeso(Double.parseDouble(d.get("peso")));
        if (d.containsKey("cartel"))        l.setCartel(d.get("cartel"));
        if (d.containsKey("nacionalidade")) l.setNacionalidade(d.get("nacionalidade"));
        if (d.containsKey("id_divisao"))    l.setIdDivisao(Integer.parseInt(d.get("id_divisao")));
        return l;
    }
}
