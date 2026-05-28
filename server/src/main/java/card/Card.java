package card;

import shared.JsonUtil;

public class Card {
    private int idCard;
    private String cidade;
    private String data;
    private String pais;
    private int quantLutas;

    public Card() {}

    public int getIdCard() { return idCard; }
    public void setIdCard(int idCard) { this.idCard = idCard; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    public int getQuantLutas() { return quantLutas; }
    public void setQuantLutas(int quantLutas) { this.quantLutas = quantLutas; }

    public String toJson() {
        return "{" +
            "\"id_card\":" + idCard + "," +
            "\"cidade\":\"" + JsonUtil.escapeString(cidade) + "\"," +
            "\"data\":\"" + JsonUtil.escapeString(data) + "\"," +
            "\"pais\":\"" + JsonUtil.escapeString(pais) + "\"," +
            "\"quant_lutas\":" + quantLutas +
            "}";
    }
}
