package handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import dao.DivisaoDAO;
import dao.LutadorDAO;
import util.CorsUtil;
import util.JsonUtil;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Expõe as stored procedures em /api/procedures/*
 * POST /api/procedures/transferir   → sp_transferir_lutador_divisao
 * POST /api/procedures/recalcular   → sp_recalcular_carteis_divisao
 */
public class ProcedureHandler implements HttpHandler {

    private final LutadorDAO lutadorDAO = new LutadorDAO();
    private final DivisaoDAO divisaoDAO = new DivisaoDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        CorsUtil.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        if (!"POST".equals(method)) {
            responder(exchange, 405, JsonUtil.erro("Método não permitido"));
            return;
        }

        String path = exchange.getRequestURI().getPath();
        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        Map<String, String> dados = JsonUtil.parseJsonToMap(body);

        try {
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
