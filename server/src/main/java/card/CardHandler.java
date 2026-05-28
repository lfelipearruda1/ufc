package card;

import com.sun.net.httpserver.HttpExchange;
import infra.BaseHandler;
import shared.JsonUtil;

import java.util.Map;

public class CardHandler extends BaseHandler {

    private final CardDAO dao = new CardDAO();

    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] partes = path.split("/");

        boolean temId = partes.length >= 4 && !partes[3].isEmpty();
        int id = temId ? Integer.parseInt(partes[3]) : -1;

        switch (method) {
            case "GET":
                responder(exchange, 200, temId ? dao.buscarPorId(id) : dao.listar());
                break;

            case "POST": {
                Card c = parseCard(JsonUtil.parseJsonToMap(lerBody(exchange)));
                boolean ok = dao.inserir(c);
                responder(exchange, ok ? 201 : 500,
                    ok ? JsonUtil.sucesso("Card criado") : JsonUtil.erro("Erro ao inserir"));
                break;
            }

            case "PUT": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                Card c = parseCard(JsonUtil.parseJsonToMap(lerBody(exchange)));
                c.setIdCard(id);
                boolean ok = dao.atualizar(c);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Card atualizado") : JsonUtil.erro("Card não encontrado"));
                break;
            }

            case "DELETE": {
                if (!temId) { responder(exchange, 400, JsonUtil.erro("ID obrigatório")); break; }
                boolean ok = dao.deletar(id);
                responder(exchange, ok ? 200 : 404,
                    ok ? JsonUtil.sucesso("Card removido") : JsonUtil.erro("Card não encontrado"));
                break;
            }

            default:
                responder(exchange, 405, JsonUtil.erro("Método não permitido"));
        }
    }

    private Card parseCard(Map<String, String> d) {
        Card c = new Card();
        if (d.containsKey("cidade"))      c.setCidade(d.get("cidade"));
        if (d.containsKey("data"))        c.setData(d.get("data"));
        if (d.containsKey("pais"))        c.setPais(d.get("pais"));
        if (d.containsKey("quant_lutas")) c.setQuantLutas(Integer.parseInt(d.get("quant_lutas")));
        return c;
    }
}
