/* ==========================================================================
   La Torre — Login e Cadastro (via API)
   ========================================================================== */

function handleLoginForm() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  const errorBox = form.querySelector(".form-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.remove("show");

    const email = form.email.value.trim();
    const senha = form.senha.value;

    if (!email || !senha) {
      errorBox.textContent = "Preencha e-mail e senha.";
      errorBox.classList.add("show");
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      const usuario = await AuthAPI.login({ email, senha });
      showToast(`Bem-vindo de volta, ${usuario.nome.split(" ")[0]}!`);
      setTimeout(() => (window.location.href = "area.html"), 500);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.add("show");
      submitBtn.disabled = false;
    }
  });
}

function handleRegisterForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const errorBox = form.querySelector(".form-error");
  const successBox = form.querySelector(".form-success");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.remove("show");
    successBox.classList.remove("show");

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const senha = form.senha.value;
    const confirmarSenha = form.confirmarSenha.value;

    if (!nome || !email || !senha || !confirmarSenha) {
      return showError("Preencha todos os campos.");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return showError("Informe um e-mail válido.");
    }
    if (senha.length < 6) {
      return showError("A senha deve ter pelo menos 6 caracteres.");
    }
    if (senha !== confirmarSenha) {
      return showError("As senhas não coincidem.");
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      await AuthAPI.cadastro({ nome, email, senha });
      successBox.textContent = "Conta criada com sucesso! Redirecionando...";
      successBox.classList.add("show");
      form.reset();
      setTimeout(() => (window.location.href = "area.html"), 900);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
    }

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.classList.add("show");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  handleLoginForm();
  handleRegisterForm();
});
