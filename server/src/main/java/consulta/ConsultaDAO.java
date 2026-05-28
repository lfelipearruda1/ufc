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

    public String listarAtividade() throws SQLException {
        String sql = "SELECT * FROM vw_lutadores_atividade";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String lutadoresPorDivisao() throws SQLException {
        String sql =
            "SELECT d.nome_divisao, COUNT(l.id_lutador) AS total_lutadores " +
            "FROM divisao d JOIN lutador l ON d.id_divisao = l.id_divisao " +
            "WHERE l.peso > 70 " +
            "GROUP BY d.id_divisao, d.nome_divisao " +
            "HAVING COUNT(l.id_lutador) > 3 " +
            "ORDER BY total_lutadores DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
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

    public String divisoesSemCinturao() throws SQLException {
        String sql =
            "SELECT d.id_divisao, d.nome_divisao, d.peso_min, d.peso_max " +
            "FROM divisao d LEFT JOIN cinturao ci ON d.id_divisao = ci.id_divisao " +
            "WHERE ci.id_divisao IS NULL " +
            "ORDER BY d.nome_divisao";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String lutadoresAcimaDaMedia() throws SQLException {
        String sql =
            "SELECT l.nome, l.apelido, l.peso, d.nome_divisao " +
            "FROM lutador l JOIN divisao d ON l.id_divisao = d.id_divisao " +
            "WHERE l.peso > (SELECT AVG(l2.peso) FROM lutador l2 WHERE l2.id_divisao = l.id_divisao) " +
            "ORDER BY d.nome_divisao, l.peso DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
        }
    }

    public String listarLogsCinturao() throws SQLException {
        String sql = "SELECT * FROM log_troca_cinturao ORDER BY data_hora DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return JsonUtil.resultSetToJsonArray(rs);
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
