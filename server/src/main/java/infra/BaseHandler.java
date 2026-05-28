package infra;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import shared.CorsUtil;
import shared.JsonUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public abstract class BaseHandler implements HttpHandler {

    @Override
    public final void handle(HttpExchange exchange) throws IOException {
        CorsUtil.addCorsHeaders(exchange);

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        try {
            handleRequest(exchange);
        } catch (NumberFormatException e) {
            responder(exchange, 400, JsonUtil.erro("ID inválido"));
        } catch (IllegalArgumentException e) {
            responder(exchange, 400, JsonUtil.erro(e.getMessage()));
        } catch (Exception e) {
            if (isErroConstraintLuta(e)) {
                responder(exchange, 400, JsonUtil.erro(mensagemConstraintLuta(e)));
                return;
            }
            e.printStackTrace();
            responder(exchange, 500, JsonUtil.erro("Erro interno ao processar a requisição."));
        }
    }

    private static boolean isErroConstraintLuta(Exception e) {
        Throwable causa = e;
        while (causa != null) {
            String msg = causa.getMessage();
            if (msg != null && msg.contains("chk_luta_")) {
                return true;
            }
            causa = causa.getCause();
        }
        return false;
    }

    private static String mensagemConstraintLuta(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        if (msg.contains("chk_luta_metodo")) {
            return "Método de vitória inválido. Use apenas os valores listados no formulário.";
        }
        if (msg.contains("chk_luta_rounds")) {
            return "Rounds deve estar entre 1 e 5.";
        }
        if (msg.contains("chk_diferentes")) {
            return "Desafiante e desafiado não podem ser o mesmo atleta.";
        }
        return "Dados do confronto inválidos. Verifique os campos e tente novamente.";
    }

    protected abstract void handleRequest(HttpExchange exchange) throws Exception;

    protected String lerBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    protected void responder(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
