package consulta;

import com.sun.net.httpserver.HttpExchange;
import infra.BaseHandler;
import shared.JsonUtil;

public class ConsultaHandler extends BaseHandler {

    private final ConsultaDAO dao = new ConsultaDAO();

    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        if (!"GET".equals(exchange.getRequestMethod())) {
            responder(exchange, 405, JsonUtil.erro("Método não permitido"));
            return;
        }

        String path = exchange.getRequestURI().getPath();
        String resultado;

        if (path.contains("/views/cinturoes")) {
            resultado = dao.listarCinturoes();
        } else if (path.contains("/views/atividade")) {
            resultado = dao.listarAtividade();
        } else if (path.contains("/consultas/lutadores-por-divisao")) {
            resultado = dao.lutadoresPorDivisao();
        } else if (path.contains("/consultas/lutas-titulo")) {
            resultado = dao.lutasTitulo();
        } else if (path.contains("/consultas/divisoes-sem-cinturao")) {
            resultado = dao.divisoesSemCinturao();
        } else if (path.contains("/consultas/lutadores-acima-media")) {
            resultado = dao.lutadoresAcimaDaMedia();
        } else if (path.contains("/logs/cinturao")) {
            resultado = dao.listarLogsCinturao();
        } else if (path.contains("/cardppv/") && path.contains("/receita-por-pagante")) {
            String[] partes = path.split("/");
            int idCard = Integer.parseInt(partes[3]);
            resultado = dao.receitaPorPagante(idCard);
        } else {
            responder(exchange, 404, JsonUtil.erro("Rota não encontrada: " + path));
            return;
        }

        responder(exchange, 200, resultado);
    }
}
