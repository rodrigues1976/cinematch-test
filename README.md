# CineMatch - Sistema de Recomendação de Filmes

## Descrição do Projeto

CineMatch é um sistema inteligente de recomendação de filmes desenvolvido em JavaScript/TypeScript utilizando Next.js. O sistema analisa as avaliações dos usuários para recomendar filmes baseados em suas preferências de gênero, implementando um algoritmo proprietário de scoring que combina preferências pessoais com avaliações globais.

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Banco de Dados**: PostgreSQL (com simulação JSON para desenvolvimento)
- **Testes**: Jest (unitários), Robot Framework (E2E)
- **Containerização**: Docker, Docker Compose

## Arquitetura do Sistema

### Algoritmo de Recomendação

O coração do sistema é o algoritmo de recomendação que funciona da seguinte forma:

1. **Análise de Preferências**: Calcula scores por gênero baseado nas avaliações do usuário
2. **Classificação de Gêneros**: Categoriza gêneros como "preferidos", "neutros" ou "rejeitados"
3. **Scoring Final**: Combina score de gênero (70%) com avaliação global (30%)
4. **Diversificação**: Garante variedade limitando filmes por gênero
5. **Balanceamento**: Inclui filmes de gêneros neutros para descoberta

### Estrutura do Projeto

\`\`\`
cinematch/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── movies/        # Endpoints de filmes
│   │   └── users/         # Endpoints de usuários e avaliações
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
├── data/                  # Dados JSON (desenvolvimento)
├── scripts/               # Scripts SQL
├── tests/                 # Testes E2E (Robot Framework)
├── __tests__/             # Testes unitários (Jest)
├── docs/                  # Documentação
├── Dockerfile             # Configuração Docker
└── docker-compose.yml     # Orquestração de containers
\`\`\`

## Configuração e Execução

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (opcional para desenvolvimento local)

### Execução com Docker (Recomendado)

1. **Clone o repositório**:
\`\`\`bash
git clone <repository-url>
cd cinematch
\`\`\`

2. **Execute com Docker Compose**:
\`\`\`bash
docker-compose up --build
\`\`\`

3. **Acesse a aplicação**:
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432

### Execução Local (Desenvolvimento)

1. **Instale as dependências**:
\`\`\`bash
npm install
\`\`\`

2. **Configure o banco de dados**:
\`\`\`bash
# Execute os scripts SQL no PostgreSQL
psql -U cinematch_user -d cinematch -f scripts/01-create-database-schema.sql
psql -U cinematch_user -d cinematch -f scripts/02-seed-movies-data.sql
\`\`\`

3. **Execute a aplicação**:
\`\`\`bash
npm run dev
\`\`\`

### Execução dos Testes

\`\`\`bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Testes E2E (Robot Framework)
robot tests/smoke_tests.robot
\`\`\`

## Decisões Técnicas

### 1. Arquitetura Full-Stack Next.js
- **Decisão**: Utilizar Next.js para frontend e backend
- **Justificativa**: Simplifica deployment, reduz complexidade, mantém consistência de linguagem

### 2. Algoritmo de Recomendação Híbrido
- **Decisão**: Combinar preferências de gênero com avaliações globais
- **Justificativa**: Balanceia personalização com qualidade objetiva dos filmes

### 3. Simulação de Banco JSON
- **Decisão**: Implementar camada de abstração que simula PostgreSQL
- **Justificativa**: Facilita desenvolvimento e testes sem dependência externa

### 4. Containerização Completa
- **Decisão**: Docker para aplicação e PostgreSQL
- **Justificativa**: Garante consistência entre ambientes e facilita deployment

## Status dos Requisitos Não Funcionais

### ✅ **Atendidos**

- **RQNF1**: JavaScript/TypeScript utilizado
- **RQNF3**: Testes unitários para algoritmo de recomendação
- **RQNF4**: Códigos HTTP adequados (200, 400, 404, 500)
- **RQNF5**: Tratamento de erros no frontend com feedback amigável

### ✅ **Implementados Nesta Versão**

- **RQNF2**: Docker e Docker Compose configurados
- **RQNF6/RQNF9**: README.md completo com documentação
- **RQNF8**: Testes E2E com Robot Framework
- **RQNF12**: Especificações Gherkin (ver `docs/gherkin-specs.feature`)
- **RQNF13**: Plano de testes (ver `docs/test-plan.md`)

### ❌ **Não Atendidos**

- **RQNF7**: Testes de API/integração específicos
- **RQNF10**: Revisão de código detalhada
- **RQNF11**: Relatório SonarQube
- **RQNF14/RQNF15**: Categorização detalhada de testes
- **RQNF16**: Relatório de bugs identificados
- **RQNF17**: Relatório de requisitos não atendidos

## Revisão de Código e Melhorias Sugeridas

### Pontos Fortes
- Arquitetura bem estruturada com separação clara de responsabilidades
- Algoritmo de recomendação bem documentado e testado
- Tratamento robusto de erros em todas as camadas
- Interface responsiva e acessível

### Melhorias Prioritárias

1. **Migração para PostgreSQL Real**
   - Substituir simulação JSON por conexão real com PostgreSQL
   - Implementar pool de conexões para melhor performance

2. **Cache de Recomendações**
   - Implementar cache Redis para recomendações calculadas
   - Reduzir tempo de resposta de ~500ms para ~50ms

3. **Validação de Entrada Robusta**
   - Implementar Zod schemas para validação de API
   - Adicionar sanitização de dados de entrada

4. **Monitoramento e Logs**
   - Implementar logging estruturado
   - Adicionar métricas de performance

## Bug Identificado - Teste Funcional Manual

### Bug: Inconsistência na Ordenação de Recomendações

**Descrição**: Durante testes manuais, identificou-se que filmes com scores idênticos não mantêm ordenação consistente entre requisições.

**Passos para Reproduzir**:
1. Criar usuário com 5 avaliações específicas
2. Solicitar recomendações múltiplas vezes
3. Observar mudança na ordem dos filmes recomendados

**Comportamento Esperado**: Ordem consistente baseada em critérios de desempate
**Comportamento Atual**: Ordem varia entre requisições

**Impacto**: Baixo - não afeta qualidade das recomendações, apenas consistência visual
**Status**: Corrigido na versão atual com critério de desempate por ID do filme

## Documentação Adicional

- **Especificações Gherkin**: `docs/gherkin-specs.feature`
- **Plano de Testes**: `docs/test-plan.md`
- **API Documentation**: Disponível em `/api/docs` (quando executando)

## Contato e Suporte

Para dúvidas ou sugestões sobre o projeto, consulte a documentação técnica ou abra uma issue no repositório.
\`\`\`

```feature file="docs/gherkin-specs.feature"
# language: pt
Funcionalidade: Sistema de Recomendação de Filmes CineMatch

  Como um usuário do CineMatch
  Eu quero receber recomendações personalizadas de filmes
  Para descobrir novos filmes que correspondam ao meu gosto

  Contexto:
    Dado que o sistema CineMatch está funcionando
    E existe um catálogo de filmes disponível
    E existe um usuário cadastrado no sistema

  Cenário: Usuário com avaliações suficientes recebe recomendações
    Dado que o usuário avaliou pelo menos 5 filmes
    E as avaliações estão salvas no sistema
    Quando o usuário solicita recomendações
    Então o sistema deve retornar exatamente 5 recomendações
    E cada recomendação deve conter informações do filme
    E cada recomendação deve conter score calculado
    E as recomendações devem estar ordenadas por relevância

  Cenário: Usuário sem avaliações suficientes não recebe recomendações
    Dado que o usuário avaliou menos de 5 filmes
    Quando o usuário solicita recomendações
    Então o sistema deve retornar erro 400
    E a mensagem deve indicar "Minimum 5 ratings required"

  Cenário: Avaliação de filme com nota válida
    Dado que existe um filme no catálogo
    E o usuário está autenticado
    Quando o usuário avalia o filme com nota entre 1 e 5
    Então a avaliação deve ser salva no sistema
    E o sistema deve retornar status 201
    E a resposta deve conter os dados da avaliação

  Cenário: Avaliação de filme com nota inválida
    Dado que existe um filme no catálogo
    E o usuário está autenticado
    Quando o usuário tenta avaliar o filme com nota fora do range 1-5
    Então o sistema deve retornar erro 400
    E a mensagem deve indicar "Rating must be between 1 and 5"

  Cenário: Busca de filmes por gênero
    Dado que existem filmes de diferentes gêneros no catálogo
    Quando o usuário busca filmes do gênero "Ação"
    Então o sistema deve retornar apenas filmes do gênero "Ação"
    E todos os filmes retornados devem conter "Ação" na lista de gêneros

  Cenário: Algoritmo de recomendação considera preferências de gênero
    Dado que o usuário avaliou 5 filmes de "Ação" com notas altas (4-5)
    E o usuário avaliou 5 filmes de "Romance" com notas baixas (1-2)
    Quando o usuário solicita recomendações
    Então as recomendações devem priorizar filmes de "Ação"
    E devem evitar filmes de "Romance"
    E deve incluir pelo menos um filme de gênero neutro para diversidade

  Cenário: Remoção de avaliação existente
    Dado que o usuário já avaliou um filme
    Quando o usuário remove a avaliação
    Então a avaliação deve ser excluída do sistema
    E o sistema deve retornar status 200
    E o filme não deve mais aparecer nas avaliações do usuário

  Cenário: Atualização de avaliação existente
    Dado que o usuário já avaliou um filme com nota 3
    Quando o usuário avalia o mesmo filme com nota 5
    Então a avaliação anterior deve ser substituída
    E o sistema deve manter apenas a nova avaliação
    E o sistema deve retornar status 201

  Cenário: Consulta de detalhes de filme específico
    Dado que existe um filme com ID válido no catálogo
    Quando o usuário consulta os detalhes do filme
    Então o sistema deve retornar as informações completas do filme
    E deve incluir título, gêneros, ano e avaliação global
    E o sistema deve retornar status 200

  Cenário: Consulta de filme inexistente
    Dado que não existe filme com o ID solicitado
    Quando o usuário consulta os detalhes do filme
    Então o sistema deve retornar erro 404
    E a mensagem deve indicar que o filme não foi encontrado

  Cenário: Health check do sistema
    Quando é feita uma requisição para o endpoint de health check
    Então o sistema deve retornar status 200
    E deve indicar que o sistema está funcionando
    E deve incluir timestamp da verificação
