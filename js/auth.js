/* ==========================================================================
   La Torre — Login e Cadastro
   ========================================================================== */

function handleLoginForm() {
  const form = document.querySelector("#login-form");
  if (!form) return;

  const errorBox = form.querySelector(".form-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.classList.remove("show");

    const email = form.email.value.trim();
    const senha = form.senha.value;

    if (!email || !senha) {
      errorBox.textContent = "Preencha e-mail e senha.";
      errorBox.classList.add("show");
      return;
    }

    const user = UserStore.findByEmail(email);
    if (!user || user.senha !== senha) {
      errorBox.textContent = "E-mail ou senha inválidos.";
      errorBox.classList.add("show");
      return;
    }

    Session.set(user);
    showToast(`Bem-vindo de volta, ${user.nome.split(" ")[0]}!`);
    setTimeout(() => (window.location.href = "area.html"), 500);
  });
}

function handleRegisterForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const errorBox = form.querySelector(".form-error");
  const successBox = form.querySelector(".form-success");

  form.addEventListener("submit", (e) => {
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
    if (UserStore.findByEmail(email)) {
      return showError("Já existe uma conta com este e-mail.");
    }

    const user = UserStore.create({ nome, email, senha });
    Session.set(user);

    successBox.textContent = "Conta criada com sucesso! Redirecionando...";
    successBox.classList.add("show");
    form.reset();
    setTimeout(() => (window.location.href = "area.html"), 900);

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
