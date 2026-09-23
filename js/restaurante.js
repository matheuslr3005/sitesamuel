/* ==========================================================================
   La Torre — Página de detalhe do restaurante
   ========================================================================== */

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function renderDetail() {
  const root = document.querySelector("#detail-root");
  if (!root) return;

  const id = getIdFromQuery();
  const r = id ? await RestaurantStore.get(id) : null;

  if (!r) {
    root.innerHTML = `
      <div class="container">
        <div class="empty-state">
          <h3>Restaurante não encontrado</h3>
          <p>O restaurante que você procura não existe ou foi removido.</p>
          <br />
          <a class="btn btn-primary" href="index.html">Voltar para o início</a>
        </div>
      </div>`;
    document.title = "Restaurante não encontrado — La Torre";
    return;
  }

  document.title = `${r.nome} — La Torre`;

  root.innerHTML = `
    <div class="detail-hero">
      <img src="${escapeHTML(r.imagem)}" alt="${escapeHTML(r.nome)}" />
      <div class="detail-hero-content container">
        <span class="card-cuisine" style="color:var(--color-gold)">${escapeHTML(r.cozinha)}</span>
        <h1>${escapeHTML(r.nome)}</h1>
        <p>📍 ${escapeHTML(r.endereco)}, ${escapeHTML(r.cidade)}</p>
      </div>
    </div>

    <div class="container">
      <div class="detail-grid">
        <div>
          <div class="detail-block">
            <h2>Sobre</h2>
            <p>${escapeHTML(r.descricao)}</p>
          </div>
        </div>
        <div>
          <div class="detail-block">
            <h2>Informações</h2>
            <ul class="info-list">
              <li><span class="label">Classificação</span> <span>${starsMarkup(r.estrelas)}</span></li>
              <li><span class="label">Faixa de preço</span> <span>${escapeHTML(r.faixaPreco)}</span></li>
              <li><span class="label">Cozinha</span> <span>${escapeHTML(r.cozinha)}</span></li>
              <li><span class="label">Cidade</span> <span>${escapeHTML(r.cidade)}</span></li>
              <li><span class="label">Endereço</span> <span>${escapeHTML(r.endereco)}</span></li>
            </ul>
          </div>
          <a href="index.html" class="btn btn-outline btn-block">← Voltar à lista</a>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderDetail);
