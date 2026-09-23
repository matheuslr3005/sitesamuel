/* ==========================================================================
   La Torre — Cliente da API (substitui a antiga camada de localStorage)
   Todas as funções que acessam dados agora são assíncronas, pois
   conversam com o back-end em Node.js + SQLite.
   ========================================================================== */

const API_BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* respostas 204 (sem corpo) chegam aqui */
  }

  if (!res.ok) {
    throw new Error(body?.erro || `Erro inesperado (${res.status}).`);
  }
  return body;
}

function normalizeRestaurant(r) {
  if (!r) return r;
  return {
    id: r.id,
    nome: r.nome,
    cidade: r.cidade,
    endereco: r.endereco,
    cozinha: r.cozinha,
    faixaPreco: r.faixa_preco,
    estrelas: r.estrelas,
    imagem: r.imagem,
    descricao: r.descricao,
    criadoPor: r.criado_por,
  };
}

/* ---------------- Restaurantes (CRUD via API) ---------------- */

const RestaurantStore = {
  async all() {
    const { restaurantes } = await apiFetch("/restaurants");
    return restaurantes.map(normalizeRestaurant);
  },
  async get(id) {
    try {
      const { restaurante } = await apiFetch(`/restaurants/${id}`);
      return normalizeRestaurant(restaurante);
    } catch {
      return null;
    }
  },
  async create(data) {
    const { restaurante } = await apiFetch("/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeRestaurant(restaurante);
  },
  async update(id, data) {
    const { restaurante } = await apiFetch(`/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return normalizeRestaurant(restaurante);
  },
  async remove(id) {
    await apiFetch(`/restaurants/${id}`, { method: "DELETE" });
  },
};

/* ---------------- Autenticação (via API) ---------------- */

const AuthAPI = {
  async cadastro({ nome, email, senha }) {
    const { usuario } = await apiFetch("/auth/cadastro", {
      method: "POST",
      body: JSON.stringify({ nome, email, senha }),
    });
    return usuario;
  },
  async login({ email, senha }) {
    const { usuario } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    return usuario;
  },
  async logout() {
    await apiFetch("/auth/logout", { method: "POST" });
  },
  async me() {
    try {
      const { usuario } = await apiFetch("/auth/me");
      return usuario;
    } catch {
      return null;
    }
  },
};

/* O "usuário logado" agora vive num cookie httpOnly (o JS não consegue
   nem deve ler esse cookie diretamente); Session.get() pergunta ao
   servidor quem está autenticado no momento. */
const Session = {
  async get() {
    return AuthAPI.me();
  },
  async isLoggedIn() {
    return !!(await this.get());
  },
};
