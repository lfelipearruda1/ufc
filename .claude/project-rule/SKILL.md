# ⚖️ REGRAS DO PROJETO — UFC Manager
> Estas regras são **lei**. Nenhuma exceção. Nenhum "mas nesse caso...".
> Qualquer código que viole uma regra abaixo deve ser reescrito antes de continuar.

---

## 🚫 NUNCA — Proibições absolutas

### Banco de dados
- ❌ **NUNCA** usar ORM (Hibernate, JPA, EclipseLink, MyBatis, ou qualquer outro)
- ❌ **NUNCA** usar anotações de mapeamento (`@Entity`, `@Table`, `@Column`, `@Id`, etc.)
- ❌ **NUNCA** concatenar dados do usuário diretamente no SQL
  ```java
  // PROIBIDO
  String sql = "SELECT * FROM lutador WHERE nome = '" + nome + "'";

  // OBRIGATÓRIO
  String sql = "SELECT * FROM lutador WHERE nome = ?";
  PreparedStatement ps = conn.prepareStatement(sql);
  ps.setString(1, nome);
  ```
- ❌ **NUNCA** deixar `Connection`, `PreparedStatement` ou `ResultSet` abertos sem fechar

### Backend Java
- ❌ **NUNCA** usar Spring, Quarkus, Micronaut ou qualquer framework web Java
- ❌ **NUNCA** usar Gson, Jackson, org.json ou qualquer biblioteca de JSON
- ❌ **NUNCA** usar bibliotecas externas além do driver JDBC do PostgreSQL (`org.postgresql:postgresql:42.7.3`)
- ❌ **NUNCA** construir JSON por concatenação de strings sem escapar os valores
  ```java
  // PROIBIDO
  return "{\"nome\": \"" + nome + "\"}"; // quebra se nome tiver aspas

  // OBRIGATÓRIO — usar JsonUtil.java que trata escape
  return JsonUtil.toJson(lutador);
  ```
- ❌ **NUNCA** expor stack trace diretamente para o cliente
- ❌ **NUNCA** retornar resposta sem header CORS

### Frontend
- ❌ **NUNCA** usar React, Vue, Angular, Svelte ou qualquer framework JS
- ❌ **NUNCA** usar jQuery ou qualquer biblioteca JS externa
- ❌ **NUNCA** manipular o banco diretamente do frontend (tudo passa pela API)
- ❌ **NUNCA** hardcodar dados — tudo vem do banco via API
- ❌ **NUNCA** usar `innerHTML` com dados vindos da API sem sanitizar (XSS)

---

## ✅ SEMPRE — Obrigações absolutas

### Banco de dados
- ✅ **SEMPRE** usar `PreparedStatement` para qualquer query com parâmetros
- ✅ **SEMPRE** fechar recursos com `try-with-resources`:
  ```java
  try (Connection conn = DatabaseConnection.getConnection();
       PreparedStatement ps = conn.prepareStatement(sql);
       ResultSet rs = ps.executeQuery()) {
      // ...
  }
  ```
- ✅ **SEMPRE** usar os nomes de tabela em **minúsculo** (padrão PostgreSQL do projeto):
  `lutador`, `divisao`, `card`, `cardppv`, `luta`, `cinturao`, `treinador`, `visibilidadeluta`
- ✅ **SEMPRE** comentar o SQL dentro do método DAO que o executa

### Backend Java
- ✅ **SEMPRE** retornar JSON com header `Content-Type: application/json`
- ✅ **SEMPRE** adicionar headers CORS em **todas** as respostas via `CorsUtil`
- ✅ **SEMPRE** responder `200` para `OPTIONS` (preflight CORS)
- ✅ **SEMPRE** retornar JSON de erro em vez de lançar exceção para o cliente:
  ```json
  { "erro": "Lutador não encontrado" }
  ```
- ✅ **SEMPRE** validar se o body da requisição não é nulo antes de processar
- ✅ **SEMPRE** usar `CallableStatement` para chamar procedures e funções PostgreSQL:
  ```java
  CallableStatement cs = conn.prepareCall("CALL sp_transferir_lutador_divisao(?, ?)");
  ```

### Frontend
- ✅ **SEMPRE** usar `fetch()` nativo para chamadas à API
- ✅ **SEMPRE** tratar erros do `fetch` com `.catch()` e exibir mensagem ao usuário
- ✅ **SEMPRE** usar `textContent` em vez de `innerHTML` ao inserir dados da API em elementos HTML
- ✅ **SEMPRE** dar feedback visual ao usuário após insert, update ou delete (mensagem de sucesso/erro)

### Geral
- ✅ **SEMPRE** nomear variáveis, métodos e classes de forma significativa (sem `x1`, `a`, `temp`, `data2`)
- ✅ **SEMPRE** comentar métodos com o que fazem e qual SQL executam (DAOs)
- ✅ **SEMPRE** manter a separação de camadas: Handler não acessa banco, DAO não conhece HTTP

---

## 🏗️ Arquitetura — Camadas e responsabilidades

```
Frontend (HTML/CSS/JS)
    ↕ fetch() / JSON / HTTP
Handler (recebe requisição, chama DAO, devolve JSON)
    ↕ objetos Model (POJOs)
DAO (executa SQL puro via JDBC)
    ↕ JDBC / PreparedStatement
PostgreSQL
```

