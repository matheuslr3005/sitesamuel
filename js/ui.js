/* ==========================================================================
   La Torre — Utilitários de interface (navbar, toast, menu mobile)
   Deve ser incluído em todas as páginas, depois de data.js.
   ========================================================================== */

async function initNavbar() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }

  const session = await Session.get();
  const chip = document.querySelector("[data-user-chip]");
  const authLinks = document.querySelector("[data-auth-links]");
  const restrictedLinks = document.querySelectorAll("[data-requires-auth]");

  if (session) {
    if (authLinks) authLinks.style.display = "none";
    if (chip) {
      chip.style.display = "flex";
      const avatar = chip.querySelector(".avatar");
      const name = chip.querySelector("[data-user-name]");
      if (avatar) avatar.textContent = session.nome.trim().charAt(0).toUpperCase();
      if (name) name.textContent = session.nome.split(" ")[0];
    }
    restrictedLinks.forEach((el) => (el.style.display = ""));
  } else {
    restrictedLinks.forEach((el) => (el.style.display = "none"));
  }

  const logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await AuthAPI.logout();
      showToast("Você saiu da sua conta.");
      setTimeout(() => (window.location.href = "index.html"), 600);
    });
  }
}

/** Garante que há um usuário autenticado; redireciona para login.html
 *  caso contrário. Retorna os dados do usuário quando autenticado. */
async function requireAuth() {
  const session = await Session.get();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type === "error" ? "error" : ""}`.trim();
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function starsMarkup(count) {
  const total = 3;
  let html = "";
  for (let i = 0; i < total; i++) {
    html += `<span class="star">${i < count ? "★" : "☆"}</span>`;
  }
  return html;
}

function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initNavbar);
