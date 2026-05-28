package consulta;

import infra.DatabaseConnection;
import shared.JsonUtil;

import java.sql.*;

public class ConsultaDAO {

    public String listarCinturoes() throws SQLException {
        String sql = "SELECT * FROM vw_cinturoes_em_disputa";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String listarCinturoesOpcoes() throws SQLException {
        String sql =
            "SELECT ci.id_cinturao, ci.tipo_cinturao, d.nome_divisao " +
            "FROM cinturao ci JOIN divisao d ON ci.id_divisao = d.id_divisao " +
            "ORDER BY d.nome_divisao, ci.tipo_cinturao";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String listarAtividade() throws SQLException {
        String sql = "SELECT * FROM vw_lutadores_atividade";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String lutadoresPorDivisao(double pesoMinimo, int minimoAtletas) throws SQLException {
        String sql =
            "SELECT d.nome_divisao, COUNT(l.id_lutador) AS total_lutadores " +
            "FROM divisao d JOIN lutador l ON d.id_divisao = l.id_divisao " +
            "WHERE l.peso > ? " +
            "GROUP BY d.id_divisao, d.nome_divisao " +
            "HAVING COUNT(l.id_lutador) > ? " +
            "ORDER BY total_lutadores DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, pesoMinimo);
            ps.setInt(2, minimoAtletas);
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.resultSetToJsonArray(rs);
            }
        }
    }

    public String lutasTitulo() throws SQLException {
        String sql =
            "SELECT lu.id_luta, lu.metodo, lu.resultado, cp.num_edicao, ci.tipo_cinturao " +
            "FROM luta lu " +
            "JOIN cardppv cp ON lu.id_card = cp.id_card " +
            "JOIN cinturao ci ON cp.id_cinturao = ci.id_cinturao " +
            "WHERE lu.metodo IN ('Nocaute', 'Nocaute técnico') AND ci.tipo_cinturao = 'Regular' " +
            "ORDER BY cp.num_edicao DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String lutadoresAcimaDaMedia(Integer idDivisao) throws SQLException {
        String sql =
            "SELECT l.nome, l.apelido, l.peso, d.nome_divisao " +
            "FROM lutador l JOIN divisao d ON l.id_divisao = d.id_divisao " +
            "WHERE l.peso > (SELECT AVG(l2.peso) FROM lutador l2 WHERE l2.id_divisao = l.id_divisao) " +
            (idDivisao != null ? "AND l.id_divisao = ? " : "") +
            "ORDER BY d.nome_divisao, l.peso DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (idDivisao != null) ps.setInt(1, idDivisao);
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.resultSetToJsonArray(rs);
            }
        }
    }

    public String receitaPorPagante(int idCard) throws SQLException {
        String sql = "SELECT fn_receita_por_pagante(?) AS receita_por_pagante";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCard);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Object val = rs.getObject("receita_por_pagante");
                    return "{\"receita_por_pagante\":" + (val != null ? val : "null") + "}";
                }
                return "{\"receita_por_pagante\":null}";
            }
        }
    }
}
