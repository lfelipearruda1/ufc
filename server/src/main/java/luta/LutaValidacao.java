package luta;

public final class LutaValidacao {

    private LutaValidacao() {}

    public static void validar(Luta l) {
        if (l.getMetodo() == null || l.getMetodo().trim().isEmpty()) {
            throw new IllegalArgumentException("Método de vitória é obrigatório.");
        }
        l.setMetodo(MetodoLuta.resolver(l.getMetodo()));

        if (l.getResultado() == null || l.getResultado().trim().isEmpty()) {
            throw new IllegalArgumentException("Resultado é obrigatório.");
        }
        l.setResultado(l.getResultado().trim());

        if (l.getQuantRounds() < 1 || l.getQuantRounds() > 5) {
            throw new IllegalArgumentException("Rounds deve estar entre 1 e 5.");
        }

        if (l.getIdDesafiante() <= 0 || l.getIdDesafiado() <= 0) {
            throw new IllegalArgumentException("Selecione o desafiante e o desafiado.");
        }

        if (l.getIdDesafiante() == l.getIdDesafiado()) {
            throw new IllegalArgumentException("Desafiante e desafiado não podem ser o mesmo atleta.");
        }

        if (l.getIdCard() <= 0) {
            throw new IllegalArgumentException("Selecione o evento.");
        }

        if (l.getIdVisibilidade() <= 0) {
            throw new IllegalArgumentException("Selecione a visibilidade.");
        }
    }
}
