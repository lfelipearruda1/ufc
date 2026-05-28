package infra;

import card.CardHandler;
import com.sun.net.httpserver.HttpServer;
import consulta.ConsultaHandler;
import divisao.DivisaoHandler;
import lutador.LutadorHandler;
import luta.LutaHandler;
import procedure.ProcedureHandler;

public class HttpRouter {

    private HttpRouter() {}

    public static void register(HttpServer server) {
        server.createContext("/api/lutadores",     new LutadorHandler());
        server.createContext("/api/divisoes",      new DivisaoHandler());
        server.createContext("/api/cards",         new CardHandler());
        server.createContext("/api/lutas",         new LutaHandler());
        server.createContext("/api/visibilidades", new LutaHandler());

        server.createContext("/api/views",     new ConsultaHandler());
        server.createContext("/api/consultas", new ConsultaHandler());
        server.createContext("/api/cardppv",   new ConsultaHandler());
        server.createContext("/api/cinturoes", new ConsultaHandler());

        server.createContext("/api/procedures", new ProcedureHandler());
    }
}
