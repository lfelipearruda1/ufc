package handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import dao.LutaDAO;
import model.Luta;
import util.CorsUtil;
import util.JsonUtil;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class LutaHandler implements HttpHandler {

    private final LutaDAO dao = new LutaDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        CorsUtil.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        String path  = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getQuery();
        String[] partes = path.split("/");

        // /api/visibilidades → rota aninhada no mesmo handler
        if (path.startsWith("/api/visibilidades")) {
            if ("GET".equals(method)) {
                try {
                    responder(exchange, 200, dao.listarVisibilidades());
                } catch (Exception e) {
                    e.printStackTrace();
                    responder(exchange, 500, JsonUtil.erro(e.getMessage()));
                }
            } else {
                responder(exchange, 405, JsonUtil.erro("Método não permitido"));
            }
            return;
        }

        try {
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
        } catch (NumberFormatException e) {
            responder(exchange, 400, JsonUtil.erro("ID inválido"));
        } catch (Exception e) {
            e.printStackTrace();
            responder(exchange, 500, JsonUtil.erro(e.getMessage()));
        }
    }

    private Luta parseLuta(Map<String, String> d) {
        Luta l = new Luta();
        if (d.containsKey("metodo"))         l.setMetodo(d.get("metodo"));
        if (d.containsKey("resultado"))      l.setResultado(d.get("resultado"));
        if (d.containsKey("quant_rounds"))   l.setQuantRounds(Integer.parseInt(d.get("quant_rounds")));
        if (d.containsKey("id_desafiante"))  l.setIdDesafiante(Integer.parseInt(d.get("id_desafiante")));
        if (d.containsKey("id_desafiado"))   l.setIdDesafiado(Integer.parseInt(d.get("id_desafiado")));
        if (d.containsKey("id_card"))        l.setIdCard(Integer.parseInt(d.get("id_card")));
        if (d.containsKey("id_visibilidade")) l.setIdVisibilidade(Integer.parseInt(d.get("id_visibilidade")));
        return l;
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
