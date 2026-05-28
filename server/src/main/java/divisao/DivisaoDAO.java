package divisao;

import infra.DatabaseConnection;
import shared.JsonUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DivisaoDAO {

    private int proximoId(Connection conn) throws SQLException {
        String sql = "SELECT COALESCE(MAX(id_divisao), 0) + 1 FROM divisao";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 1;
        }
    }

    private Divisao mapear(ResultSet rs) throws SQLException {
        Divisao d = new Divisao();
        d.setIdDivisao(rs.getInt("id_divisao"));
        d.setNomeDivisao(rs.getString("nome_divisao"));
        d.setPesoMax(rs.getDouble("peso_max"));
        d.setPesoMin(rs.getDouble("peso_min"));
        return d;
    }

    public String listar() throws SQLException {
        String sql = "SELECT * FROM divisao ORDER BY nome_divisao";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<String> items = new ArrayList<>();
            while (rs.next()) items.add(mapear(rs).toJson());
            return JsonUtil.toJsonArray(items);
        }
    }

    public String buscarPorId(int id) throws SQLException {
        String sql = "SELECT * FROM divisao WHERE id_divisao = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs).toJson();
                return "null";
            }
        }
    }

    public boolean inserir(Divisao d) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection()) {
            d.setIdDivisao(proximoId(conn));
            String sql = "INSERT INTO divisao (id_divisao, nome_divisao, peso_max, peso_min) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, d.getIdDivisao());
                ps.setString(2, d.getNomeDivisao());
                ps.setDouble(3, d.getPesoMax());
                ps.setDouble(4, d.getPesoMin());
                return ps.executeUpdate() > 0;
            }
        }
    }

    public boolean atualizar(Divisao d) throws SQLException {
        String sql = "UPDATE divisao SET nome_divisao=?, peso_max=?, peso_min=? WHERE id_divisao=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, d.getNomeDivisao());
            ps.setDouble(2, d.getPesoMax());
            ps.setDouble(3, d.getPesoMin());
            ps.setInt(4, d.getIdDivisao());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deletar(int id) throws SQLException {
        String sql = "DELETE FROM divisao WHERE id_divisao=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    public void recalcularCarteis(int idDivisao) throws SQLException {
        String sql = "{CALL sp_recalcular_carteis_divisao(?)}";
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idDivisao);
            cs.execute();
        }
    }
}
