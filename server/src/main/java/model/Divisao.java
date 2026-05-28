package model;

import util.JsonUtil;

public class Divisao {
    private int idDivisao;
    private String nomeDivisao;
    private double pesoMax;
    private double pesoMin;

    public Divisao() {}

    public int getIdDivisao() { return idDivisao; }
    public void setIdDivisao(int idDivisao) { this.idDivisao = idDivisao; }

    public String getNomeDivisao() { return nomeDivisao; }
    public void setNomeDivisao(String nomeDivisao) { this.nomeDivisao = nomeDivisao; }

    public double getPesoMax() { return pesoMax; }
    public void setPesoMax(double pesoMax) { this.pesoMax = pesoMax; }

    public double getPesoMin() { return pesoMin; }
    public void setPesoMin(double pesoMin) { this.pesoMin = pesoMin; }

    public String toJson() {
        return "{" +
            "\"id_divisao\":" + idDivisao + "," +
            "\"nome_divisao\":\"" + JsonUtil.escapeString(nomeDivisao) + "\"," +
            "\"peso_max\":" + pesoMax + "," +
            "\"peso_min\":" + pesoMin +
            "}";
    }
}
