## Implementation Plan – Frontend Template Evolution
Data: 2025-08-10
Baseline Confidence: 98%

### Visão Geral
Roadmap incremental em epics isoladas com PRs pequenos (< 400 LOC mod). Cada PR inclui: descrição, checklist, testes/ajustes necessários, instrução de rollback simples (git revert ou remoção do feature flag), e validação local (lint + test + type-check).

### Epics & Sprints (Sequência Recomendada)

#### Epic 1 – i18n Infrastructure (Sprint 1)
Objetivo: Habilitar internacionalização com fallback pt-BR → en-US sem quebrar UI.
PR 1: Add deps (`i18next`, `react-i18next`), `src/i18n/init.ts`, provider em `AppProviders`, config fallback, detection (query > localStorage > navigator).  
PR 2: Zod error map (`zodErrorMap.ts`), registrar global, migrar 1 schema exemplo para chaves.  
PR 3: Script de verificação (lint simples) para detectar strings PT-BR não externalizadas (regex básica; gera warn).  
PR 4: Externalizar strings da feature comunicacoes → records (UI + toasts).  
Critérios Done: toggle idioma muda labels primários, fallback funcionando, 100% mensagens feature externalizadas.

#### Epic 2 – Records Generic Feature (Sprint 2–3)
Objetivo: Transformar comunicacoes em módulo genérico reutilizável.
PR 1: Introduzir pasta `features/records` (parallel) + config base (tipos RecordEntity, factory query keys) sem retirar antiga.
PR 2: CRUD hooks genéricos (`createCrudHooks`), serviço mock adaptado, mapping de schema.
PR 3: Filtro DSL inicial + applyFilters + URL sync (adaptação do useFilters).
PR 4: Table + columns factory + modais (schema-driven) + skeletons padronizados.
PR 5: Migration: substituir rota /comunicacoes → /records (ou alias) + deprecate index antigo + remover código legado após verificação.
Critérios Done: API pública documentada (README, Storybook stories), rotas funcionando, testes de hook e filtragem.

#### Epic 3 – Error Handling Strategy (Sprint 3)
PR 1: Definir taxonomy + `mapError` util + tipos.
PR 2: `useSafeMutation` e `useSafeQuery` wrappers aplicados à feature records.
PR 3: ErrorBoundary por escopo (ex.: boundary local para DataTable) + fallback i18n.
PR 4: Retrofits em outros hooks compartilhados (se existirem).
Done: 100% mutações de records usam wrappers; fallback diferenciado para Validation v.s. Network.

#### Epic 4 – Animation Standardization (Sprint 4)
PR 1: Introduzir wrappers (`PageTransition`, `AnimatedModal`, `AnimatedList`).
PR 2: Refator página records substituindo animações inline.
PR 3: Ajuste skeleton/table transitions (sequencing, accessibility prefers-reduced-motion guard).
Done: Nenhum `motion.div` manual repetindo padrões básicos na feature; wrappers documentados.

#### Epic 5 – Filter DSL Enhancements (Sprint 4)
PR 1: UI auto builder para text/multi-select/date-range.
PR 2: Extensibilidade (custom component override por key).
PR 3: Documentação DSL + exemplos.
Done: Troca/adição de filtro sem alterar lógica interna; somente config.

#### Epic 6 – Docs Reorganization & AI Guides (Sprint 5)
PR 1: Nova árvore `/docs` + índice + migração seletiva de conteúdos existentes.
PR 2: `docs/features/records.md` (API, exemplos, extensão).
PR 3: `docs/ai/prompts.md` + mutation/refactor playbook.
PR 4: i18n guide + error handling guide + animations guide.
Done: README principal referencia docs; AI prompts testados (copy/paste útil).

#### Epic 7 – Storybook Setup (Sprint 5)
PR 1: Instalação Storybook (vite builder) + config i18n decorator.
PR 2: Stories: Button, Toast, RecordsTable, RecordsModal (docs + controls).
PR 3: A11y & interactions addon + basic test integration (Storybook test-runner). *Opcional se tempo.*
Done: Execução local `pnpm storybook` gera docs com i18n toggle.

