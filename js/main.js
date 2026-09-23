/* ==========================================================================
   La Torre — Página inicial (listagem e busca de restaurantes)
   ========================================================================== */

let activeCuisineFilter = "Todas";
let todosOsRestaurantes = [];

function populateCityOptions() {
  const select = document.querySelector("#filter-cidade");
  if (!select) return;
  const cidades = [...new Set(todosOsRestaurantes.map((r) => r.cidade))].sort();
  cidades.forEach((cidade) => {
    const opt = document.createElement("option");
    opt.value = cidade;
    opt.textContent = cidade;
    select.appendChild(opt);
  });
}

function buildCuisineChips() {
  const wrapper = document.querySelector("#cuisine-chips");
  if (!wrapper) return;
  const cozinhas = ["Todas", ...new Set(todosOsRestaurantes.map((r) => r.cozinha))];

  wrapper.innerHTML = cozinhas
    .map(
      (c) =>
        `<button type="button" class="chip ${c === activeCuisineFilter ? "active" : ""}" data-cuisine="${escapeHTML(c)}">${escapeHTML(c)}</button>`
    )
    .join("");

  wrapper.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCuisineFilter = chip.dataset.cuisine;
      buildCuisineChips();
      renderRestaurants();
    });
  });
}

function cardTemplate(r) {
  return `
    <article class="restaurant-card">
      <a href="restaurante.html?id=${r.id}" class="card-media">
        <span class="card-price">${escapeHTML(r.faixaPreco)}</span>
        <span class="card-stars">${starsMarkup(r.estrelas)}</span>
        <img src="${escapeHTML(r.imagem)}" alt="${escapeHTML(r.nome)}" loading="lazy" />
      </a>
      <div class="card-body">
        <span class="card-cuisine">${escapeHTML(r.cozinha)}</span>
        <h3><a href="restaurante.html?id=${r.id}">${escapeHTML(r.nome)}</a></h3>
        <span class="card-location">📍 ${escapeHTML(r.cidade)}</span>
        <p class="card-desc">${escapeHTML(r.descricao)}</p>
        <div class="card-footer">
          <a class="card-link" href="restaurante.html?id=${r.id}">Ver detalhes →</a>
        </div>
      </div>
    </article>
  `;
}

function renderRestaurants() {
  const grid = document.querySelector("#restaurant-grid");
  const countLabel = document.querySelector("#result-count");
  if (!grid) return;

  const termo = (document.querySelector("#filter-busca")?.value || "").trim().toLowerCase();
  const cidade = document.querySelector("#filter-cidade")?.value || "";

  let lista = todosOsRestaurantes;

  if (activeCuisineFilter !== "Todas") {
    lista = lista.filter((r) => r.cozinha === activeCuisineFilter);
  }
  if (cidade) {
    lista = lista.filter((r) => r.cidade === cidade);
  }
  if (termo) {
    lista = lista.filter(
      (r) =>
        r.nome.toLowerCase().includes(termo) ||
        r.cidade.toLowerCase().includes(termo) ||
        r.cozinha.toLowerCase().includes(termo)
    );
  }

  if (countLabel) {
    countLabel.textContent = `${lista.length} restaurante${lista.length !== 1 ? "s" : ""} encontrado${lista.length !== 1 ? "s" : ""}`;
  }

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <h3>Nenhum restaurante encontrado</h3>
        <p>Tente ajustar a busca ou os filtros selecionados.</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map(cardTemplate).join("");
}

function initHomeSearch() {
  const form = document.querySelector("#search-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    renderRestaurants();
  });
  document.querySelector("#filter-cidade")?.addEventListener("change", renderRestaurants);
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("#restaurant-grid");
  if (!grid) return;

  try {
    todosOsRestaurantes = await RestaurantStore.all();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><h3>Não foi possível carregar os restaurantes</h3><p>${escapeHTML(err.message)}</p></div>`;
    return;
  }

  populateCityOptions();
  buildCuisineChips();
  renderRestaurants();
  initHomeSearch();
});
