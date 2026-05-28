import com.sun.net.httpserver.HttpServer;
import infra.HttpRouter;

import java.net.InetSocketAddress;

public class Main {

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        HttpRouter.register(server);

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(4));
        server.start();

        System.out.println("UFC Manager iniciado em http://localhost:8080");
    }
}