| Camada | Responsabilidade | Pode conhecer |
|---|---|---|
| `Handler` | Receber HTTP, parsear body, chamar DAO, montar resposta | DAO, Model |
| `DAO` | Executar SQL, mapear ResultSet → Model | Model, DatabaseConnection |
| `Model` | Representar dados (POJO puro) | Ninguém |
| `DatabaseConnection` | Prover conexão JDBC | Ninguém |
| `JsonUtil` | Serializar/desserializar JSON manualmente | Model |
| `CorsUtil` | Adicionar headers CORS | Ninguém |

**Regra de ouro:** cada camada só conhece a camada imediatamente abaixo dela.

---

## 📁 Estrutura de pacotes — imutável

```
server/src/main/java/
├── Main.java
├── database/
│   └── DatabaseConnection.java
├── model/
│   ├── Lutador.java
│   ├── Divisao.java
│   ├── Card.java
│   ├── CardPPV.java
│   ├── Luta.java
│   ├── Cinturao.java
│   └── Treinador.java
├── dao/
│   ├── LutadorDAO.java
│   ├── DivisaoDAO.java
│   ├── CardDAO.java
│   └── LutaDAO.java
├── handler/
│   ├── LutadorHandler.java
│   ├── DivisaoHandler.java
│   ├── CardHandler.java
│   ├── LutaHandler.java
│   ├── ConsultaHandler.java
│   └── ProcedureHandler.java
└── util/
    ├── JsonUtil.java
    └── CorsUtil.java

client/
├── index.html
├── css/style.css
└── js/
    ├── api.js
    └── main.js
```

---

## 🔌 Configuração de conexão — imutável

```java
URL:    jdbc:postgresql://localhost:5432/postgres
USER:   postgres
DRIVER: org.postgresql.Driver
PORTA BACKEND: 8080
PORTA FRONTEND: 5173 (ou abrir index.html direto)
```

---

## 🗄️ Nomes de tabelas — imutável

| Tabela | Colunas principais |
|---|---|
| `divisao` | `id_divisao`, `nome_divisao`, `peso_max`, `peso_min` |
| `lutador` | `id_lutador`, `apelido`, `nome`, `peso`, `cartel`, `nacionalidade`, `id_divisao` |
| `treinador` | `id_treinador`, `nome`, `especialidade`, `id_lutador` |
| `cinturao` | `id_cinturao`, `tipo_cinturao`, `id_lutador`, `id_divisao` |
| `visibilidadeluta` | `id_visibilidade`, `visibilidade` |
| `card` | `id_card`, `cidade`, `data`, `pais`, `quant_lutas` |
| `cardppv` | `id_card`, `num_edicao`, `preco_ppv`, `receita`, `quant_pagantes`, `cidade`, `data`, `pais`, `quant_lutas`, `id_cinturao` |
| `luta` | `id_luta`, `metodo`, `resultado`, `quant_rounds`, `id_desafiante`, `id_desafiado`, `id_card`, `id_visibilidade` |
| `log_troca_cinturao` | `id_log`, `id_cinturao`, `tipo_cinturao`, `id_lutador_ant`, `nome_ant`, `id_lutador_novo`, `nome_novo`, `data_hora` |

---

## ⚙️ Funções e Procedures — como chamar

```java
// FUNÇÃO — chamar via SELECT no SQL
String sql = "SELECT fn_classificar_lutador(?) AS classificacao";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, cartel);

// FUNÇÃO com id
String sql = "SELECT fn_receita_por_pagante(?) AS receita_por_pagante";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setInt(1, idCard);

// PROCEDURE — usar CallableStatement
CallableStatement cs = conn.prepareCall("CALL sp_transferir_lutador_divisao(?, ?)");
cs.setInt(1, idLutador);
cs.setInt(2, idDivisao);
cs.execute();

// PROCEDURE com cursor (sem parâmetros OUT no Java)
CallableStatement cs = conn.prepareCall("CALL sp_recalcular_carteis_divisao(?)");
cs.setInt(1, idDivisao);
cs.execute();
```

---

## 🆔 Geração de IDs

- ✅ Buscar `MAX(id) + 1` no banco antes de inserir
- ❌ Não depender de `SERIAL` ou `SEQUENCE` do PostgreSQL
- ❌ Não gerar IDs aleatórios no Java

```java
// Padrão para gerar próximo ID
String sql = "SELECT COALESCE(MAX(id_lutador), 0) + 1 FROM lutador";
```

---

## 📋 Checklist antes de entregar

- [ ] Todos os SQLs usam `PreparedStatement`
- [ ] Todos os recursos JDBC fechados com `try-with-resources`
- [ ] Nenhuma biblioteca proibida no `pom.xml`
- [ ] CORS funcionando (frontend consegue chamar o backend)
- [ ] CRUD completo para `lutador`, `divisao`, `card`, `luta`
- [ ] `fn_classificar_lutador` sendo chamada e exibida na tela de lutadores
- [ ] Botão "Transferir Divisão" chamando `sp_transferir_lutador_divisao`
- [ ] Tela de logs exibindo `log_troca_cinturao`
- [ ] 4 consultas acessíveis na interface
- [ ] 2 views acessíveis na interface
- [ ] Nenhum dado hardcodado no frontend