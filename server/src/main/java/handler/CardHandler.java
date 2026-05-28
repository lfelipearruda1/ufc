package handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import dao.CardDAO;
import model.Card;
import util.CorsUtil;
import util.JsonUtil;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class CardHandler implements HttpHandler {

    private final CardDAO dao = new CardDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        CorsUtil.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        String path = exchange.getRequestURI().getPath();
        String[] partes = path.split("/");

        try {
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
        } catch (NumberFormatException e) {
            responder(exchange, 400, JsonUtil.erro("ID inválido"));
        } catch (Exception e) {
            e.printStackTrace();
            responder(exchange, 500, JsonUtil.erro(e.getMessage()));
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

    private String lerBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private void responder(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
