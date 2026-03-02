-- Add per-board and per-product currency codes (BRL/EUR)
-- This enables running multiple pipelines in different currencies without conversion.

ALTER TABLE public.boards
ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'BRL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'boards_currency_code_chk'
  ) THEN
    ALTER TABLE public.boards
    ADD CONSTRAINT boards_currency_code_chk
    CHECK (currency_code IN ('BRL', 'EUR'));
  END IF;
END $$;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'BRL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_currency_code_chk'
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_currency_code_chk
    CHECK (currency_code IN ('BRL', 'EUR'));
  END IF;
END $$;

