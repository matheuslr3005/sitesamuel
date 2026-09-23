/* ==========================================================================
   La Torre — Camada de dados (localStorage)
   Centraliza acesso a "usuários" e "restaurantes".
   Feito para ser trocado depois por chamadas fetch() a uma API Node.js,
   mantendo os mesmos nomes de função.
   ========================================================================== */

const DB_KEYS = {
  USERS: "latorre_users",
  RESTAURANTS: "latorre_restaurants",
  SESSION: "latorre_session",
};

const SEED_RESTAURANTS = [
  {
    id: "r1",
    nome: "Trattoria Vesuvio",
    cidade: "Roma",
    endereco: "Via dei Fori Imperiali, 12",
    cozinha: "Tradicional Romana",
    faixaPreco: "€€€",
    estrelas: 3,
    descricao:
      "Massas artesanais e cozinha romana autêntica em um salão íntimo perto do Coliseu.",
    imagem:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Pasta_alla_Gricia.jpg?width=900",
  },
  {
    id: "r2",
    nome: "Osteria Dorata",
    cidade: "Florença",
    endereco: "Piazza della Signoria, 4",
    cozinha: "Toscana",
    faixaPreco: "€€€€",
    estrelas: 2,
    descricao:
      "Carnes grelhadas e vinhos toscanos selecionados em ambiente elegante e clássico.",
    imagem:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bistecca_alla_Fiorentina.jpg?width=900",
  },
  {
    id: "r3",
    nome: "La Piccola Cucina",
    cidade: "Nápoles",
    endereco: "Via San Biagio dei Librai, 88",
    cozinha: "Napolitana",
    faixaPreco: "€€",
    estrelas: 1,
    descricao:
      "A verdadeira pizza napoletana, forno a lenha e receitas de família há três gerações.",
    imagem:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Italian_Pizza_(funghi).jpg?width=900",
  },
  {
    id: "r4",
    nome: "Il Giardino Segreto",
    cidade: "Veneza",
    endereco: "Calle dei Fabbri, 23",
    cozinha: "Frutos do Mar",
    faixaPreco: "€€€€",
    estrelas: 3,
    descricao:
      "Frutos do mar frescos da laguna com vista para os canais, em um jardim escondido.",
    imagem:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Strozzapreti_Pasta.JPG?width=900",
  },
  {
    id: "r5",
    nome: "Bottega di Milano",
    cidade: "Milão",
    endereco: "Corso Buenos Aires, 55",
    cozinha: "Contemporânea Italiana",
    faixaPreco: "€€€",
    estrelas: 1,
    descricao:
      "Cozinha italiana com toque contemporâneo, no coração do distrito da moda.",
    imagem:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Trattoria_Da_Franca_e_Lillo_Milano_04.jpg?width=900",
  },
  {
    id: "r6",
    nome: "Cantina del Sole",
    cidade: "Palermo",
    endereco: "Via Vittorio Emanuele, 140",
    cozinha: "Siciliana",
    faixaPreco: "€€",
    estrelas: 2,
    descricao:
      "Sabores sicilianos vibrantes, com destaque para arancini e peixe fresco do mercado.",
    imagem:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Arancine_in_Favignana.jpg?width=900",
  },
];

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("Erro ao ler", key, e);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  if (!localStorage.getItem(DB_KEYS.RESTAURANTS)) {
    writeJSON(DB_KEYS.RESTAURANTS, SEED_RESTAURANTS);
  }
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    writeJSON(DB_KEYS.USERS, []);
  }
}
ensureSeed();

/* ---------------- Restaurantes (CRUD) ---------------- */

const RestaurantStore = {
  all() {
    return readJSON(DB_KEYS.RESTAURANTS, []);
  },
  get(id) {
    return this.all().find((r) => r.id === id) || null;
  },
  create(data) {
    const list = this.all();
    const novo = { id: uid("r"), ...data };
    list.unshift(novo);
    writeJSON(DB_KEYS.RESTAURANTS, list);
    return novo;
  },
  update(id, data) {
    const list = this.all();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, id };
    writeJSON(DB_KEYS.RESTAURANTS, list);
    return list[idx];
  },
  remove(id) {
    const list = this.all().filter((r) => r.id !== id);
    writeJSON(DB_KEYS.RESTAURANTS, list);
  },
};

/* ---------------- Usuários / Autenticação ---------------- */

const UserStore = {
  all() {
    return readJSON(DB_KEYS.USERS, []);
  },
  findByEmail(email) {
    return this.all().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  create({ nome, email, senha }) {
    const list = this.all();
    const novo = { id: uid("u"), nome, email, senha };
    list.push(novo);
    writeJSON(DB_KEYS.USERS, list);
    return novo;
  },
};

const Session = {
  get() {
    return readJSON(DB_KEYS.SESSION, null);
  },
  set(user) {
    writeJSON(DB_KEYS.SESSION, { id: user.id, nome: user.nome, email: user.email });
  },
  clear() {
    localStorage.removeItem(DB_KEYS.SESSION);
  },
  isLoggedIn() {
    return !!this.get();
  },
};
