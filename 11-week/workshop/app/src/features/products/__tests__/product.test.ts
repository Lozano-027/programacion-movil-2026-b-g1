import { describe, expect, it } from 'vitest';
import seedProducts from '../../../../server/data/products.json';
import {
  CATEGORIES,
  filterProducts,
  formatCOP,
  LOW_STOCK_THRESHOLD,
  toProductView,
  validateProduct,
  type Product,
} from '../domain/product';

/**
 * Pruebas unitarias de EJEMPLO (ya vienen dadas) para que `npm test` corra desde el inicio.
 * Muestran el estilo esperado: describe / it / expect, sin red ni pantallas.
 */
describe('datos semilla de la API (ejemplo)', () => {
  it('trae 8 productos con ids 1 a 8', () => {
    expect(seedProducts).toHaveLength(8);
    expect(seedProducts.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('usa solo categorías permitidas y stock entero no negativo', () => {
    for (const item of seedProducts) {
      expect(CATEGORIES).toContain(item.category);
      expect(Number.isInteger(item.stock)).toBe(true);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('incluye productos agotados y con pocas unidades para probar las etiquetas', () => {
    expect(seedProducts.some((item) => item.stock === 0)).toBe(true);
    expect(seedProducts.some((item) => item.stock > 0 && item.stock < LOW_STOCK_THRESHOLD)).toBe(true);
  });
});

describe('formatCOP (ejemplo)', () => {
  it('separa los miles con punto y antepone el signo de pesos', () => {
    expect(formatCOP(1250000)).toBe('$ 1.250.000');
    expect(formatCOP(8500)).toBe('$ 8.500');
    expect(formatCOP(950)).toBe('$ 950');
  });
});

/** Producto base para las pruebas; cada prueba cambia solo lo que necesita. */
const sampleProduct: Product = { id: 1, name: 'Agua mineral 600 ml', price: 1800, category: 'Bebidas', stock: 120 };

describe('validateProduct', () => {
  it('acepta un producto válido', () => {
    const result = validateProduct({ name: 'Café', price: 9800, category: 'Bebidas', stock: 0 });
    expect(result).toEqual({ isValid: true, errors: {} });
  });

  it('rechaza un nombre vacío, un precio menor o igual que 0 y una categoría no permitida', () => {
    const result = validateProduct({ name: '   ', price: 0, category: 'Ropa', stock: 2.5 });

    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(['category', 'name', 'price', 'stock']);
  });

  it('rechaza un nombre de más de 60 caracteres', () => {
    const result = validateProduct({ name: 'a'.repeat(61), price: 100, category: 'Hogar', stock: 1 });
    expect(result.errors.name).toBeDefined();
  });
});

describe('toProductView', () => {
  it('formatea el precio en pesos y marca «Agotado» y «Pocas unidades»', () => {
    expect(toProductView({ ...sampleProduct, price: 1250000 }).priceLabel).toBe('$ 1.250.000');

    const outOfStock = toProductView({ ...sampleProduct, stock: 0 });
    expect(outOfStock.stockLabel).toBe('Agotado');
    expect(outOfStock.isOutOfStock).toBe(true);

    const lowStock = toProductView({ ...sampleProduct, stock: 4 });
    expect(lowStock.stockLabel).toBe('Pocas unidades');
    expect(lowStock.isLowStock).toBe(true);

    expect(toProductView({ ...sampleProduct, stock: 5 }).stockLabel).toBe('Disponible');
  });
});

describe('filterProducts', () => {
  it('filtra por texto sin distinguir mayúsculas y por categoría exacta', () => {
    expect(filterProducts(seedProducts, { search: 'GALLETAS', category: '' }).map((item) => item.id)).toEqual([5]);
    expect(filterProducts(seedProducts, { search: '', category: 'Aseo' }).map((item) => item.id)).toEqual([6, 7]);
    expect(filterProducts(seedProducts, { search: 'jugo', category: 'Snacks' })).toEqual([]);
  });

  it('no filtra con texto vacío y no modifica el arreglo original', () => {
    const result = filterProducts(seedProducts, { search: '  ', category: '' });
    expect(result).toHaveLength(8);
    expect(result).not.toBe(seedProducts);
  });
});
