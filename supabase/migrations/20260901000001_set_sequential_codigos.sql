WITH numbered_products AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) as rn
  FROM products
  WHERE (codigo IS NULL OR codigo = '') 
    AND (dimensions IS NULL OR dimensions = '' OR dimensions NOT SIMILAR TO '[0-9]{4}')
)
UPDATE products
SET codigo = lpad(numbered_products.rn::text, 4, '0')
FROM numbered_products
WHERE products.id = numbered_products.id;
