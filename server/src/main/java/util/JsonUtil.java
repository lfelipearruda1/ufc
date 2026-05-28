package util;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class JsonUtil {

    public static String escapeString(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    public static String erro(String msg) {
        return "{\"erro\":\"" + escapeString(msg) + "\"}";
    }

    public static String sucesso(String msg) {
        return "{\"mensagem\":\"" + escapeString(msg) + "\"}";
    }

    public static String toJsonArray(List<String> items) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(items.get(i));
        }
        sb.append("]");
        return sb.toString();
    }

    /** Converte um ResultSet completo em array JSON, usando os nomes das colunas como chaves. */
    public static String resultSetToJsonArray(ResultSet rs) throws SQLException {
        List<String> items = new ArrayList<>();
        ResultSetMetaData meta = rs.getMetaData();
        int colCount = meta.getColumnCount();

        while (rs.next()) {
            StringBuilder sb = new StringBuilder("{");
            for (int i = 1; i <= colCount; i++) {
                if (i > 1) sb.append(",");
                String colName = meta.getColumnLabel(i);
                Object value = rs.getObject(i);
                sb.append("\"").append(colName).append("\":");
                appendJsonValue(sb, value);
            }
            sb.append("}");
            items.add(sb.toString());
        }
        return toJsonArray(items);
    }

    private static void appendJsonValue(StringBuilder sb, Object value) {
        if (value == null) {
            sb.append("null");
        } else if (value instanceof Number) {
            sb.append(value);
        } else if (value instanceof Boolean) {
            sb.append(value);
        } else {
            sb.append("\"").append(escapeString(value.toString())).append("\"");
        }
    }

    /**
     * Faz o parse de um JSON plano (sem aninhamento) para Map<String, String>.
     * Suporta valores string, número, booleano e null.
     */
    public static Map<String, String> parseJsonToMap(String json) {
        Map<String, String> result = new LinkedHashMap<>();
        if (json == null || json.trim().isEmpty()) return result;

        json = json.trim();
        int i = 0;
        if (i < json.length() && json.charAt(i) == '{') i++;

        while (i < json.length()) {
            // pula espaços
            while (i < json.length() && Character.isWhitespace(json.charAt(i))) i++;
            if (i >= json.length() || json.charAt(i) == '}') break;

            // lê chave (sempre string com aspas)
            if (json.charAt(i) != '"') break;
            i++;
            StringBuilder key = new StringBuilder();
            while (i < json.length() && json.charAt(i) != '"') {
                if (json.charAt(i) == '\\' && i + 1 < json.length()) {
                    i++;
                    key.append(unescapeChar(json.charAt(i)));
                } else {
                    key.append(json.charAt(i));
                }
                i++;
            }
            i++; // fecha aspas da chave

            // pula : e espaços
            while (i < json.length() && (json.charAt(i) == ':' || Character.isWhitespace(json.charAt(i)))) i++;

            // lê valor
            StringBuilder value = new StringBuilder();
            if (i < json.length() && json.charAt(i) == '"') {
                i++;
                while (i < json.length() && json.charAt(i) != '"') {
                    if (json.charAt(i) == '\\' && i + 1 < json.length()) {
                        i++;
                        value.append(unescapeChar(json.charAt(i)));
                    } else {
                        value.append(json.charAt(i));
                    }
                    i++;
                }
                i++; // fecha aspas do valor
            } else {
                // número, booleano ou null
                while (i < json.length() && json.charAt(i) != ',' && json.charAt(i) != '}') {
                    if (!Character.isWhitespace(json.charAt(i))) value.append(json.charAt(i));
                    i++;
                }
            }

            result.put(key.toString(), value.toString());

            // pula , e espaços
            while (i < json.length() && (Character.isWhitespace(json.charAt(i)) || json.charAt(i) == ',')) i++;
        }

        return result;
    }

    private static char unescapeChar(char c) {
        switch (c) {
            case 'n': return '\n';
            case 't': return '\t';
            case 'r': return '\r';
            case '"': return '"';
            case '\\': return '\\';
            default: return c;
        }
    }
}
