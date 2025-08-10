# Contratos de API - Template Backend

**Autor:** Manus AI  
**Data:** 10 de Agosto de 2025  
**Versão:** 1.0

## Visão Geral

Este documento detalha os contratos de API do template-backend, explicando decisões de design, padrões utilizados e compatibilidade com o frontend React existente. A API segue princípios RESTful com extensões modernas para melhor experiência de desenvolvimento.

## Princípios de Design da API

### Consistência e Previsibilidade

A API foi projetada seguindo padrões consistentes que facilitam o uso por desenvolvedores frontend e integração com sistemas externos. Todos os endpoints seguem convenções RESTful rigorosas, com URLs hierárquicas, métodos HTTP apropriados e códigos de status padronizados.

Os nomes de recursos utilizam substantivos no plural (`/users`, `/comunicacoes`) e seguem convenções de nomenclatura em português para recursos de domínio específico, mantendo compatibilidade com o frontend existente. Recursos técnicos utilizam nomenclatura em inglês (`/health`, `/auth`) seguindo padrões internacionais.

### Versionamento Semântico

A API utiliza versionamento através de prefixo de URL (`/api/v1/`) permitindo evolução controlada sem quebrar clientes existentes. Mudanças backward-compatible são introduzidas na mesma versão, enquanto breaking changes requerem nova versão major.

O versionamento segue semantic versioning (semver) onde:
- **Major**: Breaking changes que requerem modificações no cliente
- **Minor**: Novas funcionalidades backward-compatible
- **Patch**: Bug fixes e melhorias internas

### Tratamento de Erros Padronizado

Todos os erros seguem formato consistente com informações suficientes para debugging e tratamento adequado pelo cliente. Erros incluem código HTTP apropriado, mensagem legível para usuários, detalhes técnicos para desenvolvedores e identificador único para rastreamento.

```json
{
  "error": "Dados de entrada inválidos",
  "message": "Falha na validação dos dados",
  "statusCode": 400,
  "timestamp": "2025-08-10T16:30:00.000Z",
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "path": "/api/v1/users",
  "details": [
    {
      "field": "email",
      "message": "Email deve ter formato válido",
      "value": "email-invalido"
    }
  ]
}
```

## Autenticação e Autorização

### Estratégia de Autenticação

A API implementa autenticação híbrida combinando login tradicional com OAuth2, proporcionando flexibilidade para diferentes tipos de usuários e casos de uso.

**Login Tradicional** utiliza email e senha com validação rigorosa. Senhas devem atender critérios de complexidade incluindo letras maiúsculas, minúsculas, números e símbolos especiais. O sistema implementa proteção contra ataques de força bruta através de rate limiting e bloqueio temporário após tentativas falhadas.

**OAuth2 Integration** suporta múltiplos providers (Google, GitHub, Microsoft) através de fluxo authorization code com PKCE para segurança adicional. Cada provider é configurado independentemente, permitindo habilitação/desabilitação flexível baseada em políticas organizacionais.

### Tokens JWT

A API utiliza JWT (JSON Web Tokens) para autenticação stateless, permitindo escalabilidade horizontal sem necessidade de armazenamento de sessão no servidor. Tokens são assinados com algoritmo RS256 usando chaves RSA 2048-bit para máxima segurança.

**Access Tokens** têm validade curta (1 hora) e contêm claims essenciais como user ID, roles e permissions. Tokens incluem timestamps de emissão e expiração, além de identificador único para rastreamento e possível revogação.

**Refresh Tokens** têm validade longa (30 dias) e são utilizados exclusivamente para renovação de access tokens. Refresh tokens são armazenados de forma segura e podem ser revogados individualmente, permitindo logout seletivo de dispositivos específicos.

### Controle de Acesso Baseado em Roles (RBAC)

O sistema implementa RBAC granular onde usuários possuem roles e cada role define conjunto específico de permissions. Esta abordagem permite controle fino de acesso sem complexidade excessiva.

**Roles Padrão:**
- **admin**: Acesso completo ao sistema, incluindo gerenciamento de usuários
- **moderator**: Pode gerenciar comunicações e visualizar usuários
- **user**: Acesso básico para visualização e criação de conteúdo próprio

**Permissions Granulares:**
- `read:users`, `write:users`, `delete:users`
- `read:comunicacoes`, `write:comunicacoes`, `delete:comunicacoes`
- `admin:system`, `moderate:content`

## Endpoints de Saúde e Monitoramento

### Health Check Básico

