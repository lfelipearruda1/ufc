package divisao;

import com.sun.net.httpserver.HttpExchange;
import infra.BaseHandler;
import shared.JsonUtil;

import java.util.Map;

public class DivisaoHandler extends BaseHandler {

    private final DivisaoDAO dao = new DivisaoDAO();

    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path  = exchange.getRequestURI().getPath();
        String[] partes = path.split("/");

        boolean temId = partes.length >= 4 && !partes[3].isEmpty();
        boolean isRecalcular = partes.length >= 5 && "recalcular".equals(partes[4]);
        int id = temId ? Integer.parseInt(partes[3]) : -1;

        if (isRecalcular && "POST".equals(method)) {
            dao.recalcularCarteis(id);
            responder(exchange, 200, JsonUtil.sucesso("Cartéis recalculados"));
            return;
        }

        switch (method) {
            case "GET":
                responder(exchange, 200, temId ? dao.buscarPorId(id) : dao.listar());
                break;

            case "POST": {
                Divisao d = parseDivisao(JsonUtil.parseJsonToMap(lerBody(exchange)));
                boolean ok = dao.inserir(d);
                responder(exchange, ok ? 201 : 500,
                    ok ? JsonUtil.sucesso("Divisão criada") : JsonUtil.erro("Erro ao inserir"));
                break;
            }

            case "PUT": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                Divisao d = parseDivisao(JsonUtil.parseJsonToMap(lerBody(exchange)));
                d.setIdDivisao(id);
                boolean ok = dao.atualizar(d);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Divisão atualizada") : JsonUtil.erro("Divisão não encontrada"));
                break;
            }

            case "DELETE": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                boolean ok = dao.deletar(id);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Divisão removida") : JsonUtil.erro("Divisão não encontrada"));
                break;
            }

            default:
                responder(exchange, 405, JsonUtil.erro("Método não permitido"));
        }
    }

    private Divisao parseDivisao(Map<String, String> d) {
        Divisao div = new Divisao();
        if (d.containsKey("nome_divisao")) div.setNomeDivisao(d.get("nome_divisao"));
        if (d.containsKey("peso_max"))     div.setPesoMax(Double.parseDouble(d.get("peso_max")));
        if (d.containsKey("peso_min"))     div.setPesoMin(Double.parseDouble(d.get("peso_min")));
        return div;
    }
}
