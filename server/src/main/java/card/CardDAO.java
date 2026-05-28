package card;

import infra.DatabaseConnection;
import shared.JsonUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CardDAO {

    private int proximoId(Connection conn) throws SQLException {
        String sql = "SELECT COALESCE(MAX(id_card), 0) + 1 FROM card";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 1;
        }
    }

    private Card mapear(ResultSet rs) throws SQLException {
        Card c = new Card();
        c.setIdCard(rs.getInt("id_card"));
        c.setCidade(rs.getString("cidade"));
        c.setData(rs.getString("data"));
        c.setPais(rs.getString("pais"));
        c.setQuantLutas(rs.getInt("quant_lutas"));
        return c;
    }

    public String listar() throws SQLException {
        String sql = "SELECT * FROM card ORDER BY data DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<String> items = new ArrayList<>();
            while (rs.next()) items.add(mapear(rs).toJson());
            return JsonUtil.toJsonArray(items);
        }
    }

    public String buscarPorId(int id) throws SQLException {
        String sql = "SELECT * FROM card WHERE id_card = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs).toJson();
                return "null";
            }
        }
    }

    public boolean inserir(Card c) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection()) {
            c.setIdCard(proximoId(conn));
            String sql = "INSERT INTO card (id_card, cidade, data, pais, quant_lutas) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, c.getIdCard());
                ps.setString(2, c.getCidade());
                ps.setDate(3, java.sql.Date.valueOf(c.getData()));
                ps.setString(4, c.getPais());
                ps.setInt(5, c.getQuantLutas());
                return ps.executeUpdate() > 0;
            }
        }
    }

    public boolean atualizar(Card c) throws SQLException {
        String sql = "UPDATE card SET cidade=?, data=?, pais=?, quant_lutas=? WHERE id_card=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getCidade());
            ps.setDate(2, java.sql.Date.valueOf(c.getData()));
            ps.setString(3, c.getPais());
            ps.setInt(4, c.getQuantLutas());
            ps.setInt(5, c.getIdCard());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deletar(int id) throws SQLException {
        String sql = "DELETE FROM card WHERE id_card=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }
}
