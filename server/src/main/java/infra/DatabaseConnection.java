package infra;

import shared.Env;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

    private static final String URL = Env.get("DB_URL", "jdbc:postgresql://localhost:5432/ufc");
    private static final String USER = Env.require("DB_USER");
    private static final String PASSWORD = Env.require("DB_PASSWORD");

    private DatabaseConnection() {}

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("Driver PostgreSQL não encontrado: " + e.getMessage());
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
