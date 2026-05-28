package model;

import util.JsonUtil;

public class Visibilidade {
    private int idVisibilidade;
    private String visibilidade;

    public Visibilidade() {}

    public int getIdVisibilidade() { return idVisibilidade; }
    public void setIdVisibilidade(int idVisibilidade) { this.idVisibilidade = idVisibilidade; }

    public String getVisibilidade() { return visibilidade; }
    public void setVisibilidade(String visibilidade) { this.visibilidade = visibilidade; }

    public String toJson() {
        return "{" +
            "\"id_visibilidade\":" + idVisibilidade + "," +
            "\"visibilidade\":\"" + JsonUtil.escapeString(visibilidade) + "\"" +
            "}";
    }
}
