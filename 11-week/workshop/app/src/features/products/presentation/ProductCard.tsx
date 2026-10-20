import { IonBadge, IonItem, IonLabel } from '@ionic/react';

import type { ProductView } from '../domain/product';

export interface ProductCardProps {
  /** Producto ya preparado para mostrar (resultado de `toProductView`). */
  product: ProductView;
  /** Se invoca con el id del producto cuando la persona toca la tarjeta. */
  onSelect?: (id: number) => void;
}

/** Color del aviso de stock: rojo si está agotado, amarillo si quedan pocas, verde si hay. */
function getStockColor(product: ProductView): string {
  if (product.isOutOfStock) return 'danger';
  if (product.isLowStock) return 'warning';
  return 'success';
}

/**
 * Tarjeta reutilizable de un producto (se usa en la lista).
 *
 * Igual que `EmptyState`: props tipadas en una `interface` `<Componente>Props`, la opcional con `?`,
 * y el componente solo MUESTRA datos y AVISA con una función (`onSelect`), sin saber de la API.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => (
  <IonItem button detail onClick={() => onSelect?.(product.id)}>
    <IonLabel>
      <h2>{product.name}</h2>
      <p>{product.category}</p>
      <p>
        <strong>{product.priceLabel}</strong>
      </p>
    </IonLabel>
    <IonBadge slot="end" color={getStockColor(product)}>
      {product.stockLabel}
    </IonBadge>
  </IonItem>
);

export default ProductCard;
