// TimeFlow — configuração do site. PREENCHA ANTES DE PUBLICAR.
// email:    endereço que recebe os pedidos de demonstração (obrigatório)
// whatsapp: só números, com DDI e DDD, ex.: "5511999998888" (opcional; vazio esconde o botão)
// dpo:      e-mail do encarregado de dados (LGPD); se vazio, usa o e-mail acima
// demoApi:  endereço do assistente de IA (Cloudflare Worker), ex.: "https://timeflow-demo-ia.SEU-SUBDOMINIO.workers.dev"
//           vazio = a demonstração com IA fica escondida
// analyticsToken: token do Cloudflare Web Analytics (estatística de visitas sem cookies); vazio = desligado
window.TIMEFLOW = {
  analyticsToken: "f2bec6b48aa74d1baa2a1335e0df6abd",
  email: "7felipe.gomes@gmail.com",
  whatsapp: "5544997653909",
  dpo: "",
  empresa: "Creditall Tecnologia",
  demoApi: "https://timeflow-demo-ia.timeflow-demo-ia.workers.dev"
};

(function () {
  var c = window.TIMEFLOW || {};
  var assunto = encodeURIComponent("Quero uma demonstração do TimeFlow");
  // Os botões "Agendar demonstração" levam ao bloco de contato (#contato); lá o visitante
  // escolhe WhatsApp, Gmail, app de e-mail ou copiar o endereço. Link mailto sozinho não
  // funciona em quem não tem app de e-mail configurado.
  document.querySelectorAll("[data-mailto]").forEach(function (a) {
    a.href = "mailto:" + c.email + "?subject=" + assunto;
    a.hidden = !c.email;
  });
  document.querySelectorAll("[data-gmail]").forEach(function (a) {
    a.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(c.email || "") + "&su=" + assunto;
    a.hidden = !c.email;
  });
  var toast = document.querySelector("[data-toast]");
  function avisar(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(avisar.t);
    avisar.t = setTimeout(function () { toast.classList.remove("show"); }, 3500);
  }
  function copiarTexto(texto) {
    // método que funciona também com o site aberto como arquivo local
    var ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.hidden = !c.email;
    b.addEventListener("click", function () {
      var ok = copiarTexto(c.email);
      if (ok) {
        b.textContent = "E-mail copiado ✓";
        avisar("E-mail copiado: " + c.email + " — cole no seu programa de e-mail.");
        setTimeout(function () { b.textContent = "Copiar e-mail"; }, 2500);
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(c.email).then(function () {
          avisar("E-mail copiado: " + c.email);
        }, function () { window.prompt("Copie o e-mail:", c.email); });
      } else {
        window.prompt("Copie o e-mail:", c.email);
      }
    });
  });
  document.querySelectorAll("[data-gmail]").forEach(function (a) {
    a.addEventListener("click", function () { avisar("Abrindo o Gmail em uma nova aba…"); });
  });
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    if (!c.whatsapp) {
      a.hidden = true;
      return;
    }
    var num = c.whatsapp.replace(/\D/g, "");
    a.href = "https://wa.me/" + num + "?text=" + assunto;  // celular: abre o app direto
    a.hidden = false;
    a.addEventListener("click", function (ev) {
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
      // Computador: tenta o WhatsApp Desktop direto na conversa. Se o app não estiver
      // instalado (a página não perde o foco), abre o WhatsApp Web na conversa.
      ev.preventDefault();
      var abriuApp = false;
      var marcar = function () { abriuApp = true; };
      window.addEventListener("blur", marcar);
      document.addEventListener("visibilitychange", marcar);
      avisar("Abrindo a conversa no WhatsApp…");
      window.location.href = "whatsapp://send?phone=" + num + "&text=" + assunto;
      setTimeout(function () {
        window.removeEventListener("blur", marcar);
        document.removeEventListener("visibilitychange", marcar);
        if (!abriuApp) {
          window.open("https://web.whatsapp.com/send?phone=" + num + "&text=" + assunto, "_blank", "noopener");
        }
      }, 1800);
    });
  });
  document.querySelectorAll("[data-email-text]").forEach(function (el) {
    el.textContent = c.email || "(e-mail ainda não configurado)";
  });
  document.querySelectorAll("[data-dpo]").forEach(function (el) {
    el.textContent = c.dpo || c.email || "(e-mail ainda não configurado)";
  });
  document.querySelectorAll("[data-empresa]").forEach(function (el) {
    el.textContent = c.empresa || "";
  });
  var y = document.getElementById("ano");
  if (y) y.textContent = new Date().getFullYear();
  // Cloudflare Web Analytics: contagem agregada de visitas, sem cookies e sem identificar pessoas.
  if (c.analyticsToken && /^[A-Za-z0-9]{16,64}$/.test(c.analyticsToken)) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: c.analyticsToken }));
    document.head.appendChild(s);
  }
})();
