const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-troque-em-producao";
const COOKIE_NAME = "latorre_token";

function criarToken(usuario) {
  return jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function definirCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function limparCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

/** Middleware: exige usuário autenticado (401 se não estiver). */
function exigirAutenticacao(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ erro: "É necessário estar autenticado." });
  }
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

/** Middleware: anexa req.usuario se houver token válido, mas não bloqueia a rota. */
function autenticacaoOpcional(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      req.usuario = jwt.verify(token, JWT_SECRET);
    } catch {
      /* token inválido: segue como visitante anônimo */
    }
  }
  next();
}

module.exports = {
  criarToken,
  definirCookie,
  limparCookie,
  exigirAutenticacao,
  autenticacaoOpcional,
};
