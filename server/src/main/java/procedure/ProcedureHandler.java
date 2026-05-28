package procedure;

import com.sun.net.httpserver.HttpExchange;
import divisao.DivisaoDAO;
import infra.BaseHandler;
import lutador.LutadorDAO;
import shared.JsonUtil;

import java.util.Map;

public class ProcedureHandler extends BaseHandler {

    private final LutadorDAO lutadorDAO = new LutadorDAO();
    private final DivisaoDAO divisaoDAO = new DivisaoDAO();

    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        if (!"POST".equals(exchange.getRequestMethod())) {
            responder(exchange, 405, JsonUtil.erro("Método não permitido"));
            return;
        }

        String path = exchange.getRequestURI().getPath();
        Map<String, String> dados = JsonUtil.parseJsonToMap(lerBody(exchange));

        if (path.endsWith("/transferir")) {
            int idLutador = Integer.parseInt(dados.get("id_lutador"));
            int idDivisao = Integer.parseInt(dados.get("id_divisao"));
            lutadorDAO.transferirDivisao(idLutador, idDivisao);
            responder(exchange, 200, JsonUtil.sucesso("Lutador transferido com sucesso"));

        } else if (path.endsWith("/recalcular")) {
            int idDivisao = Integer.parseInt(dados.get("id_divisao"));
            divisaoDAO.recalcularCarteis(idDivisao);
            responder(exchange, 200, JsonUtil.sucesso("Cartéis recalculados com sucesso"));

        } else {
            responder(exchange, 404, JsonUtil.erro("Procedure não encontrada"));
        }
    }
}