O endpoint `/health` fornece verificação rápida de saúde da aplicação, retornando status geral, uptime e versão. Este endpoint não requer autenticação e é otimizado para uso por load balancers e sistemas de monitoramento.

```json
{
  "status": "healthy",
  "timestamp": "2025-08-10T16:30:00.000Z",
  "uptime": 3600.5,
  "version": "1.0.0"
}
```

### Health Check Detalhado

O endpoint `/health/detailed` fornece informações abrangentes sobre todos os componentes do sistema, incluindo banco de dados, cache Redis e serviços externos. Este endpoint inclui métricas de performance como tempo de resposta de cada componente.

```json
{
  "status": "healthy",
  "timestamp": "2025-08-10T16:30:00.000Z",
  "uptime": 3600.5,
  "version": "1.0.0",
  "components": {
    "database": {
      "status": "healthy",
      "responseTime": 15.5
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2.1
    },
    "external_apis": {
      "status": "healthy",
      "services": [
        {
          "name": "email_service",
          "status": "healthy",
          "responseTime": 45.2
        }
      ]
    }
  }
}
```

## Gerenciamento de Usuários

### Listagem com Filtros Avançados

O endpoint `GET /users` implementa sistema robusto de filtros, busca e paginação. Suporta busca textual por nome ou email, filtros por role e status, além de ordenação configurável por múltiplos campos.

**Parâmetros de Query:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20, máximo: 100)
- `search`: Busca textual em nome e email
- `role`: Filtro por role específica
- `status`: Filtro por status (active, inactive, pending)

**Resposta Paginada:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "usuario@exemplo.com",
      "nome": "João Silva",
      "roles": ["user"],
      "status": "active",
      "emailVerified": true,
      "createdAt": "2025-08-10T16:30:00.000Z",
      "updatedAt": "2025-08-10T16:30:00.000Z",
      "lastLoginAt": "2025-08-10T15:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Criação e Atualização

Endpoints de criação (`POST /users`) e atualização (`PUT /users/{id}`) implementam validação rigorosa de dados com mensagens de erro detalhadas. Validações incluem formato de email, complexidade de senha, formato de telefone e verificação de unicidade.

**Validações Implementadas:**
- Email: Formato válido e unicidade no sistema
- Senha: Mínimo 8 caracteres com complexidade (maiúscula, minúscula, número, símbolo)
- Nome: Mínimo 2 caracteres, máximo 100
- Telefone: Formato internacional válido
- Roles: Valores permitidos do enum definido

### Soft Delete

A exclusão de usuários utiliza soft delete, marcando registros como inativos ao invés de removê-los fisicamente. Isso preserva integridade referencial e permite auditoria completa de ações no sistema.

## Gerenciamento de Comunicações

### Compatibilidade com Frontend Existente

Os endpoints de comunicações foram projetados para máxima compatibilidade com o frontend React existente, mantendo estrutura de dados e nomenclatura já utilizadas. Campos como `titulo`, `autor`, `tipo` e `descricao` seguem exatamente as convenções estabelecidas.

### Busca e Filtros Avançados

O endpoint `GET /comunicacoes` implementa sistema sofisticado de busca e filtros que permite localização eficiente de comunicações específicas:

