# Forms Sirus (Liga de Cortes) - Documentação Técnica

Bem-vindo à documentação do projeto **Forms Sirus** (Liga de Cortes). Este documento foi criado para ajudar novos desenvolvedores a entender a arquitetura, as tecnologias e a estrutura de pastas do projeto.

---

## 🎯 Sobre o Projeto
O Forms Sirus é uma aplicação Web Full-stack construída para gerenciar uma competição de edição de vídeos (cortes) chamada "Liga de Cortes". A plataforma permite:
- Exibir o ranking atualizado dos participantes.
- Inscrição de novos participantes.
- Área restrita para participantes enviarem seus registros (visualizações no TikTok, YouTube, Facebook e número de cortes).
- Painel Administrativo completo para gerenciar configurações (abrir/fechar inscrições, ocultar Top 3, bloquear sistema), visualizar registros e aprovar participantes.

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** React 19 + Vite
- **Linguagem:** TypeScript
- **Roteamento:** React Router v7
- **Estilização:** CSS Tradicional (App.css / index.css)
- **Linting:** Oxlint

### Backend (`/server`)
- **Runtime:** Node.js
- **Framework:** Express
- **Linguagem:** JavaScript (ES Modules, `type: "module"`)
- **Autenticação/Segurança:** bcryptjs para hash de senhas, CORS configurado.
- **Banco de Dados:** PostgreSQL (acessado via `pg` - driver raw sem ORM).

---

## 📂 Estrutura de Diretórios

O repositório é dividido essencialmente em duas partes: o código cliente (Frontend) na raiz e o servidor (Backend) na pasta `/server`.

```text
forms-sirus/
├── src/                    # Código Fonte do Frontend (React)
│   ├── components/         # Componentes React reutilizáveis (Layout, RequireAuth, etc)
│   ├── context/            # React Contexts (AuthContext para gerenciar estado de login)
│   ├── lib/                # Arquivos utilitários e clientes HTTP (api.ts)
│   ├── pages/              # Páginas da aplicação
│   │   ├── admin/          # Páginas restritas ao painel de administração
│   │   ├── AreaParticipantePage.tsx # Dashboard do Participante
│   │   ├── InscricaoPage.tsx        # Formulário de inscrição
│   │   ├── LoginPage.tsx            # Página de Login
│   │   ├── RankingPage.tsx          # Página inicial com o Ranking (Pública)
│   │   └── ResultadosPage.tsx       # Resultados do participante
│   ├── App.tsx             # Definição de Rotas principais
│   └── main.tsx            # Ponto de entrada do React
├── server/                 # Código Fonte do Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/         # Rotas da API (auth, participantes, registros, historico, etc)
│   │   ├── app.js          # Configuração principal do Express e registro das rotas
│   │   ├── db.js           # Configuração de conexão com o PostgreSQL (Pool)
│   │   ├── index.js        # Entry point do servidor HTTP (Porta 3001)
│   │   ├── schema.sql      # Schema do Banco de Dados (Tabelas)
│   │   └── setup.js        # Script de inicialização e seeder do banco de dados
│   ├── package.json        # Dependências do backend
│   └── .env.example        # Exemplo de variáveis de ambiente do backend
├── package.json            # Dependências do frontend e scripts do Vite
├── tsconfig.*              # Configurações do TypeScript
└── vite.config.ts          # Configuração do Vite
```

---

## 🗄️ Banco de Dados (PostgreSQL)
A base de dados é gerida sem um ORM complexo, utilizando o pacote `pg` para raw SQL queries.
O schema (`server/src/schema.sql`) é composto por:
- `participantes`: Dados dos inscritos (ID, nome, idade, links de redes sociais, hash da senha, status).
- `registros`: Registros diários de estatísticas (views TikTok, YouTube, Facebook, quantidade de cortes). Relacionado com `participantes`.
- `historico`: Armazena o total de vitórias e a melhor posição histórica do participante.
- `admins`: Tabela separada para credenciais de administração.
- `configuracoes`: Tabela Singleton (1 registro) para regras de negócio globais (limites, bloqueios, etc).
- `evento`: Tabela Singleton para dados do evento atual (Nome, Liga, data da última atualização).

---

## 🔐 Autenticação e Autorização
A aplicação não utiliza JWT (JSON Web Tokens) na arquitetura atual. 
O fluxo de login (`server/src/routes/auth.js`) compara a senha via `bcrypt.compareSync`. O frontend através do `AuthContext` mantém o ID do participante e a flag `isAdmin` em memória durante a navegação. 
O componente `<RequireAuth>` protege rotas sensíveis no frontend, redirecionando usuários não autenticados.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v20+)
- PostgreSQL (rodando na porta `5432` ou conforme `.env`)

### 1. Configurando o Backend
```bash
cd server
cp .env.example .env
# Configure a variável DATABASE_URL no seu .env se não quiser usar o valor padrão

# Instale as dependências
npm install

# Crie a base de dados, tabelas e popule com dados fictícios (Seed)
npm run setup

# Inicie o servidor (modo watch)
npm run dev
```
*O backend estará rodando em `http://localhost:3001`*

### 2. Configurando o Frontend
Abra um novo terminal na raiz do projeto (`forms-sirus/`):
```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento do Vite
npm run dev
```
*O frontend estará rodando em `http://localhost:5173`*

---

## 🤝 Dicas para Próximos Devs
1. **Ambiente Dev:** Ao testar, você pode usar o usuário Admin padrão. A senha e o ID estarão no seed (`setup.js`).
2. **Rotas da API:** Centralizadas no frontend dentro do `lib/api.ts` e no backend em `server/src/routes/`. 
3. **Escalabilidade:** Se o projeto crescer e requerer persistência de sessão robusta, considere refatorar a autenticação para JWT (enviado em HTTP-Only Cookies) ou implementar validações mais estritas com bibliotecas como `zod` no backend.