#### Epic 8 – QA & Coverage Sustentado (Contínuo)
PRs contínuos: adicionar testes para novos hooks, filtros, error mapping, i18n switching. Meta coverage ≥70%.

### Estimativa Macro (Comparativa)
| Epic | Estimativa | Notas |
|------|------------|-------|
| 1 | 1.5–2 dias | Depende volume de strings inicial |
| 2 | 3–4 dias | Maior refactor estrutural |
| 3 | 1 dia | Após hooks genéricos prontos |
| 4 | 0.5 dia | Substituição focada |
| 5 | 1–1.5 dias | UI builder + docs |
| 6 | 2 dias | Conteúdo + reorganização |
| 7 | 0.5–1 dia | Setup + poucas stories |
| 8 | Contínuo | Acompanha PRs |

### PR Checklist (Base)
```
- [ ] Conventional Commit no título
- [ ] Lint / Type-check / Tests locais OK
- [ ] Coverage não reduziu (<70%)
- [ ] Strings novas externalizadas (i18n)
- [ ] Animações usam wrappers aprovados
- [ ] Errors mapeados por taxonomy
- [ ] Docs atualizadas (se público exposto mudou)
- [ ] Storybook story adicionada/atualizada (se UI)
- [ ] Acessibilidade considerada (se interativo)
```

### Estrutura Proposta de Arquivos Novos (Resumo)
```
src/i18n/
  init.ts
  zodErrorMap.ts
  locales/{pt-BR,en-US}/{common.json,records.json}
src/features/records/
  index.ts
  config/ (ex: filters.ts, columns.ts)
  hooks/ (createCrudHooks.ts, useRecords.ts)
  components/ (RecordsTable.tsx, RecordsModal.tsx)
  schemas/ (record.schemas.ts)
shared/errors/ (errorTypes.ts, mapError.ts)
shared/filters/ (dsl.ts, applyFilters.ts)
shared/animations/wrappers/ (PageTransition.tsx, AnimatedModal.tsx)
storybook/ (config addons + preview.ts)
```

### Rollback Strategy
Cada PR mantém código antigo paralelo até etapa de migração final. Ex.: comunicacoes coexistente com records até PR de substituição. Uso de feature flag simples (`ENABLE_RECORDS_NEW=true`) opcional no provider para ativar progressivamente.

### Riscos Específicos de Execução & Mitigações Curta
| Risco | Mitigação |
|-------|-----------|
| Refactor quebrar rota existente | Rota antiga mantida com aviso (console.warn) até migração completa |
| Colisão de tipos entre comunicacao e record | Namespaces distintos + Adapter layer para migração |
| i18n inflar bundle | Lazy loading de namespaces não críticos (ex.: futuramente) |
| Testes flutuantes com animações | Preferir `reducedMotion` flag nos testes, mock framer-motion se necessário |

### Monitoramento (Quality Gates)
- CI existente permanece; adicionar job opcional para Storybook build (`build-storybook`).
- Script de verificação de strings roda em lint stage (warning inicialmente → pode virar bloqueio depois).

### Encerramento / Go-No-Go
Ao final do Epic 2 (Records), template já replicável. Demais epics refinam qualidade, DX e documentação. Pode-se publicar tag `v1.0.0-template` após Epics 1–3 + baseline docs.

### AI Prompts (Exemplos)
1. Análise:
"Você é um revisor de arquitetura. Examine o diretório src/features/records e identifique acoplamentos indevidos, oportunidades de redução de código repetido e riscos de escalabilidade. Responda em uma tabela com colunas: Arquivo, Problema, Impacto, Recomendação."

2. Refatoração:
"Refatore o hook useRecords para extrair a lógica de optimistic updates usando createCrudHooks. Garanta que os testes existentes continuem passando e adicione teste para cenário de erro de rede. Não introduza dependências novas."

3. Implementação:
"Implemente suporte i18n para o modal de criação de record. Externalize todas as strings para locales/pt-BR/records.json e en-US/records.json, use o hook useTranslation('records') e mantenha fallback funcionando. Atualize a story correspondente." 

### Próximo Passo
Confirmar este plano (ou ajustes) → iniciar Epic 1 / PR 1.

---
Em caso de ajustes, listar apenas diffs desejados; o plano será atualizado incrementalmente.
