import com.sun.net.httpserver.HttpServer;
import handler.*;

import java.net.InetSocketAddress;

public class Main {

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // CRUD
        server.createContext("/api/lutadores",    new LutadorHandler());
        server.createContext("/api/divisoes",     new DivisaoHandler());
        server.createContext("/api/cards",        new CardHandler());
        server.createContext("/api/lutas",        new LutaHandler());
        server.createContext("/api/visibilidades", new LutaHandler());

        // Views, consultas e logs
        server.createContext("/api/views",     new ConsultaHandler());
        server.createContext("/api/consultas", new ConsultaHandler());
        server.createContext("/api/logs",      new ConsultaHandler());
        server.createContext("/api/cardppv",   new ConsultaHandler());

        // Procedures diretas
        server.createContext("/api/procedures", new ProcedureHandler());

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(4));
        server.start();

        System.out.println("UFC Manager iniciado em http://localhost:8080");
    }
}
