const express = require("express");
const db = require("../db");
const { exigirAutenticacao } = require("../middleware/auth");

const router = express.Router();

const FAIXAS_VALIDAS = ["€", "€€", "€€€", "€€€€"];

function validarDados(body, { parcial = false } = {}) {
  const dados = {
    nome: (body.nome ?? "").trim(),
    cidade: (body.cidade ?? "").trim(),
    endereco: (body.endereco ?? "").trim(),
    cozinha: (body.cozinha ?? "").trim(),
    faixa_preco: body.faixaPreco ?? body.faixa_preco ?? "€€",
    estrelas: Number(body.estrelas ?? 0),
    imagem: (body.imagem ?? "").trim() || "img/restaurantes/default.jpg",
    descricao: (body.descricao ?? "").trim(),
  };

  const obrigatorios = ["nome", "cidade", "cozinha", "descricao"];
  if (!parcial) {
    for (const campo of obrigatorios) {
      if (!dados[campo]) return { erro: `O campo "${campo}" é obrigatório.` };
    }
  }
  if (!FAIXAS_VALIDAS.includes(dados.faixa_preco)) {
    return { erro: "Faixa de preço inválida." };
  }
  if (!Number.isInteger(dados.estrelas) || dados.estrelas < 0 || dados.estrelas > 3) {
    return { erro: "A classificação deve ser um número inteiro entre 0 e 3 estrelas." };
  }

  return { dados };
}

/* ---------------------------------------------------------
   GET /api/restaurants
   Consulta pública, com busca e filtros opcionais.
   --------------------------------------------------------- */
router.get("/", (req, res) => {
  const { termo, cidade, cozinha } = req.query;

  let sql = "SELECT * FROM restaurants WHERE 1 = 1";
  const params = [];

  if (cidade) {
    sql += " AND cidade = ?";
    params.push(cidade);
  }
  if (cozinha) {
    sql += " AND cozinha = ?";
    params.push(cozinha);
  }
  if (termo) {
    sql += " AND (nome LIKE ? OR cidade LIKE ? OR cozinha LIKE ?)";
    const like = `%${termo}%`;
    params.push(like, like, like);
  }
  sql += " ORDER BY criado_em DESC";

  const lista = db.prepare(sql).all(...params);
  res.json({ restaurantes: lista });
});

/* GET /api/restaurants/:id */
router.get("/:id", (req, res) => {
  const restaurante = db
    .prepare("SELECT * FROM restaurants WHERE id = ?")
    .get(req.params.id);
  if (!restaurante) return res.status(404).json({ erro: "Restaurante não encontrado." });
  res.json({ restaurante });
});

/* ---------------------------------------------------------
   POST /api/restaurants — Cadastro (Create)
   Regra de negócio: exige autenticação.
   --------------------------------------------------------- */
router.post("/", exigirAutenticacao, (req, res) => {
  const { erro, dados } = validarDados(req.body);
  if (erro) return res.status(400).json({ erro });

  const { lastInsertRowid: id } = db
    .prepare(
      `INSERT INTO restaurants
        (nome, cidade, endereco, cozinha, faixa_preco, estrelas, imagem, descricao, criado_por)
       VALUES (@nome, @cidade, @endereco, @cozinha, @faixa_preco, @estrelas, @imagem, @descricao, @criado_por)`
    )
    .run({ ...dados, criado_por: req.usuario.id });

  const restaurante = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(id);
  res.status(201).json({ restaurante });
});

/* ---------------------------------------------------------
   PUT /api/restaurants/:id — Edição/Atualização (Update)
   Regras de negócio: exige autenticação e só o usuário que
   cadastrou o restaurante pode editá-lo.
   --------------------------------------------------------- */
router.put("/:id", exigirAutenticacao, (req, res) => {
  const existente = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(req.params.id);
  if (!existente) return res.status(404).json({ erro: "Restaurante não encontrado." });
  if (existente.criado_por !== req.usuario.id) {
    return res.status(403).json({ erro: "Você só pode editar restaurantes que você mesmo cadastrou." });
  }

  const { erro, dados } = validarDados(req.body);
  if (erro) return res.status(400).json({ erro });

  db.prepare(
    `UPDATE restaurants SET
      nome = @nome, cidade = @cidade, endereco = @endereco, cozinha = @cozinha,
      faixa_preco = @faixa_preco, estrelas = @estrelas, imagem = @imagem,
      descricao = @descricao, atualizado_em = datetime('now')
     WHERE id = @id`
  ).run({ ...dados, id: req.params.id });

  const restaurante = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(req.params.id);
  res.json({ restaurante });
});

/* ---------------------------------------------------------
   DELETE /api/restaurants/:id — Exclusão (Delete)
   Mesma regra de propriedade da edição.
   --------------------------------------------------------- */
router.delete("/:id", exigirAutenticacao, (req, res) => {
  const existente = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(req.params.id);
  if (!existente) return res.status(404).json({ erro: "Restaurante não encontrado." });
  if (existente.criado_por !== req.usuario.id) {
    return res.status(403).json({ erro: "Você só pode excluir restaurantes que você mesmo cadastrou." });
  }

  db.prepare("DELETE FROM restaurants WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

module.exports = router;
