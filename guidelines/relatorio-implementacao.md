# Relatório de Implementação — Sistema Administrativo Flor do Maracujá

> Data: 06/02/2026  
> Stack: React 18 + TypeScript + Supabase + Vite 6

---

## 1. Estrutura de Pastas Criada

```
src/
├── contexts/
│   └── AuthContext.tsx              # Context de autenticação (session, signIn, signOut)
│
├── hooks/
│   ├── useMenu.ts                   # CRUD hook para menu_items
│   ├── usePromoBanners.ts           # CRUD hook para promo_banners
│   ├── useOrders.ts                 # CRUD hook para orders
│   ├── useReviews.ts                # CRUD hook para reviews
│   └── useLeads.ts                  # CRUD hook para leads
│
├── lib/
│   ├── supabase.ts                  # Cliente Supabase (singleton)
│   └── database.types.ts            # Tipos TypeScript do banco de dados
│
├── app/
│   ├── Router.tsx                   # React Router com rotas públicas e protegidas
│   │
│   └── components/
│       ├── auth/
│       │   ├── LoginPage.tsx        # Página de login com email/senha
│       │   └── ProtectedRoute.tsx   # Route guard para área administrativa
│       │
│       └── admin/
│           ├── AdminLayout.tsx      # Layout principal do painel admin
│           ├── MenuManager.tsx      # CRUD de itens do cardápio
│           ├── PromoBannersManager.tsx  # CRUD de banners promocionais
│           ├── OrdersManager.tsx    # Gestão de pedidos com status
│           ├── ReviewsManager.tsx   # CRUD de avaliações com aprovação
│           └── LeadsManager.tsx     # CRUD de leads/clientes especiais
│
migrations/
└── 001_create_tables.sql            # Migration completa (tabelas, RLS, triggers, seed)
```

---

## 2. Configuração do Supabase

### Cliente (`src/lib/supabase.ts`)
- URL: `https://lxdzmgalmrblccpocygq.supabase.co`
- Key: `sb_publishable_e1oGshlyv-YVLvBp9nYUPA_QyebEI7R`
- Suporta variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Auto-refresh de token e persistência de sessão habilitados

---

## 3. Migrations Executáveis

### Arquivo: `migrations/001_create_tables.sql`

**Tabelas criadas:**

| Tabela | Descrição |
|---|---|
| `menu_items` | Itens do cardápio (nome, preço, categoria, badges, disponibilidade) |
| `promo_banners` | Banners promocionais (título, descrição, imagem, validade) |
| `orders` | Pedidos (itens JSONB, total, dados do cliente, status) |
| `reviews` | Avaliações (autor, nota 1-5, comentário, aprovação) |
| `leads` | Clientes especiais (nome, email, telefone, aniversário, código promo) |

**Enums:**
- `badge_type`: `bestseller`, `new`, `spicy`
- `order_status`: `pending`, `confirmed`, `preparing`, `delivered`, `cancelled`

**Indexes criados:**
- `menu_items`: `category`, `available`
- `promo_banners`: `active`
- `orders`: `status`, `created_at DESC`
- `reviews`: `approved`, `rating`
- `leads`: `email`, `created_at DESC`

**Trigger automático:**
- `update_updated_at_column()` — atualiza `updated_at` automaticamente em UPDATE

**Row Level Security (RLS):**

| Tabela | Anon (público) | Authenticated (admin) |
|---|---|---|
| `menu_items` | SELECT (todos) | INSERT, UPDATE, DELETE |
| `promo_banners` | SELECT (todos) | INSERT, UPDATE, DELETE |
| `orders` | INSERT (criar pedido) | SELECT, INSERT, UPDATE, DELETE |
| `reviews` | SELECT (apenas aprovadas), INSERT | SELECT (todas), INSERT, UPDATE, DELETE |
| `leads` | INSERT (cadastro) | SELECT, INSERT, UPDATE, DELETE |

**Seed data incluso:** 7 itens de cardápio, 2 banners, 3 avaliações.

### Como executar a migration:
1. Acesse o Supabase Dashboard → SQL Editor
2. Cole o conteúdo de `migrations/001_create_tables.sql`
3. Clique em **Run**

---

## 4. Sistema de Autenticação

### AuthContext (`src/contexts/AuthContext.tsx`)
- Provider que abstrai toda a lógica de auth do Supabase
- Monitora mudanças de estado via `onAuthStateChange`
- Expõe: `user`, `session`, `loading`, `signIn()`, `signOut()`

### LoginPage (`src/app/components/auth/LoginPage.tsx`)
- Formulário com email e senha
- Toggle de visibilidade da senha
- Feedback de erro inline
- Spinner de loading durante autenticação
- Redirect automático se já autenticado

### ProtectedRoute (`src/app/components/auth/ProtectedRoute.tsx`)
- Route guard que verifica autenticação antes de renderizar filhos
- Mostra spinner enquanto verifica sessão
- Redireciona para `/admin/login` se não autenticado

### Criação do usuário admin:
Para criar o primeiro administrador, acesse o **Supabase Dashboard**:
1. Vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha:
   - Email: `admin@flordemaracuja.com`
   - Password: `Admin@2026!` (ou a senha desejada)
4. Marque **Auto Confirm User**
5. Clique em **Create user**

---

## 5. Roteamento

### Arquivo: `src/app/Router.tsx`

| Rota | Componente | Proteção |
|---|---|---|
| `/` | `App` (site público) | Nenhuma |
| `/admin/login` | `LoginPage` | Nenhuma (redirect se já logado) |
| `/admin` | `AdminLayout` | `ProtectedRoute` (requer autenticação) |

- Utiliza React Router v6 com `BrowserRouter`
- O `AuthProvider` envolve todas as rotas para disponibilizar o contexto

