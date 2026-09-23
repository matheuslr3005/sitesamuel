# La Torre — Guia de Gastronomia Italiana

Site do restaurante/guia fictício **La Torre**, com front-end em HTML, CSS e
JavaScript e back-end em **Node.js (Express)** com banco de dados
**SQLite**.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install
npm start
```

O site sobe em **http://localhost:3000** (front-end e API no mesmo
servidor). Para desenvolvimento com reinício automático ao salvar
arquivos:

```bash
npm run dev
```

Na primeira execução, o arquivo `data/latorre.db` é criado
automaticamente com as tabelas e um usuário + seis restaurantes de
exemplo. As credenciais desse usuário de demonstração aparecem no
terminal:

```
[db] Usuário de demonstração: equipe@latorre.app / senha: latorre123
```

Use-as para logar e ver os botões de **Editar/Excluir** habilitados nos
restaurantes de exemplo (veja a regra de propriedade abaixo).

## Estrutura

```
index.html, login.html, cadastro.html, area.html, restaurante.html  → páginas
css/           → estilos
js/            → front-end (consome a API via fetch)
server/
  index.js     → servidor Express (API + arquivos estáticos)
  db.js        → conexão SQLite, schema e seed inicial
  middleware/auth.js → autenticação via JWT em cookie httpOnly
  routes/auth.js        → cadastro, login, logout, sessão atual
  routes/restaurants.js → CRUD de restaurantes
data/latorre.db → banco SQLite (gerado automaticamente, não versionado)
```

## Banco de dados

Duas tabelas:

- **users** — id, nome, email (único), senha_hash (bcrypt), criado_em
- **restaurants** — id, nome, cidade, endereco, cozinha, faixa_preco,
  estrelas, imagem, descricao, criado_por (dono, FK para users), datas

## Regras de negócio implementadas no servidor

- E-mail precisa ser único; senha exige no mínimo 6 caracteres e nunca é
  armazenada em texto puro (hash bcrypt).
- Criar, editar e excluir restaurante exige estar autenticado.
- **Somente quem cadastrou um restaurante pode editá-lo ou excluí-lo**
  (regra de propriedade — outros usuários veem o registro como
  "somente leitura").
- `faixaPreco` só aceita €, €€, €€€ ou €€€€; `estrelas` só aceita um
  inteiro de 0 a 3. Nome, cidade, cozinha e descrição são obrigatórios.
- Toda validação do formulário no navegador é repetida no servidor
  (a API nunca confia apenas no front-end).

## Variáveis de ambiente

Copie `.env.example` para `.env` para customizar porta e o segredo do
JWT (recomendado antes de publicar em produção):

```bash
cp .env.example .env
```
