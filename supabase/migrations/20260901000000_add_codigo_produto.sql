-- Migration: Add 'codigo' to 'products' table
-- Created at: 2026-09-01
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS codigo text;
