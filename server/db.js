const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "latorre.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cidade TEXT NOT NULL,
    endereco TEXT,
    cozinha TEXT NOT NULL,
    faixa_preco TEXT NOT NULL CHECK (faixa_preco IN ('€','€€','€€€','€€€€')),
    estrelas INTEGER NOT NULL DEFAULT 0 CHECK (estrelas BETWEEN 0 AND 3),
    imagem TEXT,
    descricao TEXT NOT NULL,
    criado_por INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT
  );
`);

/* ------------------------------------------------------------------
   Seed inicial: cria um usuário "equipe" e os restaurantes de
   demonstração, apenas na primeira execução (banco vazio).
   ------------------------------------------------------------------ */
const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;

if (userCount === 0) {
  const SEED_EMAIL = "equipe@latorre.app";
  const SEED_SENHA = "latorre123";
  const senha_hash = bcrypt.hashSync(SEED_SENHA, 10);

  const criarUsuario = db.prepare(
    "INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)"
  );
  const { lastInsertRowid: equipeId } = criarUsuario.run(
    "Equipe La Torre",
    SEED_EMAIL,
    senha_hash
  );

  const SEED_RESTAURANTS = [
    {
      nome: "Trattoria Vesuvio",
      cidade: "Roma",
      endereco: "Via dei Fori Imperiali, 12",
      cozinha: "Tradicional Romana",
      faixa_preco: "€€€",
      estrelas: 3,
      imagem: "img/restaurantes/roma.jpg",
      descricao:
        "Massas artesanais e cozinha romana autêntica em um salão íntimo perto do Coliseu.",
    },
    {
      nome: "Osteria Dorata",
      cidade: "Florença",
      endereco: "Piazza della Signoria, 4",
      cozinha: "Toscana",
      faixa_preco: "€€€€",
      estrelas: 2,
      imagem: "img/restaurantes/florenca.jpg",
      descricao:
        "Carnes grelhadas e vinhos toscanos selecionados em ambiente elegante e clássico.",
    },
    {
      nome: "La Piccola Cucina",
      cidade: "Nápoles",
      endereco: "Via San Biagio dei Librai, 88",
      cozinha: "Napolitana",
      faixa_preco: "€€",
      estrelas: 1,
      imagem: "img/restaurantes/napoles.jpg",
      descricao:
        "A verdadeira pizza napoletana, forno a lenha e receitas de família há três gerações.",
    },
    {
      nome: "Il Giardino Segreto",
      cidade: "Veneza",
      endereco: "Calle dei Fabbri, 23",
      cozinha: "Frutos do Mar",
      faixa_preco: "€€€€",
      estrelas: 3,
      imagem: "img/restaurantes/veneza.jpg",
      descricao:
        "Frutos do mar frescos da laguna com vista para os canais, em um jardim escondido.",
    },
    {
      nome: "Bottega di Milano",
      cidade: "Milão",
      endereco: "Corso Buenos Aires, 55",
      cozinha: "Contemporânea Italiana",
      faixa_preco: "€€€",
      estrelas: 1,
      imagem: "img/restaurantes/milao.jpg",
      descricao:
        "Cozinha italiana com toque contemporâneo, no coração do distrito da moda.",
    },
    {
      nome: "Cantina del Sole",
      cidade: "Palermo",
      endereco: "Via Vittorio Emanuele, 140",
      cozinha: "Siciliana",
      faixa_preco: "€€",
      estrelas: 2,
      imagem: "img/restaurantes/palermo.jpg",
      descricao:
        "Sabores sicilianos vibrantes, com destaque para arancini e peixe fresco do mercado.",
    },
  ];

  const criarRestaurante = db.prepare(`
    INSERT INTO restaurants
      (nome, cidade, endereco, cozinha, faixa_preco, estrelas, imagem, descricao, criado_por)
    VALUES (@nome, @cidade, @endereco, @cozinha, @faixa_preco, @estrelas, @imagem, @descricao, @criado_por)
  `);

  const inserirTodos = db.transaction((lista) => {
    for (const r of lista) criarRestaurante.run({ ...r, criado_por: equipeId });
  });
  inserirTodos(SEED_RESTAURANTS);

  console.log("[db] Banco inicializado com dados de exemplo.");
  console.log(`[db] Usuário de demonstração: ${SEED_EMAIL} / senha: ${SEED_SENHA}`);
}

module.exports = db;
