/* ==========================================================================
   La Torre — Área do usuário: CRUD de restaurantes (Create, Read, Update, Delete)
   ========================================================================== */

let editingId = null;
let sessaoAtual = null;

async function renderTable() {
  const tbody = document.querySelector("#restaurant-table-body");
  const emptyState = document.querySelector("#table-empty");
  if (!tbody) return;

  let lista;
  try {
    lista = await RestaurantStore.all();
  } catch (err) {
    showToast(err.message, "error");
    return;
  }

  if (lista.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }
  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = lista
    .map((r) => {
      const souDono = sessaoAtual && r.criadoPor === sessaoAtual.id;
      const acoes = souDono
        ? `<button class="btn btn-outline btn-sm" data-edit="${r.id}">Editar</button>
           <button class="btn btn-danger btn-sm" data-delete="${r.id}">Excluir</button>`
        : `<span class="badge" title="Somente quem cadastrou pode editar ou excluir">Somente leitura</span>`;

      return `
      <tr>
        <td><img class="table-thumb" src="${escapeHTML(r.imagem)}" alt="${escapeHTML(r.nome)}" /></td>
        <td>
          <strong>${escapeHTML(r.nome)}</strong><br />
          <span class="badge badge-gold">${escapeHTML(r.cozinha)}</span>
        </td>
        <td>${escapeHTML(r.cidade)}</td>
        <td>${escapeHTML(r.faixaPreco)}</td>
        <td>${starsMarkup(r.estrelas)}</td>
        <td>
          <div class="table-actions">${acoes}</div>
        </td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openModal(btn.dataset.edit))
  );
  tbody.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => confirmDelete(btn.dataset.delete))
  );
}

async function openModal(id = null) {
  editingId = id;
  const modal = document.querySelector("#restaurant-modal");
  const form = document.querySelector("#restaurant-form");
  const title = document.querySelector("#modal-title");
  form.reset();

  if (id) {
    const r = await RestaurantStore.get(id);
    if (!r) return;
    title.textContent = "Editar restaurante";
    form.nome.value = r.nome;
    form.cidade.value = r.cidade;
    form.endereco.value = r.endereco;
    form.cozinha.value = r.cozinha;
    form.faixaPreco.value = r.faixaPreco;
    form.estrelas.value = r.estrelas;
    form.imagem.value = r.imagem;
    form.descricao.value = r.descricao;
  } else {
    title.textContent = "Novo restaurante";
  }

  modal.classList.add("show");
}

function closeModal() {
  document.querySelector("#restaurant-modal").classList.remove("show");
  editingId = null;
}

async function confirmDelete(id) {
  const r = await RestaurantStore.get(id);
  if (!r) return;
  if (!confirm(`Tem certeza que deseja excluir "${r.nome}"? Essa ação não pode ser desfeita.`)) {
    return;
  }
  try {
    await RestaurantStore.remove(id);
    await renderTable();
    showToast(`"${r.nome}" foi excluído.`);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function handleFormSubmit() {
  const form = document.querySelector("#restaurant-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nome: form.nome.value.trim(),
      cidade: form.cidade.value.trim(),
      endereco: form.endereco.value.trim(),
      cozinha: form.cozinha.value.trim(),
      faixaPreco: form.faixaPreco.value,
      estrelas: Number(form.estrelas.value),
      imagem: form.imagem.value.trim(),
      descricao: form.descricao.value.trim(),
    };

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      if (editingId) {
        await RestaurantStore.update(editingId, data);
        showToast(`"${data.nome}" foi atualizado.`);
      } else {
        await RestaurantStore.create(data);
        showToast(`"${data.nome}" foi adicionado.`);
      }
      closeModal();
      await renderTable();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function initDashboard() {
  sessaoAtual = await requireAuth();
  if (!sessaoAtual) return;

  const nameLabel = document.querySelector("[data-dash-name]");
  if (nameLabel) nameLabel.textContent = sessaoAtual.nome;

  await renderTable();
  handleFormSubmit();

  document.querySelector("#btn-new-restaurant")?.addEventListener("click", () => openModal(null));
  document.querySelectorAll("[data-modal-close]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  document.querySelector("#restaurant-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "restaurant-modal") closeModal();
  });
}

document.addEventListener("DOMContentLoaded", initDashboard);
