package dao;

import database.DatabaseConnection;
import model.Lutador;
import util.JsonUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LutadorDAO {

    private int proximoId(Connection conn) throws SQLException {
        // SELECT COALESCE(MAX(id_lutador), 0) + 1 FROM lutador
        String sql = "SELECT COALESCE(MAX(id_lutador), 0) + 1 FROM lutador";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 1;
        }
    }

    private Lutador mapear(ResultSet rs) throws SQLException {
        Lutador l = new Lutador();
        l.setIdLutador(rs.getInt("id_lutador"));
        l.setApelido(rs.getString("apelido"));
        l.setNome(rs.getString("nome"));
        l.setPeso(rs.getDouble("peso"));
        l.setCartel(rs.getString("cartel"));
        l.setNacionalidade(rs.getString("nacionalidade"));
        l.setIdDivisao(rs.getInt("id_divisao"));
        l.setNomeDivisao(rs.getString("nome_divisao"));
        l.setClassificacao(rs.getString("classificacao"));
        return l;
    }

    /**
     * SELECT l.*, d.nome_divisao, fn_classificar_lutador(l.cartel) AS classificacao
     * FROM lutador l LEFT JOIN divisao d ON l.id_divisao = d.id_divisao
     * ORDER BY l.nome
     */
    public String listar() throws SQLException {
        String sql = "SELECT l.id_lutador, l.apelido, l.nome, l.peso, l.cartel, l.nacionalidade, l.id_divisao, " +
                     "d.nome_divisao, fn_classificar_lutador(l.cartel) AS classificacao " +
                     "FROM lutador l LEFT JOIN divisao d ON l.id_divisao = d.id_divisao " +
                     "ORDER BY l.nome";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<String> items = new ArrayList<>();
            while (rs.next()) items.add(mapear(rs).toJson());
            return JsonUtil.toJsonArray(items);
        }
    }

    /**
     * SELECT l.*, d.nome_divisao, fn_classificar_lutador(l.cartel) AS classificacao
     * FROM lutador l LEFT JOIN divisao d ON l.id_divisao = d.id_divisao
     * WHERE l.id_divisao = ?
     */
    public String listarPorDivisao(int idDivisao) throws SQLException {
        String sql = "SELECT l.id_lutador, l.apelido, l.nome, l.peso, l.cartel, l.nacionalidade, l.id_divisao, " +
                     "d.nome_divisao, fn_classificar_lutador(l.cartel) AS classificacao " +
                     "FROM lutador l LEFT JOIN divisao d ON l.id_divisao = d.id_divisao " +
                     "WHERE l.id_divisao = ? ORDER BY l.nome";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idDivisao);
            try (ResultSet rs = ps.executeQuery()) {
                List<String> items = new ArrayList<>();
                while (rs.next()) items.add(mapear(rs).toJson());
                return JsonUtil.toJsonArray(items);
            }
        }
    }

    /**
     * SELECT l.*, d.nome_divisao, fn_classificar_lutador(l.cartel) AS classificacao
     * FROM lutador l LEFT JOIN divisao d ON l.id_divisao = d.id_divisao
     * WHERE l.id_lutador = ?
     */
    public String buscarPorId(int id) throws SQLException {
        String sql = "SELECT l.id_lutador, l.apelido, l.nome, l.peso, l.cartel, l.nacionalidade, l.id_divisao, " +
                     "d.nome_divisao, fn_classificar_lutador(l.cartel) AS classificacao " +
                     "FROM lutador l LEFT JOIN divisao d ON l.id_divisao = d.id_divisao " +
                     "WHERE l.id_lutador = ?";
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
     * INSERT INTO lutador (id_lutador, apelido, nome, peso, cartel, nacionalidade, id_divisao)
     * VALUES (?, ?, ?, ?, ?, ?, ?)
     */
    public boolean inserir(Lutador l) throws SQLException {
        try (Connection conn = DatabaseConnection.getConnection()) {
            l.setIdLutador(proximoId(conn));
            String sql = "INSERT INTO lutador (id_lutador, apelido, nome, peso, cartel, nacionalidade, id_divisao) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, l.getIdLutador());
                ps.setString(2, l.getApelido());
                ps.setString(3, l.getNome());
                ps.setDouble(4, l.getPeso());
                ps.setString(5, l.getCartel());
                ps.setString(6, l.getNacionalidade());
                ps.setInt(7, l.getIdDivisao());
                return ps.executeUpdate() > 0;
            }
        }
    }

    /**
     * UPDATE lutador SET apelido=?, nome=?, peso=?, cartel=?, nacionalidade=?, id_divisao=?
     * WHERE id_lutador=?
     */
    public boolean atualizar(Lutador l) throws SQLException {
        String sql = "UPDATE lutador SET apelido=?, nome=?, peso=?, cartel=?, nacionalidade=?, id_divisao=? " +
                     "WHERE id_lutador=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, l.getApelido());
            ps.setString(2, l.getNome());
            ps.setDouble(3, l.getPeso());
            ps.setString(4, l.getCartel());
            ps.setString(5, l.getNacionalidade());
            ps.setInt(6, l.getIdDivisao());
            ps.setInt(7, l.getIdLutador());
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * DELETE FROM lutador WHERE id_lutador=?
     */
    public boolean deletar(int id) throws SQLException {
        String sql = "DELETE FROM lutador WHERE id_lutador=?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * CALL sp_transferir_lutador_divisao(?, ?)
     */
    public void transferirDivisao(int idLutador, int idDivisao) throws SQLException {
        String sql = "{CALL sp_transferir_lutador_divisao(?, ?)}";
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, idLutador);
            cs.setInt(2, idDivisao);
            cs.execute();
        }
    }
}
