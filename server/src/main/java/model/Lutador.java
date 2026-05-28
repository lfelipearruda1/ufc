package model;

import util.JsonUtil;

public class Lutador {
    private int idLutador;
    private String apelido;
    private String nome;
    private double peso;
    private String cartel;
    private String nacionalidade;
    private int idDivisao;
    // campos extras de join
    private String nomeDivisao;
    private String classificacao;

    public Lutador() {}

    public int getIdLutador() { return idLutador; }
    public void setIdLutador(int idLutador) { this.idLutador = idLutador; }

    public String getApelido() { return apelido; }
    public void setApelido(String apelido) { this.apelido = apelido; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public double getPeso() { return peso; }
    public void setPeso(double peso) { this.peso = peso; }

    public String getCartel() { return cartel; }
    public void setCartel(String cartel) { this.cartel = cartel; }

    public String getNacionalidade() { return nacionalidade; }
    public void setNacionalidade(String nacionalidade) { this.nacionalidade = nacionalidade; }

    public int getIdDivisao() { return idDivisao; }
    public void setIdDivisao(int idDivisao) { this.idDivisao = idDivisao; }

    public String getNomeDivisao() { return nomeDivisao; }
    public void setNomeDivisao(String nomeDivisao) { this.nomeDivisao = nomeDivisao; }

    public String getClassificacao() { return classificacao; }
    public void setClassificacao(String classificacao) { this.classificacao = classificacao; }

    public String toJson() {
        return "{" +
            "\"id_lutador\":" + idLutador + "," +
            "\"apelido\":\"" + JsonUtil.escapeString(apelido) + "\"," +
            "\"nome\":\"" + JsonUtil.escapeString(nome) + "\"," +
            "\"peso\":" + peso + "," +
            "\"cartel\":\"" + JsonUtil.escapeString(cartel) + "\"," +
            "\"nacionalidade\":\"" + JsonUtil.escapeString(nacionalidade) + "\"," +
            "\"id_divisao\":" + idDivisao + "," +
            "\"nome_divisao\":\"" + JsonUtil.escapeString(nomeDivisao) + "\"," +
            "\"classificacao\":\"" + JsonUtil.escapeString(classificacao) + "\"" +
            "}";
    }
}
