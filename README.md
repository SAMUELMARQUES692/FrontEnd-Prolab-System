# Prolab System — Frontend

Interface web para o ecossistema Prolab: autenticação (`auth-service`), domínio de resíduos/cargas (`ProlabSystem`) e mensageria assíncrona (`message-service`, sem UI própria — ver abaixo).

Design baseado no design system **Arboria** fornecido como referência (paleta oliva/musgo escura, tipografia Lexend / Lexend Exa / Rozha One, botões em pílula, cards arredondados, motion sutil).

## 🔗 Deploy em produção

| Serviço | URL | Observação |
|---|---|---|
| Frontend | https://front-end-prolab-system.vercel.app | React + Vite, hospedado na Vercel |
| Auth Service | https://auth-service-xa2p.onrender.com | Gera e valida tokens JWT |
| Prolab System | https://prolabsystem.onrender.com | API de negócio, valida tokens via chave pública |
| Message Service | https://message-service-mp5h.onrender.com | Worker assíncrono, sem endpoints públicos |

> Os backends rodam no plano gratuito do Render e "dormem" após inatividade — a primeira requisição pode demorar até 1 minuto (cold start).

**Infraestrutura:**
- Banco de dados: PostgreSQL único no Render, com schemas isolados por serviço
- Mensageria: RabbitMQ hospedado no CloudAMQP
- Deploy: Docker (Render) + Vercel

## CORS

Em produção, o CORS está restrito ao domínio do frontend: `https://front-end-prolab-system.vercel.app`. Para desenvolvimento local, ajuste `CorsConfig.java` ou use `addAllowedOriginPattern("*")` temporariamente.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens em `src/index.css` via `@theme inline`)
- TanStack Query (cache/estado de servidor)
- React Router 7
- React Hook Form + Zod (formulários e validação)
- Framer Motion (transições e microinterações)
- Axios (client HTTP com interceptor de Bearer token)

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste as URLs se os serviços não estiverem em localhost
npm run dev
```

Por padrão, em desenvolvimento local, a aplicação espera:

| Variável | Padrão (local) | Serviço |
|---|---|---|
| `VITE_AUTH_API_URL` | `http://localhost:8081` | auth-service |
| `VITE_PROLAB_API_URL` | `http://localhost:8080` | ProlabSystem |

> Em produção, essas variáveis já estão configuradas na Vercel apontando para as URLs reais do Render (ver seção "Deploy em produção" acima).

## Estrutura

```
src/
├── api/            # clients axios por domínio (um arquivo por recurso da API)
├── components/
│   ├── ui/         # kit de componentes (Button, Card, Drawer, DataTable, Tabs...)
│   └── layout/     # AppShell, Sidebar, Topbar, guards de rota
├── context/        # AuthContext (JWT/sessão) e ToastContext
├── features/       # uma pasta por módulo de negócio (auth, clientes, agendamentos...)
├── lib/            # utilitários (formatação, enums, jwt decode, storage local)
└── types/          # DTOs espelhando exatamente os request/response do backend
```

## Autenticação

- Login via `POST /auth/login` (auth-service) — token JWT RS256 salvo em `localStorage`.
- Cadastro público via `POST /api/usuarios/cadastrar`.
- O token é decodificado **apenas no cliente** (leitura de `scope`/`sub` para UI) — a validação de assinatura continua sendo feita pelos resource servers.
- Ações de escrita (criar/editar/excluir) ficam visíveis apenas para usuários cujo `scope` contenha `ADMIN`, refletindo as regras do `SecurityConfig` do ProlabSystem (`hasAuthority("SCOPE_ADMIN")` em POST/PUT/PATCH/DELETE).

## Limitações reais da API refletidas na interface

O backend atual não expõe alguns endpoints de leitura — o frontend foi construído **sem inventar rotas que não existem**, com contorno explícito e visível ao usuário:

- **Recebimentos** (`/api/recebimentos`): só `POST`/`PUT`/`DELETE`, sem nenhum `GET`. A tela mantém um histórico local (`localStorage`) dos recebimentos criados nesta máquina/navegador, claramente identificado como cache local — não uma listagem do servidor.
- **Documentos** (`/api/documentos`): só `POST`/`PUT`/`DELETE`/`GET /{id}`, sem listagem. A tela oferece busca por ID e mantém o mesmo tipo de histórico local.
- **Agendamentos**: sem `GET` geral — a listagem "Todos" é construída agregando as 4 chamadas `GET /api/agendamentos/status/{status}` no cliente.
- **Caminhões**: sem `GET /{id}` — edição usa o registro já carregado na listagem (`GET /api/caminhoes`).
- **message-service**: não expõe nenhum endpoint REST (é um consumidor RabbitMQ que dispara e-mail de boas-vindas ao cadastrar usuário). Por isso não há tela dedicada a ele — o cadastro de usuário já aciona esse fluxo em segundo plano no backend.

Se endpoints de listagem forem adicionados no backend no futuro (`GET /api/recebimentos`, `GET /api/documentos/cliente/{id}`, `GET /api/agendamentos`, `GET /api/caminhoes/{id}`), as telas de Recebimentos e Documentos podem trocar o cache local por dados reais do servidor sem mudança de layout.

## Build

```bash
npm run build   # tsc -b && vite build
npm run preview
```

## Como replicar o deploy

O projeto já está publicado (ver seção "Deploy em produção" acima). Para fazer seu próprio deploy a partir de um fork:

1. Importa o repositório na Vercel (**Add New Project**) — o framework Vite é detectado automaticamente via `vercel.json` (`framework: vite`, `outputDirectory: dist`, rewrite de SPA para o React Router).
2. Em **Project Settings → Environment Variables**, cadastra as duas variáveis para os ambientes `Production` e `Preview`:
   - `VITE_AUTH_API_URL` — URL pública do seu `auth-service`
   - `VITE_PROLAB_API_URL` — URL pública do seu `ProlabSystem`

   Referência dos nomes em `.env.production.example`.
3. Deploy. Cada `git push` dispara um novo deploy automático.

> Lembra de liberar o domínio da Vercel no CORS dos dois backends (`CorsConfig.java`), senão o navegador bloqueia as chamadas mesmo com os serviços no ar.

### CORS no backend

Como o frontend passa a rodar em um domínio `*.vercel.app` (ou domínio próprio),
confirme que o `auth-service` e o `ProlabSystem`, quando publicados no Render,
liberam esse domínio em CORS (`Access-Control-Allow-Origin`) — caso contrário as
chamadas à API serão bloqueadas pelo navegador mesmo com os backends no ar.
