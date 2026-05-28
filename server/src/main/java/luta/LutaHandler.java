package luta;

import com.sun.net.httpserver.HttpExchange;
import infra.BaseHandler;
import shared.JsonUtil;

import java.util.Map;

public class LutaHandler extends BaseHandler {

    private final LutaDAO dao = new LutaDAO();

    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path  = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getQuery();
        String[] partes = path.split("/");

        if (path.startsWith("/api/visibilidades")) {
            if ("GET".equals(method)) {
                responder(exchange, 200, dao.listarVisibilidades());
            } else {
                responder(exchange, 405, JsonUtil.erro("Método não permitido"));
            }
            return;
        }

        boolean temId = partes.length >= 4 && !partes[3].isEmpty();
        int id = temId ? Integer.parseInt(partes[3]) : -1;

        switch (method) {
            case "GET":
                if (temId) {
                    responder(exchange, 200, dao.buscarPorId(id));
                } else if (query != null && query.startsWith("card=")) {
                    int idCard = Integer.parseInt(query.split("=")[1]);
                    responder(exchange, 200, dao.listarPorCard(idCard));
                } else {
                    responder(exchange, 200, dao.listar());
                }
                break;

            case "POST": {
                Luta l = parseLuta(JsonUtil.parseJsonToMap(lerBody(exchange)));
                boolean ok = dao.inserir(l);
                responder(exchange, ok ? 201 : 500,
                    ok ? JsonUtil.sucesso("Luta criada") : JsonUtil.erro("Erro ao inserir"));
                break;
            }

            case "PUT": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                Luta l = parseLuta(JsonUtil.parseJsonToMap(lerBody(exchange)));
                l.setIdLuta(id);
                boolean ok = dao.atualizar(l);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Luta atualizada") : JsonUtil.erro("Luta não encontrada"));
                break;
            }

            case "DELETE": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                boolean ok = dao.deletar(id);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Luta removida") : JsonUtil.erro("Luta não encontrada"));
                break;
            }

            default:
                responder(exchange, 405, JsonUtil.erro("Método não permitido"));
        }
    }

    private Luta parseLuta(Map<String, String> d) {
        Luta l = new Luta();
        if (d.containsKey("metodo"))          l.setMetodo(d.get("metodo"));
        if (d.containsKey("resultado"))       l.setResultado(d.get("resultado"));
        if (d.containsKey("quant_rounds"))    l.setQuantRounds(Integer.parseInt(d.get("quant_rounds")));
        if (d.containsKey("id_desafiante"))   l.setIdDesafiante(Integer.parseInt(d.get("id_desafiante")));
        if (d.containsKey("id_desafiado"))    l.setIdDesafiado(Integer.parseInt(d.get("id_desafiado")));
        if (d.containsKey("id_card"))         l.setIdCard(Integer.parseInt(d.get("id_card")));
        if (d.containsKey("id_visibilidade")) l.setIdVisibilidade(Integer.parseInt(d.get("id_visibilidade")));
        return l;
    }
}
