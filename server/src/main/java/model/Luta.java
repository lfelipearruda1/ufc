package model;

import util.JsonUtil;

public class Luta {
    private int idLuta;
    private String metodo;
    private String resultado;
    private int quantRounds;
    private int idDesafiante;
    private int idDesafiado;
    private int idCard;
    private int idVisibilidade;
    // campos extras de join
    private String apelidoDesafiante;
    private String apelidoDesafiado;
    private String visibilidade;

    public Luta() {}

    public int getIdLuta() { return idLuta; }
    public void setIdLuta(int idLuta) { this.idLuta = idLuta; }

    public String getMetodo() { return metodo; }
    public void setMetodo(String metodo) { this.metodo = metodo; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public int getQuantRounds() { return quantRounds; }
    public void setQuantRounds(int quantRounds) { this.quantRounds = quantRounds; }

    public int getIdDesafiante() { return idDesafiante; }
    public void setIdDesafiante(int idDesafiante) { this.idDesafiante = idDesafiante; }

    public int getIdDesafiado() { return idDesafiado; }
    public void setIdDesafiado(int idDesafiado) { this.idDesafiado = idDesafiado; }

    public int getIdCard() { return idCard; }
    public void setIdCard(int idCard) { this.idCard = idCard; }

    public int getIdVisibilidade() { return idVisibilidade; }
    public void setIdVisibilidade(int idVisibilidade) { this.idVisibilidade = idVisibilidade; }

    public String getApelidoDesafiante() { return apelidoDesafiante; }
    public void setApelidoDesafiante(String apelidoDesafiante) { this.apelidoDesafiante = apelidoDesafiante; }

    public String getApelidoDesafiado() { return apelidoDesafiado; }
    public void setApelidoDesafiado(String apelidoDesafiado) { this.apelidoDesafiado = apelidoDesafiado; }

    public String getVisibilidade() { return visibilidade; }
    public void setVisibilidade(String visibilidade) { this.visibilidade = visibilidade; }

    public String toJson() {
        return "{" +
            "\"id_luta\":" + idLuta + "," +
            "\"metodo\":\"" + JsonUtil.escapeString(metodo) + "\"," +
            "\"resultado\":\"" + JsonUtil.escapeString(resultado) + "\"," +
            "\"quant_rounds\":" + quantRounds + "," +
            "\"id_desafiante\":" + idDesafiante + "," +
            "\"id_desafiado\":" + idDesafiado + "," +
            "\"id_card\":" + idCard + "," +
            "\"id_visibilidade\":" + idVisibilidade + "," +
            "\"apelido_desafiante\":\"" + JsonUtil.escapeString(apelidoDesafiante) + "\"," +
            "\"apelido_desafiado\":\"" + JsonUtil.escapeString(apelidoDesafiado) + "\"," +
            "\"visibilidade\":\"" + JsonUtil.escapeString(visibilidade) + "\"" +
            "}";
    }
}
