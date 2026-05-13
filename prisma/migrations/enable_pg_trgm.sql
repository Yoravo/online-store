-- Enable pg_trgm extension untuk fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index pada nama produk untuk fuzzy search
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Trigram index pada nama toko untuk fuzzy search
CREATE INDEX IF NOT EXISTS idx_stores_name_trgm ON stores USING gin (name gin_trgm_ops);
