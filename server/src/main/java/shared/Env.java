package shared;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public final class Env {

    private static final Map<String, String> FILE_VARS = loadDotEnv();

    private Env() {}

    public static String get(String key) {
        String env = System.getenv(key);
        if (env != null && !env.isBlank()) return env.trim();
        String file = FILE_VARS.get(key);
        if (file != null && !file.isBlank()) return file.trim();
        return null;
    }

    public static String get(String key, String defaultValue) {
        String value = get(key);
        return value != null ? value : defaultValue;
    }

    public static String require(String key) {
        String value = get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "Variável " + key + " não definida. Copie server/.env.example para server/.env e preencha os valores."
            );
        }
        return value;
    }

    private static Map<String, String> loadDotEnv() {
        Map<String, String> vars = new HashMap<>();
        for (Path path : new Path[] { Paths.get(".env"), Paths.get("server", ".env") }) {
            if (!Files.isRegularFile(path)) continue;
            try {
                for (String line : Files.readAllLines(path)) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) continue;
                    int eq = line.indexOf('=');
                    if (eq <= 0) continue;
                    String key = line.substring(0, eq).trim();
                    String value = line.substring(eq + 1).trim();
                    if ((value.startsWith("\"") && value.endsWith("\""))
                            || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length() - 1);
                    }
                    vars.put(key, value);
                }
                break;
            } catch (IOException ignored) {
            }
        }
        return vars;
    }
}
