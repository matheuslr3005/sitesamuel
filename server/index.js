require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

require("./db"); // garante que o banco/tabelas existam antes de tudo

const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurants");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);

// Front-end estático (HTML/CSS/JS/imagens) na raiz do projeto
app.use(express.static(path.join(__dirname, "..")));

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`La Torre rodando em http://localhost:${PORT}`);
});
