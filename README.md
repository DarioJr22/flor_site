<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-5-443E38?logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer&logoColor=white" alt="Motion" />
</p>

# 🌺 Flor do Maracujá

> **Cozinha Regional com Sabor de Casa** — Site institucional e cardápio digital para o restaurante Flor do Maracujá, especializado em culinária regional brasileira há mais de 15 anos.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Uso](#-instalação-e-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Componentes Principais](#-componentes-principais)
- [Gerenciamento de Estado](#-gerenciamento-de-estado)
- [Design e UX](#-design-e-ux)
- [Atribuições](#-atribuições)

---

## 💡 Sobre o Projeto

O **Flor do Maracujá** é um site completo para um restaurante de culinária regional brasileira. O projeto vai além de um site institucional — funciona como um **cardápio digital interativo** com carrinho de compras e finalização de pedidos via **WhatsApp**, eliminando a necessidade de um sistema de pagamento integrado.

O design foi concebido no [Figma](https://www.figma.com/design/DckSNkUE4fWJbML9NoPsfA/Restaurant-website-development) e implementado com foco em performance, animações fluidas e experiência mobile-first.

---

## ✨ Funcionalidades

### 🍽️ Cardápio Digital
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
- Rastreamento de eventos (Google Analytics ready)

### 🌟 Programa Cliente Especial
- Formulário de cadastro com validação client-side
- Formatação automática de telefone `(XX) XXXXX-XXXX`
- Geração de código promocional exclusivo
- Benefícios: 10% OFF no primeiro pedido, presente de aniversário, promos exclusivas

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
| **Estilização** | Tailwind CSS 4 + CSS Custom Properties |
| **Componentes UI** | shadcn/ui (Radix UI primitives) |
| **Animações** | Framer Motion (motion) |
| **Estado Global** | Zustand (com persistência em localStorage) |
| **Carrossel** | Embla Carousel + React Slick |
| **Ícones** | Lucide React + MUI Icons |
| **Notificações** | Sonner |
| **Formulários** | React Hook Form |

---

## 📦 Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9 (ou pnpm)

---

## 🚀 Instalação e Uso

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/flor-do-maracuja.git
cd flor-do-maracuja

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# → http://localhost:5173
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção otimizado |

---

## 📁 Estrutura do Projeto

```
flor_site/
├── index.html                  # Entry point HTML
├── package.json                # Dependências e scripts
├── vite.config.ts              # Configuração do Vite + aliases
├── postcss.config.mjs          # Configuração PostCSS
│
├── guidelines/
│   └── Guidelines.md           # Diretrizes de design para IA
│
└── src/
    ├── main.tsx                # Bootstrap da aplicação
    │
    ├── app/
    │   ├── App.tsx             # Componente raiz — orquestra todas as seções
    │   │
    │   └── components/
    │       ├── Navigation.tsx          # Barra de navegação fixa com menu mobile
    │       ├── HeroCarousel.tsx        # Carrossel hero fullscreen
    │       ├── PromoBanners.tsx        # Banners promocionais rotativos
    │       ├── AboutSection.tsx        # Seção "Sobre Nós"
    │       ├── MenuSection.tsx         # Cardápio com filtros e add-to-cart
    │       ├── ClienteEspecialForm.tsx # Formulário de cadastro especial
    │       ├── TestimonialsSection.tsx # Depoimentos em carrossel 3D
    │       ├── LocationSection.tsx     # Mapa + informações de contato
    │       ├── CartDrawer.tsx          # Drawer do carrinho de compras
    │       ├── FloatingWhatsApp.tsx    # Botões flutuantes (WhatsApp + Cart)
    │       ├── Footer.tsx              # Rodapé com contato e horários
    │       │
    │       ├── figma/
    │       │   └── ImageWithFallback.tsx  # Componente de imagem com fallback
    │       │
    │       └── ui/                     # Biblioteca de componentes shadcn/ui
    │           ├── button.tsx
    │           ├── card.tsx
    │           ├── dialog.tsx
    │           ├── drawer.tsx
    │           ├── sheet.tsx
    │           └── ... (30+ componentes)
    │
    ├── lib/
    │   ├── types.ts            # Interfaces TypeScript (MenuItem, CartItem, etc.)
    │   ├── store.ts            # Store Zustand (cart, theme, admin, customers)
    │   ├── mockData.ts         # Dados mock (cardápio, depoimentos, info do restaurante)
    │   └── utils.ts            # Utilitários (formatCurrency, WhatsApp, analytics)
    │
    └── styles/
        ├── index.css           # Estilos globais
        ├── tailwind.css        # Configuração Tailwind
        ├── theme.css           # Variáveis CSS (light/dark mode)
        └── fonts.css           # Configuração de fontes
```

---

## 🧩 Componentes Principais

### `App.tsx`
Componente raiz que orquestra a renderização de todas as seções na ordem: **Navigation → Hero → Promo Banners → About → Menu → Cliente Especial → Testimonials → Location → Footer**, além dos elementos flutuantes (WhatsApp FAB, Cart Drawer, Toaster).

### `MenuSection.tsx`
Coração do cardápio digital. Extrai categorias dinamicamente dos dados, renderiza cards com imagem/preço/badges, e inclui um fluxo inline de adição ao carrinho com quantidade e observações.

### `CartDrawer.tsx`
Drawer lateral com spring animations. Implementa checkout em duas etapas — o cliente revisa o pedido, aplica código promo, adiciona endereço, e finaliza enviando tudo via WhatsApp com mensagem pré-formatada.

### `ClienteEspecialForm.tsx`
Modal de cadastro com validação, formatação automática de campos e geração de código promocional. Armazena o cliente no store Zustand e fecha automaticamente após sucesso.

---

## 🗄️ Gerenciamento de Estado

O estado global é gerenciado com **Zustand** e persiste no `localStorage`:

| Domínio | Funcionalidades |
|---|---|
| **Cart** | `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart` |
| **Theme** | `isDarkMode`, `toggleDarkMode` |
| **Menu** | CRUD completo de itens do cardápio |
| **Customers** | Cadastro de clientes especiais |
| **Testimonials** | CRUD de depoimentos |
| **Promo Banners** | CRUD de banners promocionais |
| **Admin** | Autenticação simples por senha |

---

## 🎨 Design e UX

- **Paleta de cores**: tons terrosos e dourados que remetem à culinária regional, com verde do WhatsApp como cor de ação
- **Tipografia**: fonte do sistema com pesos `400` / `500` para hierarquia visual
- **Animações**: todas baseadas em Framer Motion com triggers de scroll (Intersection Observer), transições spring e stagger
- **Dark Mode**: variáveis CSS customizadas (`--background`, `--foreground`, etc.) com classe `.dark`
- **Responsividade**: breakpoints Tailwind padrão, layout single-column em mobile com navegação hamburger

---

## 📄 Atribuições

- Componentes UI: [shadcn/ui](https://ui.shadcn.com/) — Licença MIT
- Fotografias: [Unsplash](https://unsplash.com/) — Unsplash License

---

<p align="center">
  Feito com ❤️ para o <strong>Flor do Maracujá</strong> 🌺
</p>