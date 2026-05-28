package handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import dao.ConsultaDAO;
import util.CorsUtil;
import util.JsonUtil;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class ConsultaHandler implements HttpHandler {

    private final ConsultaDAO dao = new ConsultaDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        CorsUtil.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        if (!"GET".equals(method)) {
            responder(exchange, 405, JsonUtil.erro("Método não permitido"));
            return;
        }

        String path = exchange.getRequestURI().getPath();

        try {
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
                // /api/cardppv/{id}/receita-por-pagante
                String[] partes = path.split("/");
                int idCard = Integer.parseInt(partes[3]);
                resultado = dao.receitaPorPagante(idCard);
            } else {
                responder(exchange, 404, JsonUtil.erro("Rota não encontrada: " + path));
                return;
            }

            responder(exchange, 200, resultado);
        } catch (NumberFormatException e) {
            responder(exchange, 400, JsonUtil.erro("ID inválido"));
        } catch (Exception e) {
            e.printStackTrace();
            responder(exchange, 500, JsonUtil.erro(e.getMessage()));
        }
    }

    private void responder(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
