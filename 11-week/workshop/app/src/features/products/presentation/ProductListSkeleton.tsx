import { IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/react';

interface ProductListSkeletonProps {
  rows?: number;
}

/** Filas con la misma forma que ProductCard: nombre, categoría, precio y badge de stock. */
const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ rows = 5 }) => (
  <IonList aria-busy="true" aria-label="Cargando productos">
    {Array.from({ length: rows }, (_, index) => (
      <IonItem key={index}>
        <IonLabel>
          <h2>
            <IonSkeletonText animated style={{ width: '60%' }} />
          </h2>
          <p>
            <IonSkeletonText animated style={{ width: '30%' }} />
          </p>
          <p>
            <IonSkeletonText animated style={{ width: '25%' }} />
          </p>
        </IonLabel>
        <IonSkeletonText slot="end" animated style={{ width: '80px', height: '24px' }} />
      </IonItem>
    ))}
  </IonList>
);

export default ProductListSkeleton;