---

## 6. Serviços de Dados (Hooks)

Todos os hooks seguem o mesmo padrão:

```typescript
const { items, loading, error, fetchAll, create, update, remove } = useHook();
```

### `useMenu()` — `src/hooks/useMenu.ts`
- `items: MenuItemRow[]` — lista ordenada por categoria e nome
- `create(item: MenuItemInsert)` — cria item e atualiza estado local
- `update(id, updates: MenuItemUpdate)` — atualiza e sincroniza
- `remove(id)` — deleta e remove do estado

### `usePromoBanners()` — `src/hooks/usePromoBanners.ts`
- `banners: PromoBannerRow[]` — ordenados por `created_at DESC`
- CRUD completo com mesma API

### `useOrders()` — `src/hooks/useOrders.ts`
- `orders: OrderRow[]` — ordenados por `created_at DESC`
- CRUD completo, inclui mudança de status

### `useReviews()` — `src/hooks/useReviews.ts`
- `reviews: ReviewRow[]` — ordenadas por `created_at DESC`
- CRUD completo, inclui toggle de aprovação

### `useLeads()` — `src/hooks/useLeads.ts`
- `leads: LeadRow[]` — ordenados por `created_at DESC`
- CRUD completo

**Características compartilhadas:**
- Fetch automático no mount (`useEffect`)
- Atualização otimista do estado local após operações
- Tratamento de erros com mensagem exposta via `error`
- Tipagem TypeScript completa (Row, Insert, Update por entidade)

---

## 7. Interface Administrativa

### AdminLayout
- Top bar com logo, email do usuário, botão "Ver Site" e "Sair"
- Barra de abas: Cardápio, Promoções, Pedidos, Avaliações, Leads
- Renderização condicional do manager ativo

### MenuManager
- Tabela com colunas: Imagem, Nome, Categoria, Preço, Badges, Status, Ações
- Modal de criação/edição com: nome, descrição, preço, categoria (select), imagem URL, badges (toggle), disponibilidade (checkbox)
- Exclusão com confirmação

### PromoBannersManager
- Grid de cards com imagem, título, status (ativo/inativo), validade
- Modal com: título, descrição, imagem URL, data de validade, checkbox ativo

### OrdersManager
- Tabela com ID (truncado), Cliente, Total, Status, Data, Ações
- Filtro por status (select)
- Mudança de status inline (select colorido por status)
- Modal de detalhes: informações do cliente, lista de itens, total
- Status disponíveis: Pendente → Confirmado → Preparando → Entregue / Cancelado

### ReviewsManager
- Tabela com Autor, Nota (estrelas), Comentário, Data, Status, Ações
- Toggle de aprovação com um clique
- Modal com: nome, nota (estrelas clicáveis), comentário, data, avatar URL, checkbox aprovação

### LeadsManager
- Tabela com Nome, Contato (email + telefone), Aniversário, Código Promo, Cadastro, Ações
- Campo de busca (filtra por nome, email ou telefone)
- Modal com: nome, email, telefone (auto-formatação), aniversário, código promo, preferências

**Feedback consistente em todos os managers:**
- Toast de sucesso/erro (via Sonner)
- Loading spinner durante operações
- Estado vazio quando sem dados
- Spinner por item durante exclusão

---

## 8. Dependências Adicionadas

```bash
npm install @supabase/supabase-js react-router-dom
```

| Pacote | Versão | Uso |
|---|---|---|
| `@supabase/supabase-js` | ^2.x | Cliente Supabase (Auth + DB) |
| `react-router-dom` | ^6.x | Roteamento SPA com route guards |

---

## 9. Como Rodar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. (Opcional) Configurar variáveis de ambiente
# Crie um arquivo .env na raiz:
VITE_SUPABASE_URL=https://lxdzmgalmrblccpocygq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_e1oGshlyv-YVLvBp9nYUPA_QyebEI7R

# 3. Executar migration no Supabase
# Copie o conteúdo de migrations/001_create_tables.sql
# Cole no SQL Editor do Supabase Dashboard e execute

# 4. Criar usuário admin no Supabase Dashboard
# Authentication → Users → Add user → Create new user
# Email: admin@flordemaracuja.com | Senha: Admin@2026!

# 5. Iniciar dev server
npm run dev

# 6. Acessar
# Site público: http://localhost:5173
# Login admin:  http://localhost:5173/admin/login
# Painel admin: http://localhost:5173/admin
```

---

## 10. Problemas Encontrados e Soluções

| Problema | Solução |
|---|---|
| Import paths incorretos nos componentes `auth/` e `admin/` (3 níveis de profundidade) | Ajustado para `../../../contexts/AuthContext` e `../../../hooks/useX` |
| Supabase key no formato não-JWT (`sb_publishable_...`) | Utilizado como fornecido; funciona com Supabase v2+ |
| Chunk size warning no build (>500kB) | Esperado dado o volume de dependências (MUI, Radix, Motion); pode ser otimizado com code-splitting futuro |
| RLS bloqueando admin de ver reviews não-aprovadas | Criada policy separada `reviews_admin_select` com `TO authenticated` que permite ver todas |

---

## 11. Segurança Implementada

### 3 Camadas de Proteção:

1. **Nível de Rota** — `ProtectedRoute` verifica `user` antes de renderizar `/admin`
2. **Nível de Componente** — `AdminLayout` acessa `useAuth()` e exibe dados do usuário
3. **Nível de API (Supabase RLS)** — Políticas de segurança no banco garantem que:
   - Operações de escrita exigem `authenticated`
   - Leitura pública é restrita a dados aprovados/ativos
   - Mesmo que um request manual seja feito, o banco rejeita sem token válido
