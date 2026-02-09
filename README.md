<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Zustand-5-443E38?logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer&logoColor=white" alt="Motion" />
  <img src="https://img.shields.io/badge/GA4-Analytics-E37400?logo=googleanalytics&logoColor=white" alt="GA4" />
</p>

# 🌺 Flor do Maracujá

> **Cozinha Regional com Sabor de Casa** — Site institucional, cardápio digital e sistema de captura de leads para o restaurante Flor do Maracujá, especializado em culinária regional brasileira há mais de 15 anos.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Uso](#-instalação-e-uso)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Banco de Dados (Supabase)](#-banco-de-dados-supabase)
- [Painel Administrativo](#-painel-administrativo)
- [Captura de Leads](#-captura-de-leads)
- [Google Analytics 4](#-google-analytics-4)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Componentes Principais](#-componentes-principais)
- [Gerenciamento de Estado](#-gerenciamento-de-estado)
- [Design e UX](#-design-e-ux)
- [Atribuições](#-atribuições)

---

## 💡 Sobre o Projeto

O **Flor do Maracujá** é um site completo para um restaurante de culinária regional brasileira. O projeto vai além de um site institucional — funciona como um **cardápio digital interativo** com carrinho de compras e finalização de pedidos via **WhatsApp**, sistema de **captura de leads** com envio para banco de dados Supabase, **painel administrativo** protegido, e **tracking completo com Google Analytics 4**.

O design foi concebido no [Figma](https://www.figma.com/design/DckSNkUE4fWJbML9NoPsfA/Restaurant-website-development) e implementado com foco em performance, animações fluidas e experiência mobile-first.

---

## ✨ Funcionalidades

### 🍽️ Cardápio Digital
- Dados do cardápio carregados do **Supabase** (com fallback para dados mock)
- Filtro por categorias (Pratos Principais, Entradas, Sobremesas, Bebidas)
- Badges de destaque: **Mais Pedido**, **Novidade**, **Picante**
- Seletor de quantidade e campo de observações por item
- Grade responsiva com animações de entrada escalonadas

### 🛒 Carrinho de Compras
- Drawer lateral com gestão completa de itens
- Ajuste de quantidade e remoção individual
- Campo de endereço para entrega
- Código promocional (`FLOR10` = 10% OFF)
- Geração automática de mensagem formatada para WhatsApp
- Fluxo em duas etapas: edição → pré-visualização → envio

### 💬 Integração WhatsApp
- Botão flutuante sempre visível (FAB)
- Pedido completo enviado como mensagem pré-formatada
- Rastreamento de eventos integrado com GA4

### 📊 Captura de Leads (Novo)
- Formulário inline na landing page com design mobile-first
- Campos: Nome, Email, WhatsApp (obrigatórios) + Aniversário, Preferências, Código Promo (opcionais)
- Validação em tempo real (onBlur) com mensagens claras em português
- Máscara automática de telefone `(XX) XXXXX-XXXX` e data `DD/MM/AAAA`
- Bloqueio de domínios de email descartáveis (~20 domínios)
- Validação de idade mínima 18 anos na data de nascimento
- Chips interativos para seleção de preferências
- Conversão automática de código promo para maiúsculas
- Envio direto para tabela `leads` no **Supabase**
- Verificação de email duplicado antes do insert
- **Retry automático** (3 tentativas com backoff exponencial)
- **Fallback offline** — salva no `localStorage` e reenvia ao voltar online
- **Rate limiting** — 1 minuto entre submissões
- **Honeypot anti-spam** — campo invisível para detectar bots
- **Checkbox LGPD** obrigatório com links para termos e privacidade
- Barra de progresso visual animada
- Rascunho salvo no `localStorage` (recupera dados ao recarregar)
- Tela de sucesso animada com código promo `FLOR10`
- Tracking GA4 completo em cada etapa do funil

### 📈 Google Analytics 4 (Novo)
- Integração via `gtag.js` com Measurement ID configurável por variável de ambiente
- **Eventos de formulário**: `form_view`, `form_start`, `form_progress`, `form_submit`, `generate_lead`, `form_error`
- **Eventos de comportamento**: scroll depth (25/50/75/90%), section views, engagement time
- **Eventos de interação**: `cta_click`, `contact_click`, `promo_code_entered`, `preferences_selected`
- **Atribuição**: captura automática de UTM parameters + referrer + device type
- **Lead scoring**: classificação automática em `low` / `medium` / `high` com evento `high_intent_lead`
- Console logging em modo desenvolvimento para debug

### 🔒 Painel Administrativo
- Rota protegida `/admin` com autenticação Supabase
- Login via `/admin/login`
- Módulos de gerenciamento:
  - **Cardápio** — CRUD de itens do menu
  - **Promoções** — CRUD de banners promocionais
  - **Pedidos** — Visualização e gestão de pedidos
  - **Avaliações** — Gerenciamento de depoimentos/reviews
  - **Leads** — Visualização e gestão de leads capturados

### 📍 Localização
- Google Maps embutido com coordenadas do restaurante
- Indicador em tempo real de **Aberto / Fechado** baseado nos horários
- Cards informativos: endereço, telefone, horários, Instagram
- Botão "Como Chegar" integrado com Google Maps Directions

### 🎠 Seções Visuais
- **Hero Carousel** — Carrossel fullscreen com efeito de digitação no título e auto-avanço
- **Banners Promocionais** — Carrossel com transições animadas e filtro de banners ativos
- **Depoimentos** — Carrossel 3D com rotação, estrelas e estatísticas agregadas
- **Sobre Nós** — Storytelling com blockquote, badges e emojis flutuantes animados

### 🎨 Tema e Acessibilidade
- Dark mode com toggle na navegação
- Design responsivo (mobile-first)
- Animações baseadas em scroll (Intersection Observer)
- Navegação suave com scroll offset para header fixo

---

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **Backend / DB** | Supabase (PostgreSQL) |
| **Estilização** | Tailwind CSS 4 + CSS Custom Properties |
| **Componentes UI** | shadcn/ui (Radix UI primitives) |
| **Animações** | Framer Motion (motion) |
| **Estado Global** | Zustand (com persistência em localStorage) |
| **Roteamento** | React Router DOM |
| **Analytics** | Google Analytics 4 (gtag.js) |
| **Carrossel** | Embla Carousel |
| **Ícones** | Lucide React + MUI Icons |
| **Notificações** | Sonner |

---

## 📦 Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9 (ou pnpm)
- Conta no **Supabase** (plano gratuito é suficiente)
- Conta no **Google Analytics 4** (para tracking)

---

## 🚀 Instalação e Uso

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/flor-do-maracuja.git
cd flor-do-maracuja

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e VITE_GA4_MEASUREMENT_ID

# 4. Execute as migrations no Supabase SQL Editor
# → Arquivo: migrations/001_create_tables.sql
# → Arquivo: migrations/002_supabase_storage.sql

# 5. Inicie o servidor de desenvolvimento
npm run dev

# 6. Acesse no navegador
# → http://localhost:5173
# → Painel admin: http://localhost:5173/admin/login
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção otimizado |

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (veja `.env.example`):

```env
# Supabase — obrigatórias
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Analytics 4 — opcional (tracking desabilitado se vazio)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

| Variável | Descrição | Obrigatória |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon key) do Supabase | ✅ |
| `VITE_GA4_MEASUREMENT_ID` | Measurement ID do Google Analytics 4 | Não |

---

## 🗃️ Banco de Dados (Supabase)

### Tabelas

O schema é definido nas migrations em `migrations/`:

| Tabela | Descrição | Campos principais |
|---|---|---|
| `menu_items` | Itens do cardápio | name, description, price, category, badges, available |
| `promo_banners` | Banners promocionais | title, description, image_path, active, valid_until |
| `orders` | Pedidos recebidos | items (JSON), total, customer_name, status |
| `reviews` | Avaliações de clientes | name, rating, comment, approved |
| `leads` | Leads capturados | name, email, phone, birthday, preferences, promo_code |

### Tabela de Leads (detalhada)

```sql
leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  birthday    TEXT,           -- formato ISO: YYYY-MM-DD
  preferences TEXT,           -- lista separada por vírgula
  promo_code  TEXT,           -- ex: FLOR10
  created_at  TIMESTAMPTZ DEFAULT now()
)
```

### Setup

1. Crie um projeto no [Supabase](https://supabase.com)
2. Abra o **SQL Editor**
3. Execute `migrations/001_create_tables.sql`
4. Execute `migrations/002_supabase_storage.sql`
5. Copie a URL e Anon Key de **Settings → API** para o `.env`

---

## 🛡️ Painel Administrativo

Acessível em `/admin` (protegido por autenticação Supabase).

### Rotas

| Rota | Componente | Acesso |
|---|---|---|
| `/` | `App.tsx` | Público |
| `/admin/login` | `LoginPage.tsx` | Público |
| `/admin` | `AdminLayout.tsx` | Protegido |

### Módulos do Admin

- **Cardápio (`MenuManager`)** — Criar, editar, excluir itens do menu com upload de imagem
- **Promoções (`PromoBannersManager`)** — Gerenciar banners com ativação/desativação
- **Pedidos (`OrdersManager`)** — Visualizar e atualizar status de pedidos
- **Avaliações (`ReviewsManager`)** — Aprovar/rejeitar depoimentos de clientes
- **Leads (`LeadsManager`)** — Visualizar e exportar leads capturados

---

## 📊 Captura de Leads

### Fluxo do Formulário

```
Usuário chega → Rola a página → Vê seção "Cliente Especial"
  → GA4: form_view
  → Clica no primeiro campo
  → GA4: form_start (first_field: 'name')
  → Preenche campos (validação em tempo real)
  → GA4: form_progress (33%, 66%, 100%)
  → Clica "Cadastrar e Ganhar Desconto"
  → GA4: form_submit
  → Verifica email duplicado → POST no Supabase
  → Sucesso → GA4: generate_lead (conversão!)
  → Tela de sucesso com código FLOR10
  → Erro → GA4: form_error + mensagem ao usuário
```

### Anti-Spam

- **Honeypot**: campo `website` invisível — se preenchido, rejeita silenciosamente
- **Rate limiting**: mínimo 1 minuto entre submissões (via `localStorage`)
- **Validação rigorosa**: regex de email, bloqueio de domínios descartáveis

### Offline Fallback

Se o usuário estiver sem conexão:
1. O lead é salvo no `localStorage` (chave `flor_offline_leads`)
2. Ao recarregar a página com conexão, o hook `useLeadCapture` tenta reenviar automaticamente
3. Leads duplicados são descartados silenciosamente

### Arquivos Relacionados

| Arquivo | Responsabilidade |
|---|---|
| `src/app/components/LeadCaptureForm.tsx` | Componente visual do formulário |
| `src/hooks/useLeadCapture.ts` | Hook de submissão (retry, offline, rate limit) |
| `src/lib/leadValidation.ts` | Validações, formatação e sanitização |
| `src/lib/analytics.ts` | Módulo centralizado de eventos GA4 |

---

## 📈 Google Analytics 4

### Configuração

1. Crie uma propriedade GA4 em [analytics.google.com](https://analytics.google.com)
2. Copie o Measurement ID (ex: `G-8XKBV7822W`)
3. Adicione ao `.env`:
   ```
   VITE_GA4_MEASUREMENT_ID=G-8XKBV7822W
   ```
4. O script `gtag.js` é carregado automaticamente no `index.html`

### Eventos Implementados

#### Formulário de Leads

| Evento | Trigger | Parâmetros |
|---|---|---|
| `form_view` | Formulário entra no viewport | `form_name`, `form_location` |
| `form_start` | Primeiro campo recebe foco | `form_name`, `first_field` |
| `form_progress` | Marcos de 33%, 66%, 100% | `progress_percentage`, `last_field_completed` |
| `promo_code_entered` | Campo de código promo preenchido | `has_promo` |
| `preferences_selected` | Preferências alteradas | `preferences_count`, `preferences` |
| `form_submit` | Clique no botão de envio | `form_fields_filled` |
| `generate_lead` | Lead salvo com sucesso (conversão) | `lead_source`, `has_promo_code`, `value` |
| `form_error` | Erro na submissão | `error_type`, `error_message` |

#### Comportamento na Página

| Evento | Trigger | Parâmetros |
|---|---|---|
| `scroll` | Scroll em 25%, 50%, 75%, 90% | `percent_scrolled` |
| `section_view` | Seção entra no viewport | `section_name`, `time_to_view` |
| `user_engagement` | A cada 30s, 60s, 120s, 300s | `engagement_time_msec` |
| `cta_click` | Clique em botão CTA | `cta_text`, `cta_location`, `cta_type` |
| `contact_click` | Clique em WhatsApp/telefone/email | `contact_method`, `contact_location` |
| `attribution_captured` | Carregamento da página | UTMs, referrer, device_type |
| `high_intent_lead` | Após submissão com scoring | `quality_score`, `time_on_page`, `scroll_depth` |

### Debug

- Em **modo desenvolvimento** (`npm run dev`), todos os eventos são logados no console: `[GA4] event_name {params}`
- No GA4, use **Admin → DebugView** + extensão [GA Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/) para monitorar em tempo real
- Para marcar `generate_lead` como conversão: **Admin → Events → marcar como "Key event"**

### Relatórios Úteis no GA4

| Relatório | Como criar |
|---|---|
| **Funil de conversão** | Explorations → Funnel: `form_view → form_start → form_submit → generate_lead` |
| **Taxa de erro** | Events → filtrar `form_error` → agrupar por `error_type` |
| **Abandono por campo** | Events → filtrar `form_progress` → analisar `last_field_completed` |
| **Qualidade de leads** | Events → filtrar `high_intent_lead` → agrupar por `quality_score` |
| **Atribuição** | Events → filtrar `generate_lead` → agrupar por `lead_source` |

---

## 📁 Estrutura do Projeto

```
flor_site/
├── index.html                  # Entry point HTML (inclui script GA4)
├── package.json                # Dependências e scripts
├── vite.config.ts              # Configuração do Vite + aliases (@/ → src/)
├── postcss.config.mjs          # Configuração PostCSS
├── .env.example                # Template de variáveis de ambiente
│
├── migrations/
│   ├── 001_create_tables.sql   # Schema: menu_items, orders, reviews, leads, etc.
│   └── 002_supabase_storage.sql # Buckets de storage para imagens
│
└── src/
    ├── main.tsx                # Bootstrap da aplicação (React DOM)
    ├── env.d.ts                # Tipagem das variáveis de ambiente Vite
    │
    ├── app/
    │   ├── App.tsx             # Componente raiz — orquestra seções + GA4 tracking
    │   ├── Router.tsx          # Roteamento: / (site), /admin/login, /admin
    │   │
    │   └── components/
    │       ├── Navigation.tsx          # Barra de navegação fixa com menu mobile
    │       ├── HeroCarousel.tsx        # Carrossel hero fullscreen
    │       ├── PromoBanners.tsx        # Banners promocionais rotativos
    │       ├── AboutSection.tsx        # Seção "Sobre Nós"
    │       ├── MenuSection.tsx         # Cardápio com filtros e add-to-cart
    │       ├── LeadCaptureForm.tsx     # ★ Formulário de captura de leads (novo)
    │       ├── ClienteEspecialForm.tsx # Formulário legado (modal simples)
    │       ├── TestimonialsSection.tsx # Depoimentos em carrossel 3D
    │       ├── LocationSection.tsx     # Mapa + informações de contato
    │       ├── CartDrawer.tsx          # Drawer do carrinho de compras
    │       ├── FloatingWhatsApp.tsx    # Botões flutuantes (WhatsApp + Cart)
    │       ├── Footer.tsx              # Rodapé com contato e horários
    │       ├── SplashScreen.tsx        # Tela de splash animada
    │       │
    │       ├── admin/                  # Painel administrativo
    │       │   ├── AdminLayout.tsx     # Layout com tabs do admin
    │       │   ├── MenuManager.tsx     # CRUD de cardápio
    │       │   ├── PromoBannersManager.tsx # CRUD de promoções
    │       │   ├── OrdersManager.tsx   # Gestão de pedidos
    │       │   ├── ReviewsManager.tsx  # Gestão de avaliações
    │       │   ├── LeadsManager.tsx    # Gestão de leads
    │       │   └── ImageUploader.tsx   # Upload de imagens (Supabase Storage)
    │       │
    │       ├── auth/
    │       │   ├── LoginPage.tsx       # Página de login admin
    │       │   └── ProtectedRoute.tsx  # Guard de rota protegida
    │       │
    │       ├── figma/
    │       │   └── ImageWithFallback.tsx  # Imagem com fallback
    │       │
    │       └── ui/                     # Biblioteca de componentes shadcn/ui
    │           ├── button.tsx, card.tsx, dialog.tsx, input.tsx, ...
    │           └── (30+ componentes Radix UI)
    │
    ├── contexts/
    │   └── AuthContext.tsx      # Context de autenticação Supabase
    │
    ├── hooks/
    │   ├── useLeadCapture.ts   # ★ Hook de submissão de leads (retry, offline)
    │   ├── useGA4PageTracking.ts # ★ Hooks de tracking GA4 (scroll, sections)
    │   ├── useLeads.ts         # CRUD de leads (admin)
    │   ├── useMenu.ts          # CRUD de cardápio (admin)
    │   ├── useOrders.ts        # CRUD de pedidos (admin)
    │   ├── useReviews.ts       # CRUD de avaliações (admin)
    │   ├── usePromoBanners.ts  # CRUD de promoções (admin)
    │   ├── usePublicMenu.ts    # Leitura pública do cardápio
    │   └── usePublicPromoBanners.ts # Leitura pública de promoções
    │
    ├── lib/
    │   ├── analytics.ts        # ★ Módulo centralizado GA4 (eventos + UTMs + scoring)
    │   ├── leadValidation.ts   # ★ Validações e formatação do formulário de leads
    │   ├── database.types.ts   # Tipagem do schema Supabase (Row, Insert, Update)
    │   ├── supabase.ts         # Cliente Supabase inicializado
    │   ├── storage.ts          # Helpers para Supabase Storage
    │   ├── types.ts            # Interfaces (MenuItem, CartItem, Customer, etc.)
    │   ├── store.ts            # Store Zustand (cart, theme, admin)
    │   ├── mockData.ts         # Dados mock para fallback
    │   └── utils.ts            # Utilitários (formatCurrency, WhatsApp, etc.)
    │
    └── styles/
        ├── index.css           # Imports globais
        ├── tailwind.css        # Configuração Tailwind
        ├── theme.css           # Variáveis CSS (light/dark mode)
        └── fonts.css           # Configuração de fontes (Inter, Montserrat)
```

> Arquivos marcados com ★ foram adicionados no módulo de captura de leads e tracking GA4.

---

## 🧩 Componentes Principais

### `App.tsx`
Componente raiz que orquestra a renderização de todas as seções na ordem: **Navigation → Hero → Promo Banners → About → Menu → Lead Capture → Testimonials → Location → Footer**, além dos elementos flutuantes (WhatsApp FAB, Cart Drawer, Toaster). Ativa o hook `useGA4PageTracking()` que monitora scroll, seções visualizadas, tempo de engajamento e UTMs.

### `LeadCaptureForm.tsx`
Formulário inline na landing page (seção "Seja um Cliente Especial") com validação em tempo real, máscara de campos, barra de progresso, honeypot anti-spam, checkbox LGPD, tracking GA4 completo, e tela de sucesso animada. Substitui o antigo `ClienteEspecialForm.tsx` com envio real para o banco de dados.

### `MenuSection.tsx`
Coração do cardápio digital. Extrai categorias dinamicamente dos dados (Supabase ou mock), renderiza cards com imagem/preço/badges, e inclui um fluxo inline de adição ao carrinho com quantidade e observações.

### `CartDrawer.tsx`
Drawer lateral com spring animations. Implementa checkout em duas etapas — o cliente revisa o pedido, aplica código promo, adiciona endereço, e finaliza enviando tudo via WhatsApp com mensagem pré-formatada.

### `AdminLayout.tsx`
Layout do painel administrativo com navegação por tabs (Cardápio, Promoções, Pedidos, Avaliações, Leads). Protegido por `ProtectedRoute` com autenticação Supabase.

---

## 🗄️ Gerenciamento de Estado

### Zustand (Client-Side)

O estado global é gerenciado com **Zustand** e persiste no `localStorage`:

| Domínio | Funcionalidades |
|---|---|
| **Cart** | `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart` |
| **Theme** | `isDarkMode`, `toggleDarkMode` |
| **Menu** | CRUD completo de itens do cardápio |
| **Customers** | Cadastro de clientes especiais |
| **Testimonials** | CRUD de depoimentos |
| **Promo Banners** | CRUD de banners promocionais |

### Supabase (Server-Side)

Cada tabela possui um hook dedicado com operações CRUD via Supabase client:

| Hook | Tabela | Uso |
|---|---|---|
| `useMenu` / `usePublicMenu` | `menu_items` | Admin / Público |
| `usePromoBanners` / `usePublicPromoBanners` | `promo_banners` | Admin / Público |
| `useOrders` | `orders` | Admin |
| `useReviews` | `reviews` | Admin |
| `useLeads` | `leads` | Admin |
| `useLeadCapture` | `leads` | Público (formulário) |

### Contextos React

| Contexto | Responsabilidade |
|---|---|
| `AuthContext` | Estado de autenticação Supabase (user, signIn, signOut) |

---

## 🎨 Design e UX

- **Paleta de cores**: tons terrosos e dourados (`#FFC107`, `#D4A017`) que remetem à culinária regional, com verde do WhatsApp como cor de ação
- **Tipografia**: Inter (corpo) + Montserrat (headings), pesos `400` / `500` / `700`
- **Animações**: todas baseadas em Framer Motion com triggers de scroll (Intersection Observer), transições spring e stagger
- **Dark Mode**: variáveis CSS customizadas (`--background`, `--foreground`, etc.) com classe `.dark`
- **Responsividade**: breakpoints Tailwind padrão, layout single-column em mobile com navegação hamburger
- **SEO**: meta tags completas (Open Graph, Twitter Cards), JSON-LD (Restaurant schema), canonical URL, noscript fallback

---

## 📄 Atribuições

- Componentes UI: [shadcn/ui](https://ui.shadcn.com/) — Licença MIT
- Fotografias: [Unsplash](https://unsplash.com/) — Unsplash License

---

<p align="center">
  Feito com ❤️ para o <strong>Flor do Maracujá</strong> 🌺
</p>