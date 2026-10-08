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

### Backend (repo separado: [forms-sirus-back](https://github.com/Jndungue089/forms-sirus-back))
- **Framework:** NestJS (TypeScript), pronto para Vercel serverless
- **Autenticação/Segurança:** bcryptjs para hash de senhas. Sem CORS: o frontend chama `/api` na mesma origem (proxy do Vite em dev, rewrite da Vercel em produção).
- **Banco de Dados:** PostgreSQL (local em dev, Neon em produção), via `pg` sem ORM.

---

## 📂 Estrutura de Diretórios

O repositório é dividido essencialmente em duas partes: o código cliente (Frontend) na raiz e o servidor num repositório à parte (`forms-sirus-back`).

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
├── package.json            # Dependências do frontend e scripts do Vite
├── tsconfig.*              # Configurações do TypeScript
├── vercel.json             # Rewrite de /api/* para o backend
└── vite.config.ts          # Configuração do Vite (proxy /api -> localhost:3001)
```

---

## 🗄️ Banco de Dados (PostgreSQL)
A base de dados é gerida sem um ORM complexo, utilizando o pacote `pg` para raw SQL queries.
O schema (`db/schema.sql` no repo do backend) é composto por:
- `participantes`: Dados dos inscritos (ID, nome, idade, links de redes sociais, hash da senha, status).
- `registros`: Registros diários de estatísticas (views TikTok, YouTube, Facebook, quantidade de cortes). Relacionado com `participantes`.
- `historico`: Armazena o total de vitórias e a melhor posição histórica do participante.
- `admins`: Tabela separada para credenciais de administração.
- `configuracoes`: Tabela Singleton (1 registro) para regras de negócio globais (limites, bloqueios, etc).
- `evento`: Tabela Singleton para dados do evento atual (Nome, Liga, data da última atualização).

---

## 🔐 Autenticação e Autorização
A aplicação não utiliza JWT (JSON Web Tokens) na arquitetura atual. 
O fluxo de login (`auth.controller.ts` no backend) compara a senha via `bcrypt.compareSync`. O frontend através do `AuthContext` mantém o ID do participante e a flag `isAdmin` em memória durante a navegação. 
O componente `<RequireAuth>` protege rotas sensíveis no frontend, redirecionando usuários não autenticados.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v20+)
- PostgreSQL (rodando na porta `5432` ou conforme `.env`)

### 1. Configurando o Backend
Clona e corre o [forms-sirus-back](https://github.com/Jndungue089/forms-sirus-back) (instruções no README dele):
```bash
git clone https://github.com/Jndungue089/forms-sirus-back && cd forms-sirus-back
cp .env.example .env && npm install && npm run setup && npm run dev
```
*O backend estará rodando em `http://localhost:3001/api`*

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
1. **Ambiente Dev:** Ao testar, você pode usar o usuário Admin padrão. A senha e o ID estarão no seed (`scripts/setup.mjs` no backend).
2. **Rotas da API:** Centralizadas no frontend dentro do `lib/api.ts` e no backend nos controllers de `forms-sirus-back/src/`. 
3. **Escalabilidade:** Se o projeto crescer e requerer persistência de sessão robusta, considere refatorar a autenticação para JWT (enviado em HTTP-Only Cookies) ou implementar validações mais estritas com bibliotecas como `zod` no backend.

4. **Deploy:** em `vercel.json`, troca o `destination` do rewrite `/api/*` pelo domínio real do backend na Vercel.