**Busca Textual:** Pesquisa simultânea em título, autor e descrição usando full-text search otimizado
**Filtros por Tipo:** Categorização por tipo (aviso, comunicado, notícia, evento)
**Filtros Temporais:** Busca por intervalo de datas de criação ou atualização
**Ordenação Flexível:** Múltiplos campos de ordenação com direção configurável

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "titulo": "Reunião de Planejamento",
      "autor": "João Silva",
      "tipo": "comunicado",
      "descricao": "Reunião para discutir o planejamento do próximo trimestre",
      "conteudo": "Detalhes completos da reunião...",
      "tags": ["planejamento", "reunião", "trimestre"],
      "prioridade": "media",
      "status": "publicado",
      "visualizacoes": 150,
      "createdAt": "2025-08-10T16:30:00.000Z",
      "updatedAt": "2025-08-10T16:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 75,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "search": "planejamento",
    "tipo": "comunicado",
    "dataInicio": "2025-08-01",
    "dataFim": "2025-08-31"
  }
}
```

### Sistema de Tags e Categorização

Comunicações suportam sistema flexível de tags para categorização e busca avançada. Tags são strings livres que permitem organização orgânica de conteúdo pelos usuários, complementando a categorização formal por tipo.

### Controle de Publicação

O sistema implementa workflow de publicação com estados bem definidos:
- **rascunho**: Comunicação em edição, visível apenas para o autor
- **publicado**: Comunicação ativa, visível para usuários autorizados
- **arquivado**: Comunicação inativa, mantida para histórico

### Anexos e Mídia

Embora não implementado na versão inicial, a estrutura de dados inclui suporte para anexos, preparando o sistema para futuras funcionalidades de upload de arquivos e mídia.

## Paginação e Performance

### Estratégia de Paginação

Todos os endpoints de listagem implementam paginação cursor-based para performance otimizada em datasets grandes. Metadados de paginação incluem informações completas sobre estado atual e navegação disponível.

**Parâmetros Padrão:**
- Página inicial: 1
- Itens por página: 20
- Máximo por página: 100

**Metadados Retornados:**
- Página atual e total de páginas
- Total de itens no dataset
- Indicadores de páginas anterior/próxima disponíveis

### Otimizações de Performance

**Índices de Banco:** Todos os campos utilizados em filtros e ordenação possuem índices otimizados
**Query Optimization:** Queries são otimizadas para evitar N+1 problems através de eager loading seletivo
**Response Caching:** Respostas de listagem são cacheadas com invalidação inteligente baseada em mudanças de dados

## Validação e Sanitização

### Validação de Entrada

Todos os dados de entrada passam por validação rigorosa utilizando schemas Zod compartilhados com o frontend. Isso garante consistência absoluta entre validações client-side e server-side.

**Tipos de Validação:**
- **Formato**: Email, telefone, URLs, UUIDs
- **Tamanho**: Strings com limites mínimos e máximos
- **Padrões**: Regex para formatos específicos (senha, telefone)
- **Enums**: Valores permitidos para campos categóricos
- **Relacionais**: Verificação de existência de referências

### Sanitização de Dados

Dados de entrada são automaticamente sanitizados para prevenir ataques de injeção:
- **HTML Sanitization**: Remoção de tags HTML perigosas
- **SQL Injection Prevention**: Uso exclusivo de prepared statements
- **XSS Prevention**: Encoding apropriado de output
- **CSRF Protection**: Tokens CSRF para operações state-changing

## Rate Limiting e Segurança

### Limites de Taxa

A API implementa rate limiting diferenciado por tipo de endpoint e status de autenticação:

**Endpoints Públicos:** 100 requests/minuto por IP
**Usuários Autenticados:** 1000 requests/minuto por usuário
**Endpoints de Autenticação:** 10 requests/minuto por IP (proteção contra força bruta)
**Endpoints Administrativos:** 500 requests/minuto por usuário admin

### Headers de Segurança

Todos os responses incluem headers de segurança apropriados:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`

## Monitoramento e Observabilidade

### Request Tracking

Cada request recebe identificador único (`requestId`) que é propagado através de todos os logs e responses. Isso facilita debugging e rastreamento de problemas específicos.

### Structured Logging

Todos os logs seguem formato JSON estruturado com campos padronizados:
```json
{
  "timestamp": "2025-08-10T16:30:00.000Z",
  "level": "info",
  "message": "User login successful",
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "456e7890-e89b-12d3-a456-426614174000",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "endpoint": "/api/v1/auth/login",
  "method": "POST",
  "statusCode": 200,
  "responseTime": 150
}
```

### Métricas de Performance

A API expõe métricas Prometheus para monitoramento:
- Request count por endpoint e status code
- Response time percentis (p50, p95, p99)
- Error rate por endpoint
- Active connections e resource utilization

## Compatibilidade e Migração

### Backward Compatibility

A API mantém compatibilidade com versões anteriores através de:
- Versionamento semântico rigoroso
- Deprecation warnings para funcionalidades obsoletas
- Período de transição adequado para breaking changes
- Documentação clara de mudanças em changelog

### Migração de Dados

Para facilitar migração de sistemas existentes, a API inclui:
- Endpoints de importação em lote
- Validação flexível durante migração
- Rollback automático em caso de falhas
- Relatórios detalhados de migração

## Conclusão

Os contratos de API foram cuidadosamente projetados para equilibrar funcionalidade, segurança e facilidade de uso. A compatibilidade com o frontend React existente garante integração suave, enquanto a arquitetura extensível permite evolução futura sem breaking changes significativas.

A documentação OpenAPI completa serve como contrato formal entre frontend e backend, garantindo que mudanças sejam comunicadas claramente e implementadas consistentemente. O sistema de validação compartilhada através de schemas Zod elimina discrepâncias entre client e server, reduzindo bugs e melhorando experiência de desenvolvimento.

