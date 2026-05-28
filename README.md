# UFC Manager

Sistema de gestão de dados do UFC desenvolvido como projeto acadêmico. Permite cadastrar atletas, divisões de peso, eventos (cards), confrontos (lutas), consultar views SQL, executar procedures no PostgreSQL e visualizar análises no painel.

**Stack:** Java 11 (API REST com `HttpServer` nativo + JDBC) · PostgreSQL · HTML/CSS/JavaScript puro (sem frameworks).

---

## Índice

1. [Visão geral](#visão-geral)
2. [Estrutura do projeto](#estrutura-do-projeto)
3. [Pré-requisitos](#pré-requisitos)
4. [Banco de dados](#banco-de-dados)
5. [Configuração da conexão](#configuração-da-conexão)
6. [Como rodar no macOS](#como-rodar-no-macos)
7. [Como rodar no Windows](#como-rodar-no-windows)
8. [Uso da aplicação](#uso-da-aplicação)
9. [API REST](#api-rest)
10. [Solução de problemas](#solução-de-problemas)

---

## Visão geral

O projeto é dividido em duas partes que rodam separadamente:

| Parte | Pasta | Porta | Função |
|-------|-------|-------|--------|
| **Backend** | `server/` | `8080` | API JSON, acesso ao PostgreSQL via JDBC |
| **Frontend** | `client/` | `5173` (recomendado) | Interface web que consome a API |

O backend **não** serve os arquivos HTML/CSS/JS. É necessário subir um servidor HTTP simples para a pasta `client/` (instruções abaixo).

### Funcionalidades

- **CRUD:** lutadores, divisões, cards (eventos), lutas
- **Procedures:** transferir lutador de divisão, recalcular cartéis de uma divisão
- **Funções SQL:** classificação do lutador pelo cartel, receita por pagante (PPV)
- **Views:** cinturões em disputa, atividade dos lutadores
- **Consultas analíticas:** lutadores por divisão (filtros), lutas de título por nocaute, lutadores acima da média de peso
- **Painel:** gráficos e resumos com dados vindos da API

### Arquitetura

```
Frontend (HTML/CSS/JS)  →  fetch() / JSON  →  Handlers (HTTP)
                                                    ↓
                                                  DAOs (SQL puro)
                                                    ↓
                                              PostgreSQL
```

Regras do projeto: sem ORM, sem Spring, sem bibliotecas JSON externas no Java; SQL sempre com `PreparedStatement`.

---

## Estrutura do projeto

```
ufc/
├── client/                 # Frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js          # Chamadas à API (base: http://localhost:8080)
│       ├── main.js         # Lógica da interface
│       └── charts.js       # Gráficos do painel
├── server/                 # Backend Maven
│   ├── pom.xml
│   └── src/main/java/
│       ├── Main.java       # Entrada — porta 8080
│       ├── infra/          # Conexão, roteador HTTP, base dos handlers
│       ├── lutador/        # Atletas
│       ├── divisao/        # Divisões de peso
│       ├── card/           # Eventos
│       ├── luta/           # Confrontos
│       ├── consulta/       # Views e consultas SQL
│       ├── procedure/      # Procedures expostas via API
│       └── shared/         # JSON manual, CORS
└── README.md
```

---

## Pré-requisitos

Instale **antes** de rodar o projeto:

| Ferramenta | Versão mínima | Para quê |
|------------|---------------|----------|
| **Java JDK** | 11+ | Compilar e executar o backend |
| **Apache Maven** | 3.6+ | Build do backend (`mvn`) |
| **PostgreSQL** | 12+ | Banco de dados |
| **Servidor HTTP** (opcional) | — | Servir o frontend; Python ou Node já resolvem |

### Verificar instalação

**macOS / Linux (Terminal):**

```bash
java -version
mvn -version
psql --version
```

**Windows (PowerShell ou CMD):**

```powershell
java -version
mvn -version
psql --version
```

---

## Banco de dados

O backend espera um banco PostgreSQL chamado **`ufc`** em `localhost:5432`.

> **Importante:** Este repositório não inclui o script `.sql` de criação. Use o dump/script fornecido na disciplina ou crie o schema conforme o enunciado do projeto. Sem as tabelas, views, funções e procedures abaixo, a API retornará erro de SQL.

### Tabelas principais

| Tabela | Uso |
|--------|-----|
| `divisao` | Divisões de peso |
| `lutador` | Atletas |
| `treinador` | Treinadores (vínculo com lutador) |
| `cinturao` | Cinturões por divisão |
| `visibilidadeluta` | Tipos de visibilidade da luta |
| `card` | Eventos |
| `cardppv` | Eventos PPV (herança/extensão de card) |
| `luta` | Confrontos |
| `log_troca_cinturao` | Log de troca de cinturão (trigger) |

### Objetos SQL usados pelo código

| Tipo | Nome |
|------|------|
| View | `vw_cinturoes_em_disputa` |
| View | `vw_lutadores_atividade` |
| Função | `fn_classificar_lutador(cartel)` |
| Função | `fn_receita_por_pagante(id_card)` |
| Procedure | `sp_transferir_lutador_divisao(id_lutador, id_divisao)` |
| Procedure | `sp_recalcular_carteis_divisao(id_divisao)` |

### Criar o banco (exemplo)

Com o PostgreSQL em execução:

```sql
CREATE DATABASE ufc;
```

Depois conecte ao banco e execute o script de schema/dados da disciplina:

```bash
psql -U SEU_USUARIO -d ufc -f caminho/para/schema.sql
```

Substitua `SEU_USUARIO` pelo usuário PostgreSQL da sua máquina (no Mac costuma ser seu usuário do sistema; no Windows, frequentemente `postgres`).

---

## Configuração da conexão

Edite o arquivo:

`server/src/main/java/infra/DatabaseConnection.java`

```java
private static final String URL = "jdbc:postgresql://localhost:5432/ufc";
private static final String USER = "SEU_USUARIO_POSTGRES";
private static final String PASSWORD = "SUA_SENHA";
```

| Campo | Valor padrão do projeto |
|-------|-------------------------|
| Host | `localhost` |
| Porta | `5432` |
| Banco | `ufc` |
| Usuário / senha | **Ajuste para sua máquina** |

Recompile o backend após alterar (`mvn compile` ou `mvn exec:java` na pasta `server/`).

---

## Como rodar no macOS

### 1. Instalar dependências (Homebrew)

Se ainda não tiver as ferramentas:

```bash
# Homebrew: https://brew.sh
brew install openjdk@11 maven postgresql@16
brew services start postgresql@16
```

Adicione o Java ao PATH (ajuste o shell se usar `~/.zshrc`):

```bash
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"
```

### 2. Preparar o PostgreSQL

```bash
# Criar banco (entre no psql com seu usuário)
createdb ufc

# Ou via psql:
psql postgres -c "CREATE DATABASE ufc;"
psql -d ufc -f /caminho/para/seu/schema.sql
```

No Mac, o usuário PostgreSQL costuma ser o mesmo do login (`whoami`). Use esse nome em `DatabaseConnection.java`.

### 3. Subir o backend

```bash
cd /caminho/para/ufc/server
mvn compile exec:java
```

Aguarde a mensagem:

```text
UFC Manager iniciado em http://localhost:8080
```

Deixe esse terminal aberto.

### 4. Subir o frontend

Em **outro** terminal:

**Opção A — Python (já vem no macOS):**

```bash
cd /caminho/para/ufc/client
python3 -m http.server 5173
```

**Opção B — Node.js:**

```bash
cd /caminho/para/ufc/client
npx --yes serve -l 5173
```

### 5. Abrir no navegador

Acesse: **http://localhost:5173**

A API está em **http://localhost:8080** (configurada em `client/js/api.js`).

---

## Como rodar no Windows

### 1. Instalar dependências

1. **Java 11+:** [Adoptium Temurin](https://adoptium.net/) ou Oracle JDK — marque “Add to PATH” no instalador.
2. **Maven:** [Apache Maven](https://maven.apache.org/download.cgi) — extraia e adicione `bin` ao PATH do sistema.
3. **PostgreSQL:** [Instalador Windows](https://www.postgresql.org/download/windows/) — anote a senha do usuário `postgres` definida na instalação.

Reinicie o PowerShell/CMD após instalar.

**Opcional (Chocolatey):**

```powershell
choco install temurin11 maven postgresql
```

### 2. Preparar o PostgreSQL

Abra **SQL Shell (psql)** ou PowerShell:

```powershell
# Criar banco (senha do postgres quando solicitado)
psql -U postgres -c "CREATE DATABASE ufc;"
psql -U postgres -d ufc -f C:\caminho\para\schema.sql
```

No Windows, use em geral:

- **USER:** `postgres`
- **PASSWORD:** a definida na instalação

Atualize `DatabaseConnection.java` com esses valores.

Certifique-se de que o serviço PostgreSQL está rodando:

- `Win + R` → `services.msc` → serviço **postgresql** → **Em execução**

### 3. Subir o backend

**PowerShell ou CMD:**

```powershell
cd C:\caminho\para\ufc\server
mvn compile exec:java
```

Aguarde:

```text
UFC Manager iniciado em http://localhost:8080
```

### 4. Subir o frontend

Em **outro** terminal:

**Opção A — Python** (se instalado: [python.org](https://www.python.org/downloads/)):

```powershell
cd C:\caminho\para\ufc\client
python -m http.server 5173
```

**Opção B — Node.js:**

```powershell
cd C:\caminho\para\ufc\client
npx --yes serve -l 5173
```

### 5. Abrir no navegador

Acesse: **http://localhost:5173**

> **Evite** abrir `index.html` com duplo clique (`file://`). Alguns navegadores bloqueiam `fetch` para `localhost` a partir de arquivo local. Use sempre o servidor na porta `5173`.

---

## Uso da aplicação

1. Inicie o **PostgreSQL**.
2. Inicie o **backend** (`mvn exec:java` em `server/`).
3. Inicie o **frontend** (servidor HTTP em `client/`).
4. Navegue pelo menu lateral:
   - **Painel** — resumo e gráficos
   - **Atletas / Divisões / Eventos / Confrontos** — CRUD
   - **Cinturões / Desempenho** — views SQL
   - **Consultas** — relatórios parametrizados

Operações como **transferir divisão** e **recalcular cartéis** chamam procedures no banco via API.

---

## API REST

Base: `http://localhost:8080`

| Recurso | Endpoints |
|---------|-----------|
| Lutadores | `GET/POST /api/lutadores`, `GET/PUT/DELETE /api/lutadores/{id}`, `POST /api/lutadores/{id}/transferir` |
| Divisões | `GET/POST /api/divisoes`, `GET/PUT/DELETE /api/divisoes/{id}`, `POST /api/divisoes/{id}/recalcular` |
| Cards | `GET/POST /api/cards`, `GET/PUT/DELETE /api/cards/{id}` |
| Lutas | `GET/POST /api/lutas`, `GET /api/lutas/metodos`, `GET/PUT/DELETE /api/lutas/{id}` |
| Visibilidades | `GET /api/visibilidades` |
| Cinturões (opções) | `GET /api/cinturoes` |
| Views | `GET /api/views/cinturoes`, `GET /api/views/atividade` |
| Consultas | `GET /api/consultas/lutadores-por-divisao`, `lutas-titulo`, `lutadores-acima-media` |
| PPV | `GET /api/cardppv/{id}/receita-por-pagante` |

Respostas em JSON; erros no formato `{ "erro": "mensagem" }`. CORS habilitado para qualquer origem (`*`).

---

## Solução de problemas

| Sintoma | O que verificar |
|---------|-----------------|
| `Servidor indisponível` no navegador | Backend rodando? `curl http://localhost:8080/api/divisoes` |
| Erro de conexão JDBC / `Connection refused` | PostgreSQL ativo? Banco `ufc` existe? Usuário/senha em `DatabaseConnection.java`? |
| `Driver PostgreSQL não encontrado` | Rode `mvn compile` em `server/` (dependência no `pom.xml`) |
| `relation "lutador" does not exist` | Schema não foi aplicado no banco `ufc` |
| `function fn_classificar_lutador does not exist` | Funções/views/procedures do enunciado não foram criadas |
| Porta 8080 em uso | Feche outro processo ou altere a porta em `Main.java` e em `client/js/api.js` |
| Página em branco / sem estilo | Abriu via `http://localhost:5173`, não via `file://`? |
| `mvn` não reconhecido (Windows) | Maven no PATH; reinicie o terminal |

### Testar API manualmente

```bash
curl http://localhost:8080/api/divisoes
```

### Logs do backend

Erros de SQL aparecem no terminal onde o `mvn exec:java` está rodando (não são expostos como stack trace na API).

---

## Licença e contexto

Projeto acadêmico — UFC Manager. Desenvolvido com Java puro + JDBC e frontend sem frameworks, conforme requisitos da disciplina.

Para regras de código e checklist de entrega, consulte `.claude/project-rule/SKILL.md`.
