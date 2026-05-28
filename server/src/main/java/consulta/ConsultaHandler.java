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
        } else if (path.contains("/cinturoes/opcoes") || path.equals("/api/cinturoes")) {
            resultado = dao.listarCinturoesOpcoes();
        } else if (path.contains("/views/atividade")) {
            resultado = dao.listarAtividade();
        } else if (path.contains("/consultas/lutadores-por-divisao")) {
            double pesoMinimo = parseDoubleParam(exchange, "peso_min", 70);
            int minimoAtletas = parseIntParam(exchange, "min_atletas", 3);
            resultado = dao.lutadoresPorDivisao(pesoMinimo, minimoAtletas);
        } else if (path.contains("/consultas/lutas-titulo")) {
            resultado = dao.lutasTitulo();
        } else if (path.contains("/consultas/lutadores-acima-media")) {
            Integer idDivisao = parseOptionalIntParam(exchange, "divisao");
            resultado = dao.lutadoresAcimaDaMedia(idDivisao);
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

    private double parseDoubleParam(HttpExchange exchange, String nome, double padrao) {
        String query = exchange.getRequestURI().getQuery();
        if (query == null) return padrao;
        for (String parte : query.split("&")) {
            String[] kv = parte.split("=", 2);
            if (kv.length == 2 && nome.equals(kv[0])) {
                try {
                    return Double.parseDouble(kv[1]);
                } catch (NumberFormatException e) {
                    return padrao;
                }
            }
        }
        return padrao;
    }

    private int parseIntParam(HttpExchange exchange, String nome, int padrao) {
        String query = exchange.getRequestURI().getQuery();
        if (query == null) return padrao;
        for (String parte : query.split("&")) {
            String[] kv = parte.split("=", 2);
            if (kv.length == 2 && nome.equals(kv[0])) {
                try {
                    return Integer.parseInt(kv[1]);
                } catch (NumberFormatException e) {
                    return padrao;
                }
            }
        }
        return padrao;
    }

    private Integer parseOptionalIntParam(HttpExchange exchange, String nome) {
        String query = exchange.getRequestURI().getQuery();
        if (query == null) return null;
        for (String parte : query.split("&")) {
            String[] kv = parte.split("=", 2);
            if (kv.length == 2 && nome.equals(kv[0]) && !kv[1].isEmpty()) {
                try {
                    return Integer.parseInt(kv[1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
}
