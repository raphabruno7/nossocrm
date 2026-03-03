# Resumo (2026-03-03) — Moeda BRL/EUR por Board + Deploy

## Objetivo
Adicionar suporte a **BRL** e **EUR** no NossoCRM, permitindo operar **Brasil** e **Portugal** ao mesmo tempo, com a moeda definida **por board/pipeline** (sem conversão).

## O que foi feito no código
- Modelo: **moeda por board/pipeline** (ex.: “Brasil” = BRL, “Portugal” = EUR).
- Banco:
  - Nova migration: `supabase/migrations/20260301000000_add_currency_code.sql`
  - Atualização do schema init: `supabase/migrations/20251201000000_schema_init.sql` (inclui `currency_code` em `boards` e `products`).
- Tipos/formatadores:
  - Tipos: `types/types.ts` (`CurrencyCode`, `currencyCode` em `Board`, `DealView`, `Product`)
  - Utilitário: `lib/currency.ts` (formatadores e símbolo)
- UI (principais pontos):
  - Board → “Estratégia do Board”: seletor **Moeda do pipeline** (BRL/EUR)
  - Formatação de valores ajustada em Kanban, Deal modal, Dashboard, Relatórios/PDF e Cockpit
  - Catálogo de produtos agora permite escolher moeda do produto (BRL/EUR)

## Atualização do Supabase (Cloud)
Rodar no Supabase Dashboard → **SQL Editor**:
- Conteúdo de `supabase/migrations/20260301000000_add_currency_code.sql`

Verificação (exemplo):
```sql
select
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('boards','products')
  and column_name = 'currency_code';
```

## Deploy na Vercel
- O projeto está conectado ao GitHub e a branch de produção é `main`.
- Portanto, **push no `main` → deploy automático**.

## Status/Commits
- Commit aplicado no `main`: `5b443f2` (“feat: add BRL/EUR currency per board”).

## Como usar no app
1) Abra o board/pipeline desejado.
2) Clique na **engrenagem** (config do board).
3) Em **Estratégia do Board**, selecione **Moeda do pipeline**:
   - `BRL (R$)` para Brasil
   - `EUR (€)` para Portugal

## Como repassar para outra pessoa (resumo)
Ela precisa fazer 2 coisas:
1) **Atualizar o banco** (rodar o SQL da migration no Supabase dela).
2) **Atualizar o app** (merge/pull/push do código e deploy na Vercel dela — ou usar um PR).

