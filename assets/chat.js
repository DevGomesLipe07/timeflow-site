// TimeFlow — janela de demonstração com IA.
// Conversa com o serviço configurado em window.TIMEFLOW.demoApi (Cloudflare Worker).
// Sem demoApi configurado, a janela não aparece e o site funciona normalmente.
(function () {
  var c = window.TIMEFLOW || {};
  if (!c.demoApi) return;

  var MAX_MSGS = 30;
  var CHAVE = "tf-demo-conversa";
  var historico = []; // {role, content} enviados ao serviço
  var ocupado = false;
  // A conversa fica só nesta aba (sessionStorage): some ao fechar a janela.
  function salvar() {
    try { sessionStorage.setItem(CHAVE, JSON.stringify(historico)); } catch (e) { /* sem armazenamento: segue sem salvar */ }
  }
  function carregar() {
    try {
      var h = JSON.parse(sessionStorage.getItem(CHAVE) || "[]");
      return Array.isArray(h) ? h.filter(function (m) { return m && m.content; }).slice(-MAX_MSGS) : [];
    } catch (e) { return []; }
  }

  var SAUDACAO = "Olá! Sou a assistente de demonstração do TimeFlow. Me conte um pouco da sua operação — " +
    "quantas pessoas tem a equipe e em que área elas trabalham — que eu mostro como o TimeFlow funcionaria para vocês.";
  var SUGESTOES = ["Tenho uma equipe de cobrança", "Como funciona a privacidade?", "Quero ver os relatórios"];

  // ---------- estrutura ----------
  var fab = document.createElement("button");
  fab.className = "tf-fab";
  fab.type = "button";
  fab.innerHTML = "<span>💬</span> Demonstração com IA";

  var painel = document.createElement("section");
  painel.className = "tf-chat";
  painel.hidden = true;
  painel.setAttribute("aria-label", "Demonstração do TimeFlow com IA");
  painel.innerHTML =
    '<header class="tf-chat-head"><div><strong>Demonstração TimeFlow</strong><small>Assistente de IA</small></div>' +
    '<button type="button" class="tf-close" aria-label="Fechar">×</button></header>' +
    '<p class="tf-aviso">Você está conversando com uma IA, que pode errar. Não compartilhe senhas nem dados pessoais sensíveis.</p>' +
    '<div class="tf-msgs" role="log" aria-live="polite"></div>' +
    '<div class="tf-sug"></div>' +
    '<form class="tf-form"><textarea rows="1" maxlength="1500" placeholder="Escreva sua pergunta…" aria-label="Sua mensagem"></textarea>' +
    '<button type="submit" aria-label="Enviar">➤</button></form>';
  document.body.appendChild(fab);
  document.body.appendChild(painel);

  var msgs = painel.querySelector(".tf-msgs");
  var sug = painel.querySelector(".tf-sug");
  var form = painel.querySelector(".tf-form");
  var campo = form.querySelector("textarea");
  var botaoEnviar = form.querySelector("button");

  // ---------- renderização segura (sem innerHTML com texto da IA) ----------
  var MARCA = /\[\[CONTATO(?::\s*([^\]]*))?\]\]/;
  var MARCA_PARCIAL = /\[\[?C?O?N?T?A?T?O?[^\]\n]*$/;

  function linkWhatsApp(resumo) {
    var num = (c.whatsapp || "").replace(/\D/g, "");
    var texto = "Olá! Vim pela demonstração do TimeFlow no site." + (resumo ? " " + resumo : "");
    if (num) return "https://wa.me/" + num + "?text=" + encodeURIComponent(texto);
    return "#contato";
  }

  function renderizar(bolha, texto, final) {
    var resumo = null;
    var m = texto.match(MARCA);
    if (m) {
      resumo = (m[1] || "").trim();
      texto = texto.replace(MARCA, "").trim();
    } else if (!final) {
      texto = texto.replace(MARCA_PARCIAL, "");
    }
    bolha.textContent = "";
    var lista = null;
    texto.split("\n").forEach(function (linha) {
      var t = linha.trim();
      if (!t) { lista = null; return; }
      if (/^[-•]\s+/.test(t)) {
        if (!lista) { lista = document.createElement("ul"); bolha.appendChild(lista); }
        var li = document.createElement("li");
        li.textContent = t.replace(/^[-•]\s+/, "");
        lista.appendChild(li);
      } else {
        lista = null;
        var p = document.createElement("p");
        p.textContent = t.replace(/\*\*/g, "");
        bolha.appendChild(p);
      }
    });
    if (final && m) {
      var a = document.createElement("a");
      a.className = "tf-contato";
      a.href = linkWhatsApp(resumo);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = c.whatsapp ? "Falar com a equipe no WhatsApp" : "Falar com a equipe";
      if (c.whatsapp && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // computador: tenta abrir o WhatsApp Desktop direto na conversa
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          var num = c.whatsapp.replace(/\D/g, "");
          var texto = "Olá! Vim pela demonstração do TimeFlow no site." + (resumo ? " " + resumo : "");
          var abriu = false;
          var marcar = function () { abriu = true; };
          window.addEventListener("blur", marcar);
          window.location.href = "whatsapp://send?phone=" + num + "&text=" + encodeURIComponent(texto);
          setTimeout(function () {
            window.removeEventListener("blur", marcar);
            if (!abriu) window.open("https://web.whatsapp.com/send?phone=" + num + "&text=" + encodeURIComponent(texto), "_blank", "noopener");
          }, 1800);
        });
      }
      bolha.appendChild(a);
      bolha.appendChild(ofertaContato(resumo));
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ---------- "prefiro que me chamem": deixa nome e contato ----------
  function campoTexto(nome, rotulo, tipo, obrigatorio) {
    var l = document.createElement("label");
    l.textContent = rotulo;
    var i = document.createElement("input");
    i.name = nome;
    i.type = tipo;
    i.maxLength = 120;
    i.required = !!obrigatorio;
    l.appendChild(i);
    return l;
  }

  function ofertaContato(resumo) {
    var caixa = document.createElement("div");
    caixa.className = "tf-lead";
    var abrirForm = document.createElement("button");
    abrirForm.type = "button";
    abrirForm.className = "tf-lead-link";
    abrirForm.textContent = "Prefiro que a equipe me chame";
    caixa.appendChild(abrirForm);
    abrirForm.addEventListener("click", function () {
      abrirForm.hidden = true;
      var f = document.createElement("form");
      f.appendChild(campoTexto("nome", "Seu nome", "text", true));
      f.appendChild(campoTexto("contato", "E-mail ou WhatsApp com DDD", "text", true));
      f.appendChild(campoTexto("empresa", "Empresa (opcional)", "text", false));
      var armadilha = document.createElement("input"); // invisível: só robôs preenchem
      armadilha.name = "site"; armadilha.tabIndex = -1; armadilha.autocomplete = "off"; armadilha.className = "tf-hp";
      f.appendChild(armadilha);
      var ok = document.createElement("label");
      ok.className = "tf-consent";
      var cb = document.createElement("input");
      cb.type = "checkbox"; cb.required = true;
      ok.appendChild(cb);
      ok.appendChild(document.createTextNode(" Autorizo a equipe do TimeFlow a me contatar sobre esta demonstração. "));
      var pol = document.createElement("a");
      pol.href = "lgpd.html"; pol.target = "_blank"; pol.textContent = "Privacidade";
      ok.appendChild(pol);
      f.appendChild(ok);
      var enviarBt = document.createElement("button");
      enviarBt.type = "submit"; enviarBt.textContent = "Enviar";
      f.appendChild(enviarBt);
      var status = document.createElement("p");
      status.className = "tf-lead-status";
      f.appendChild(status);
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        enviarBt.disabled = true;
        status.textContent = "Enviando…";
        fetch(c.demoApi.replace(/\/$/, "") + "/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: f.nome.value, contato: f.contato.value, empresa: f.empresa.value,
            site: armadilha.value, consentimento: cb.checked, resumo: resumo || ""
          })
        }).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (!r.ok) throw new Error(j.erro || "Não consegui enviar agora.");
          });
        }).then(function () {
          caixa.textContent = "";
          var p = document.createElement("p");
          p.className = "tf-lead-ok";
          p.textContent = "Recebido! A equipe do TimeFlow vai falar com você em breve.";
          caixa.appendChild(p);
        }).catch(function (e) {
          status.textContent = e.message || "Não consegui enviar agora. Tente pelo WhatsApp.";
          enviarBt.disabled = false;
        });
      });
      caixa.appendChild(f);
      msgs.scrollTop = msgs.scrollHeight;
      f.nome.focus();
    });
    return caixa;
  }

  function bolha(role, texto) {
    var b = document.createElement("div");
    b.className = "tf-msg " + (role === "user" ? "tf-user" : "tf-ai");
    msgs.appendChild(b);
    if (texto != null) renderizar(b, texto, true);
    return b;
  }

  function sugestoes(lista) {
    sug.textContent = "";
    lista.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", function () { enviar(s); });
      sug.appendChild(b);
    });
  }

  // ---------- conversa ----------
  function enviar(texto) {
    texto = (texto || "").trim();
    if (!texto || ocupado) return;
    if (historico.length >= MAX_MSGS) {
      var b = bolha("assistant", "Esta conversa ficou longa. Para continuar, fale com a nossa equipe [[CONTATO: continuação da demonstração do site]]");
      return b;
    }
    ocupado = true;
    botaoEnviar.disabled = true;
    sugestoes([]);
    bolha("user", texto);
    historico.push({ role: "user", content: texto });
    campo.value = "";
    campo.style.height = "";

    var resp = bolha("assistant", null);
    resp.classList.add("tf-digitando");
    var acumulado = "";

    fetch(c.demoApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: historico })
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          throw new Error(j.erro || "Não consegui responder agora. Tente de novo em instantes.");
        });
      }
      var leitor = r.body.getReader();
      var dec = new TextDecoder();
      function ler() {
        return leitor.read().then(function (p) {
          if (p.done) return;
          acumulado += dec.decode(p.value, { stream: true });
          resp.classList.remove("tf-digitando");
          renderizar(resp, acumulado, false);
          return ler();
        });
      }
      return ler();
    }).then(function () {
      resp.classList.remove("tf-digitando");
      renderizar(resp, acumulado, true);
      if (acumulado.trim()) historico.push({ role: "assistant", content: acumulado });
      salvar();
    }).catch(function (e) {
      resp.classList.remove("tf-digitando");
      renderizar(resp, e.message || "Não consegui responder agora.", true);
      historico.pop(); // permite reenviar a mesma pergunta
    }).then(function () {
      ocupado = false;
      botaoEnviar.disabled = false;
      campo.focus();
    });
  }

  function abrir() {
    painel.hidden = false;
    fab.hidden = true;
    try { sessionStorage.removeItem(CHAVE + "-fechado"); } catch (e) { /* ignora */ }
    if (!msgs.childElementCount) {
      bolha("assistant", SAUDACAO);
      var anterior = carregar();
      if (anterior.length) {
        historico = anterior;
        anterior.forEach(function (m) { bolha(m.role === "user" ? "user" : "assistant", m.content); });
      } else {
        sugestoes(SUGESTOES);
      }
    }
    setTimeout(function () { campo.focus(); }, 50);
  }

  fab.addEventListener("click", abrir);
  painel.querySelector(".tf-close").addEventListener("click", function () {
    painel.hidden = true;
    fab.hidden = false;
    try { sessionStorage.setItem(CHAVE + "-fechado", "1"); } catch (e) { /* ignora */ }
  });
  form.addEventListener("submit", function (ev) { ev.preventDefault(); enviar(campo.value); });
  campo.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); enviar(campo.value); }
  });
  campo.addEventListener("input", function () {
    campo.style.height = "";
    campo.style.height = Math.min(campo.scrollHeight, 120) + "px";
  });
  document.querySelectorAll("[data-demo-ia]").forEach(function (el) {
    el.hidden = false;
    el.addEventListener("click", function (ev) { ev.preventDefault(); abrir(); });
  });
  // Conversa em andamento nesta aba: reabre a janela ao trocar de página.
  var fechado = false;
  try { fechado = sessionStorage.getItem(CHAVE + "-fechado") === "1"; } catch (e) { /* ignora */ }
  if (carregar().length && !fechado) abrir();
})();
