# timeflow-site

Site público do TimeFlow: página principal (`index.html`) e página de privacidade/LGPD (`lgpd.html`).
HTML e CSS puros, sem build e sem dependências — funciona no GitHub Pages, Vercel ou Netlify.

## Antes de publicar (obrigatório)

Abra `assets/config.js` e preencha:

- `email` — endereço que recebe os pedidos de demonstração;
- `whatsapp` — opcional, só números com DDI e DDD (ex.: `5511999998888`);
- `dpo` — e-mail do encarregado de dados (LGPD); se ficar vazio, usa o `email`.

Sem o `email`, os botões "Agendar demonstração" não levam a lugar nenhum.

- `demoApi` — endereço do assistente de demonstração com IA (projeto `../timeflow-demo-ia`).
  Vazio = o botão "Demonstração com IA" não aparece e o resto do site funciona normalmente.

## Publicar pelo GitHub (sem instalar nada)

1. Entre em github.com → botão **New** (novo repositório) → nome `timeflow-site` → **Public**
   (o GitHub Pages gratuito exige repositório público) → **Create repository**.
2. Na página do repositório vazio, clique em **uploading an existing file**.
3. Arraste para a página **o conteúdo** da pasta `timeflow-site` (os arquivos `index.html`, `lgpd.html`,
   `README.md`, `.nojekyll` e a pasta `assets`), não a pasta em si → **Commit changes**.
4. **Settings → Pages** → em *Build and deployment*, Source: **Deploy from a branch**, Branch: **main**,
   pasta **/(root)** → **Save**.
5. Em 1–2 minutos o site fica em `https://<seu-usuario>.github.io/timeflow-site/`.

Domínio próprio (ex.: `timeflow.ai`): em **Settings → Pages → Custom domain**, informe o domínio e crie
no provedor do domínio o registro DNS que o GitHub indicar.

## Conteúdo

Todo o texto descreve só o que o produto já faz segundo a documentação interna (junho/julho de 2026).
O painel da página inicial é um **exemplo ilustrativo** e está identificado como tal. Não há preços no site:
a chamada é para demonstração e proposta — veja `../comercial/PRECOS_PROPOSTA.md` antes de decidir.
