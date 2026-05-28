package dao;

import database.DatabaseConnection;
import model.Luta;
import model.Visibilidade;
import util.JsonUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LutaDAO {

    private int proximoId(Connection conn) throws SQLException {
        // SELECT COALESCE(MAX(id_luta), 0) + 1 FROM luta
        String sql = "SELECT COALESCE(MAX(id_luta), 0) + 1 FROM luta";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 1;
        }
    }

    private Luta mapear(ResultSet rs) throws SQLException {
        Luta l = new Luta();
        l.setIdLuta(rs.getInt("id_luta"));
        l.setMetodo(rs.getString("metodo"));
        l.setResultado(rs.getString("resultado"));
        l.setQuantRounds(rs.getInt("quant_rounds"));
        l.setIdDesafiante(rs.getInt("id_desafiante"));
        l.setIdDesafiado(rs.getInt("id_desafiado"));
        l.setIdCard(rs.getInt("id_card"));
        l.setIdVisibilidade(rs.getInt("id_visibilidade"));
        l.setApelidoDesafiante(rs.getString("apelido_desafiante"));
        l.setApelidoDesafiado(rs.getString("apelido_desafiado"));
        l.setVisibilidade(rs.getString("visibilidade"));
        return l;
    }

    private static final String SELECT_BASE =
        "SELECT lu.id_luta, lu.metodo, lu.resultado, lu.quant_rounds, " +
        "lu.id_desafiante, lu.id_desafiado, lu.id_card, lu.id_visibilidade, " +
        "d1.apelido AS apelido_desafiante, d2.apelido AS apelido_desafiado, " +
        "v.visibilidade " +
        "FROM luta lu " +
        "LEFT JOIN lutador d1 ON lu.id_desafiante = d1.id_lutador " +
        "LEFT JOIN lutador d2 ON lu.id_desafiado = d2.id_lutador " +
        "LEFT JOIN visibilidadeluta v ON lu.id_visibilidade = v.id_visibilidade ";

    /**
     * SELECT lu.*, d1.apelido, d2.apelido, v.visibilidade
     * FROM luta lu LEFT JOIN lutador ... LEFT JOIN visibilidadeluta ...
     * ORDER BY lu.id_luta
     */
    public String listar() throws SQLException {
        String sql = SELECT_BASE + "ORDER BY lu.id_luta";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<String> items = new ArrayList<>();
            while (rs.next()) items.add(mapear(rs).toJson());
            return JsonUtil.toJsonArray(items);
        }
    }

    /**
     * SELECT ... FROM luta lu LEFT JOIN ... WHERE lu.id_card = ?
     */
    public String listarPorCard(int idCard) throws SQLException {
        String sql = SELECT_BASE + "WHERE lu.id_card = ? ORDER BY lu.id_luta";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCard);
            try (ResultSet rs = ps.executeQuery()) {
                List<String> items = new ArrayList<>();
                while (rs.next()) items.add(mapear(rs).toJson());
                return JsonUtil.toJsonArray(items);
            }
        }
    }

    /**
     * SELECT ... FROM luta lu LEFT JOIN ... WHERE lu.id_luta = ?
     */
    public String buscarPorId(int id) throws SQLException {
        String sql = SELECT_BASE + "WHERE lu.id_luta = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs).toJson();
                return "null";
            }
        }
    }

    /**
     * INSERT INTO luta (id_luta, metodo, resultado, quant_rounds, id_desafiante, id_desafiado, id_card, id_visibilidade)
     * VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     */
    public boolean inserir(Luta l) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection()) {
            l.setIdLuta(proximoId(conn));
            String sql = "INSERT INTO luta (id_luta, metodo, resultado, quant_rounds, id_desafiante, id_desafiado, id_card, id_visibilidade) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, l.getIdLuta());
                ps.setString(2, l.getMetodo());
                ps.setString(3, l.getResultado());
                ps.setInt(4, l.getQuantRounds());
                ps.setInt(5, l.getIdDesafiante());
                ps.setInt(6, l.getIdDesafiado());
                ps.setInt(7, l.getIdCard());
                ps.setInt(8, l.getIdVisibilidade());
                return ps.executeUpdate() > 0;
            }
        }
    }

    /**
     * UPDATE luta SET metodo=?, resultado=?, quant_rounds=?, id_desafiante=?,
     *   id_desafiado=?, id_card=?, id_visibilidade=? WHERE id_luta=?
     */
    public boolean atualizar(Luta l) throws SQLException {
        String sql = "UPDATE luta SET metodo=?, resultado=?, quant_rounds=?, id_desafiante=?, " +
                     "id_desafiado=?, id_card=?, id_visibilidade=? WHERE id_luta=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, l.getMetodo());
            ps.setString(2, l.getResultado());
            ps.setInt(3, l.getQuantRounds());
            ps.setInt(4, l.getIdDesafiante());
            ps.setInt(5, l.getIdDesafiado());
            ps.setInt(6, l.getIdCard());
            ps.setInt(7, l.getIdVisibilidade());
            ps.setInt(8, l.getIdLuta());
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * DELETE FROM luta WHERE id_luta=?
     */
    public boolean deletar(int id) throws SQLException {
        String sql = "DELETE FROM luta WHERE id_luta=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * SELECT * FROM visibilidadeluta ORDER BY id_visibilidade
     */
    public String listarVisibilidades() throws SQLException {
        String sql = "SELECT * FROM visibilidadeluta ORDER BY id_visibilidade";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<String> items = new ArrayList<>();
            while (rs.next()) {
                Visibilidade v = new Visibilidade();
                v.setIdVisibilidade(rs.getInt("id_visibilidade"));
                v.setVisibilidade(rs.getString("visibilidade"));
                items.add(v.toJson());
            }
            return JsonUtil.toJsonArray(items);
        }
    }
}
