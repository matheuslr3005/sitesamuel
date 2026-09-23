const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const {
  criarToken,
  definirCookie,
  limparCookie,
  exigirAutenticacao,
} = require("../middleware/auth");

const router = express.Router();

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/* ---------------------------------------------------------
   POST /api/auth/cadastro
   Regras de negócio:
   - nome, email e senha são obrigatórios
   - email precisa ter formato válido
   - senha precisa ter no mínimo 6 caracteres
   - email precisa ser único no sistema
   --------------------------------------------------------- */
router.post("/cadastro", (req, res) => {
  const nome = (req.body.nome || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const senha = req.body.senha || "";

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha nome, e-mail e senha." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ erro: "Informe um e-mail válido." });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
  }

  const existente = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existente) {
    return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
  }

  const senha_hash = bcrypt.hashSync(senha, 10);
  const { lastInsertRowid: id } = db
    .prepare("INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)")
    .run(nome, email, senha_hash);

  const usuario = { id, nome, email };
  definirCookie(res, criarToken(usuario));
  res.status(201).json({ usuario });
});

/* ---------------------------------------------------------
   POST /api/auth/login
   Regras de negócio:
   - e-mail e senha obrigatórios
   - senha verificada por hash (bcrypt), nunca em texto puro
   --------------------------------------------------------- */
router.post("/login", (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const senha = req.body.senha || "";

  if (!email || !senha) {
    return res.status(400).json({ erro: "Informe e-mail e senha." });
  }

  const usuario = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    return res.status(401).json({ erro: "E-mail ou senha inválidos." });
  }

  const dadosPublicos = { id: usuario.id, nome: usuario.nome, email: usuario.email };
  definirCookie(res, criarToken(dadosPublicos));
  res.json({ usuario: dadosPublicos });
});

/* POST /api/auth/logout */
router.post("/logout", (req, res) => {
  limparCookie(res);
  res.json({ ok: true });
});

/* GET /api/auth/me — retorna o usuário autenticado (ou 401) */
router.get("/me", exigirAutenticacao, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;
