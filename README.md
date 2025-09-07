# Daily Diet API

Uma API REST para gerenciamento de dieta diária, desenvolvida com Node.js, TypeScript e Fastify. Esta aplicação permite que usuários registrem suas refeições e acompanhem suas métricas de dieta.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Fastify** - Framework web rápido e eficiente
- **Knex.js** - Query builder para SQL
- **SQLite** - Banco de dados
- **Argon2** - Hash de senhas
- **Zod** - Validação de schemas
- **tsx** - Executor TypeScript

## 📋 Funcionalidades

### Autenticação
- Registro de usuários com hash de senha seguro
- Sistema de sessão baseado em cookies
- Middleware de verificação de sessão

### Gerenciamento de Refeições
- **Criar refeição** - Adicionar nova refeição com nome, descrição e status da dieta
- **Listar refeições** - Visualizar todas as refeições do usuário
- **Buscar refeição** - Obter detalhes de uma refeição específica
- **Atualizar refeição** - Modificar dados de uma refeição existente
- **Deletar refeição** - Remover uma refeição

### Métricas
- Total de refeições registradas
- Total de refeições dentro da dieta
- Total de refeições fora da dieta
- Melhor sequência de refeições dentro da dieta

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
- `id` (UUID) - Identificador único
- `session_id` (UUID) - ID da sessão do usuário
- `username` (TEXT) - Nome de usuário único
- `password` (TEXT) - Senha hasheada

### Tabela `meals`
- `id` (UUID) - Identificador único
- `user_id` (UUID) - Referência ao usuário
- `name` (TEXT) - Nome da refeição
- `description` (TEXT) - Descrição da refeição
- `some_date` (DATE) - Data da refeição
- `some_time` (TIME) - Horário da refeição
- `in_diet` (BOOLEAN) - Se está dentro da dieta

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd daily-diet-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
NODE_ENV=development
DATABASE_URL=./src/database/database.db
PORT=3333
```

4. **Execute as migrações do banco de dados**
```bash
npm run knex migrate:latest
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

## 📚 Documentação da API

### Base URL
```
http://localhost:3333
```

### Endpoints

#### 1. Registro de Usuário
```http
POST /register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "senha123"
}
```

**Resposta:**
- `201` - Usuário criado com sucesso
- Cookie `sessionId` será definido automaticamente

#### 2. Criar Refeição
```http
POST /meals
Content-Type: application/json
Cookie: sessionId=<session-id>

{
  "meal": {
    "name": "Café da manhã",
    "description": "Aveia com frutas",
    "in_diet": true
  }
}
```

**Resposta:**
- `201` - Refeição criada com sucesso

#### 3. Listar Refeições
```http
GET /meals
Cookie: sessionId=<session-id>
```

**Resposta:**
```json
{
  "meals": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Café da manhã",
      "description": "Aveia com frutas",
      "some_date": "2024-01-15",
      "some_time": "08:30:00",
      "in_diet": true
    }
  ]
}
```

#### 4. Buscar Refeição por ID
```http
GET /meals/:id
Cookie: sessionId=<session-id>
```

**Resposta:**
```json
{
  "meals": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Café da manhã",
    "description": "Aveia com frutas",
    "some_date": "2024-01-15",
    "some_time": "08:30:00",
    "in_diet": true
  }
}
```

#### 5. Atualizar Refeição
```http
PUT /meals/:id
Content-Type: application/json
Cookie: sessionId=<session-id>

{
  "name": "Café da manhã atualizado",
  "description": "Aveia com frutas e mel",
  "some_date": "2024-01-15",
  "some_time": "08:45:00",
  "in_diet": true
}
```

**Resposta:**
- `203` - Refeição atualizada com sucesso

#### 6. Deletar Refeição
```http
DELETE /meals/:id
Cookie: sessionId=<session-id>
```

**Resposta:**
- `203` - Refeição deletada com sucesso

#### 7. Obter Métricas
```http
GET /meals/metrics
Cookie: sessionId=<session-id>
```

**Resposta:**
```json
{
  "metrics": {
    "totatMeals": 10,
    "totalMealsInDiet": 7,
    "totalMealsOutDiet": 3,
    "bestMealSequence": 4
  }
}
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento com hot reload
- `npm run knex` - Executa comandos do Knex.js para migrações

## 🏗️ Estrutura do Projeto

```
daily-diet-api/
├── db/
│   └── migrations/          # Migrações do banco de dados
├── src/
│   ├── env/                 # Configuração de variáveis de ambiente
│   ├── middlewares/         # Middlewares personalizados
│   ├── routes/              # Definição das rotas da API
│   ├── utils/               # Utilitários e funções auxiliares
│   ├── database.ts          # Configuração do banco de dados
│   └── server.ts            # Arquivo principal do servidor
├── knexfile.ts              # Configuração do Knex.js
├── package.json
└── tsconfig.json            # Configuração do TypeScript
```

## 🔒 Segurança

- Senhas são hasheadas usando Argon2
- Autenticação baseada em sessão com cookies
- Validação de entrada usando Zod
- Verificação de autorização em todas as rotas protegidas

## 🚨 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `203` - Atualizado/Deletado com sucesso
- `400` - Dados inválidos ou não encontrados
- `401` - Não autorizado
- `500` - Erro interno do servidor

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para ajudar no controle de dieta diária.
