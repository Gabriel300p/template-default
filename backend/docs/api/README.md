# 📡 API Documentation

> **Documentação completa das APIs** do Template Default Backend

---

## 🎯 **Visão Geral**

Este backend NestJS oferece APIs RESTful para suportar o frontend React. Todas as rotas seguem padrões RESTful e incluem validação, autenticação e documentação automática.

---

## 🔗 **Endpoints Disponíveis**

### 🏥 **Health Check**
```http
GET /health
```
**Descrição**: Verifica o status do servidor  
**Resposta**: Status da aplicação e dependências

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory": { "status": "up" }
  }
}
```

### 📋 **Records API**
Base URL: `/api/records`

#### **Listar Records**
```http
GET /api/records
```
**Query Parameters**:
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 20)
- `search` (string): Busca por título ou descrição
- `status` (enum): `active`, `inactive`, `pending`
- `category` (string): Filtro por categoria

**Resposta**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Record Title",
      "description": "Record description",
      "status": "active",
      "category": "general",
      "tags": ["tag1", "tag2"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### **Buscar Record por ID**
```http
GET /api/records/:id
```
**Parâmetros**:
- `id` (UUID): ID do record

#### **Criar Record**
```http
POST /api/records
```
**Body**:
```json
{
  "title": "New Record",
  "description": "Description",
  "status": "active",
  "category": "general",
  "tags": ["tag1"]
}
```

#### **Atualizar Record**
```http
PUT /api/records/:id
```
**Body**: Mesmo formato da criação (campos opcionais)

#### **Deletar Record**
```http
DELETE /api/records/:id
```

---

## 🔐 **Autenticação**

### **JWT Authentication**
```http
Authorization: Bearer <jwt_token>
```

### **Endpoints de Auth**
```http
POST /auth/login    # Login
POST /auth/register # Registro
GET  /auth/profile  # Perfil do usuário
```

---

## ⚠️ **Códigos de Erro**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Bad Request |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno |

---

## 🔧 **Desenvolvimento**

### **Swagger Documentation**
Acesse: `http://localhost:3000/api/docs`

### **Executar Backend**
```bash
cd backend
npm install
npm run start:dev
```

---

## 📊 **Rate Limiting**

- **Global**: 100 requests/minuto
- **Auth**: 5 login attempts/minuto
- **API**: 60 requests/minuto por usuário

---

<div align="center">
  <p><strong>📡 APIs modernas e bem documentadas</strong></p>
  <p><em>Construídas seguindo as melhores práticas REST</em></p>
</div>
