import { Product, products as defaultProducts } from "./products";

const STORAGE_KEY = "festiva_products";

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...defaultProducts];
    }
  }
  return [...defaultProducts];
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const addProduct = (product: Omit<Product, "slug">): Product[] => {
  const products = getProducts();
  const newProduct: Product = { ...product, slug: generateSlug(product.name) };
  products.push(newProduct);
  saveProducts(products);
  return products;
};

export const updateProduct = (slug: string, data: Partial<Product>): Product[] => {
  const products = getProducts();
  const idx = products.findIndex((p) => p.slug === slug);
  if (idx !== -1) {
    const updated = { ...products[idx], ...data };
    if (data.name && data.name !== products[idx].name) {
      updated.slug = generateSlug(data.name);
    }
    products[idx] = updated;
    saveProducts(products);
  }
  return products;
};

export const deleteProduct = (slug: string): Product[] => {
  const products = getProducts().filter((p) => p.slug !== slug);
  saveProducts(products);
  return products;
};
