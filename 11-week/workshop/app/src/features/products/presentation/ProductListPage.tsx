import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';

import { add } from 'ionicons/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { getProducts } from '../data/products-api';
import { CATEGORIES, filterProducts, toProductView, type Product } from '../domain/product';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';
import ProductListSkeleton from './ProductListSkeleton';
/**
 * Pantalla: lista de productos (ruta /productos).
 *
 * Estado local con `useState` (ADR-001):
 *  - `products`, `status` y `errorMessage`: resultado de la carga desde la API;
 *  - `search` y `selectedCategory`: filtros que se aplican en memoria con `filterProducts`.
 * `useEffect` carga la lista al abrir y `useIonViewWillEnter` la recarga al volver a la pantalla.
 *
 * Cuatro estados: cargando · error con «Reintentar» · vacío (la API no tiene productos)
 * · sin resultados (hay productos, pero los filtros no encuentran ninguno).
 */
type LoadStatus = 'loading' | 'ready' | 'error';

/** «Todas» se representa con categoría vacía (así lo entiende `filterProducts`). */
const ALL_CATEGORIES = '';

const ProductListPage: React.FC = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const isLoadingRef = useRef(false);

  const loadProducts = useCallback(async () => {
    if (isLoadingRef.current) return; // evita pedir la lista dos veces a la vez
    isLoadingRef.current = true;
    setStatus('loading');
    try {
      setProducts(await getProducts());
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useIonViewWillEnter(() => {
    void loadProducts();
  });

  const visibleProducts = filterProducts(products, { search, category: selectedCategory });
  const categoryOptions = [ALL_CATEGORIES, ...CATEGORIES];

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(ALL_CATEGORIES);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <IonInput
            label="Buscar por nombre"
            labelPlacement="floating"
            fill="outline"
            clearInput
            value={search}
            onIonInput={(event) => setSearch(String(event.detail.value ?? ''))}
          />
          <div className="ion-margin-top">
            {categoryOptions.map((category) => (
              <IonButton
                key={category || 'todas'}
                size="small"
                fill={selectedCategory === category ? 'solid' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category || 'Todas'}
              </IonButton>
            ))}
          </div>
        </div>

        {status === 'loading' && <ProductListSkeleton rows={5} />}

        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={errorMessage}
            actionLabel="Reintentar"
            onAction={() => void loadProducts()}
          />
        )}

        {status === 'ready' && products.length === 0 && (
          <EmptyState
            title="No hay productos"
            message="Todavía no se ha registrado ningún producto."
            actionLabel="Crear producto"
            onAction={() => history.push('/productos/nuevo')}
          />
        )}

        {status === 'ready' && products.length > 0 && visibleProducts.length === 0 && (
          <EmptyState
            title="Sin resultados"
            message="Ningún producto coincide con la búsqueda o la categoría elegida."
            actionLabel="Ver todos"
            onAction={clearFilters}
          />
        )}

        {status === 'ready' && visibleProducts.length > 0 && (
          <IonList>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={toProductView(product)}
                onSelect={(id) => history.push(`/productos/${id}`)}
              />
            ))}
          </IonList>
        )}

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton routerLink="/productos/nuevo" aria-label="Nuevo producto">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;
