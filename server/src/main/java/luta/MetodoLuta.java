package luta;

import shared.JsonUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class MetodoLuta {

    private static final List<String> PERMITIDOS = List.of(
        "Nocaute",
        "Nocaute técnico",
        "Finalização",
        "Decisão Unânime",
        "Decisão Dividida"
    );

    private MetodoLuta() {}

    public static List<String> permitidos() {
        return Collections.unmodifiableList(PERMITIDOS);
    }

    public static String resolver(String informado) {
        if (informado == null || informado.trim().isEmpty()) {
            throw new IllegalArgumentException("Método de vitória é obrigatório.");
        }

        String valor = informado.trim();
        for (String permitido : PERMITIDOS) {
            if (permitido.equalsIgnoreCase(valor)) {
                return permitido;
            }
        }

        throw new IllegalArgumentException(
            "Método inválido: \"" + valor + "\". Valores aceitos: " + String.join(", ", PERMITIDOS)
        );
    }

    public static String listarJson() {
        List<String> items = new ArrayList<>();
        for (String metodo : PERMITIDOS) {
            items.add("\"" + JsonUtil.escapeString(metodo) + "\"");
        }
        return JsonUtil.toJsonArray(items);
    }
}
