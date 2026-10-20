import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../data/api-error';
import { getProducts } from '../data/products-api';
import type { Product } from '../domain/product';
import ProductListPage from '../presentation/ProductListPage';

vi.mock('../data/products-api', () => ({
  getProducts: vi.fn(),
}));

const getProductsMock = vi.mocked(getProducts);

const agua: Product = {
  id: 1,
  name: 'Agua mineral 600 ml',
  category: 'Bebidas',
  price: 1800,
  stock: 120,
};

function renderListPage() {
  return render(
    <MemoryRouter>
      <ProductListPage />
    </MemoryRouter>,
  );
}

describe('ProductListPage · estado de error', () => {
  beforeEach(() => {
    getProductsMock.mockReset();
  });

  it('muestra el mensaje de error cuando la API falla', async () => {
    getProductsMock.mockRejectedValueOnce(new ApiError('No fue posible conectar con el servidor.', null));

    renderListPage();

    expect(await screen.findByText('No se pudo cargar')).toBeInTheDocument();
    expect(screen.getByText(/No fue posible conectar con el servidor/)).toBeInTheDocument();
  });

  it('el botón Reintentar vuelve a pedir los productos y muestra la lista', async () => {
    getProductsMock
      .mockRejectedValueOnce(new ApiError('No fue posible conectar con el servidor.', null))
      .mockResolvedValueOnce([agua]);

    renderListPage();

    fireEvent.click(await screen.findByText('Reintentar'));

    expect(await screen.findByText('Agua mineral 600 ml')).toBeInTheDocument();
    expect(getProductsMock).toHaveBeenCalledTimes(2);
  });
});