import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { deleteProduct, getProduct } from '../data/products-api';
import { toProductView, type Product } from '../domain/product';
import EmptyState from './EmptyState';

/**
 * Pantalla: detalle de un producto (ruta /productos/:id).
 *
 * `useParams` entrega el `:id` como TEXTO; se convierte con `Number`.
 * Estados: cargando (skeleton) · listo · no encontrado (ApiError 404) · error con «Reintentar».
 * «Eliminar» pide confirmación con IonAlert y confirma el resultado con IonToast.
 */
type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

const DETAIL_FIELDS = ['Categoría', 'Precio', 'Stock'];

const ProductDetailPage: React.FC = () => {
  const productId = Number(useParams<{ id: string }>().id);
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProduct = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      setProduct(await getProduct(productId));
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      const isNotFound = error instanceof ApiError && error.status === 404;
      setStatus(isNotFound ? 'not-found' : 'error');
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  // Al volver desde «Editar», recarga para mostrar los datos actualizados.
  useIonViewWillEnter(() => {
    void loadProduct();
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await deleteProduct(productId);
      history.replace('/productos'); // replace: el detalle borrado no queda en el historial
      void presentToast({ message: 'Producto eliminado', duration: 2000, color: 'success', position: 'top' });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (name: string) => {
    void presentAlert({
      header: '¿Eliminar producto?',
      message: `Se eliminará «${name}». Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => void handleDelete() },
      ],
    });
  };

  const view = product ? toProductView(product) : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" text="Productos" />
          </IonButtons>
          <IonTitle>{view?.name ?? 'Detalle del producto'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="page-container">
          {status === 'loading' && (
            <IonList aria-busy="true" aria-label="Cargando producto">
              {DETAIL_FIELDS.map((field) => (
                <IonItem key={field}>
                  <IonLabel>{field}</IonLabel>
                  <IonSkeletonText slot="end" animated style={{ width: '90px' }} />
                </IonItem>
              ))}
            </IonList>
          )}

          {status === 'not-found' && (
            <EmptyState
              title="Producto no encontrado"
              message={`No existe un producto con el número ${productId}. Puede que ya se haya eliminado.`}
              actionLabel="Volver a la lista"
              onAction={() => history.replace('/productos')}
            />
          )}

          {status === 'error' && (
            <EmptyState
              title="No se pudo cargar"
              message={errorMessage}
              actionLabel="Reintentar"
              onAction={() => void loadProduct()}
            />
          )}

          {status === 'ready' && view && (
            <>
              <IonList>
                <IonItem>
                  <IonLabel>Categoría</IonLabel>
                  <IonText slot="end">{view.category}</IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>Precio</IonLabel>
                  <IonText slot="end">
                    <strong>{view.priceLabel}</strong>
                  </IonText>
                </IonItem>
                <IonItem>
                  <IonLabel>Stock</IonLabel>
                  <IonText slot="end">
                    {view.stock} ({view.stockLabel})
                  </IonText>
                </IonItem>
              </IonList>

              {/* Error al eliminar (por ejemplo, la API se detuvo): el producto sigue en pantalla. */}
              {errorMessage && (
                <IonText color="danger">
                  <p>{errorMessage}</p>
                </IonText>
              )}

              <div className="ion-margin-top">
                <IonButton routerLink={`/productos/${view.id}/editar`}>Editar</IonButton>
                <IonButton
                  color="danger"
                  fill="outline"
                  disabled={isDeleting}
                  onClick={() => confirmDelete(view.name)}
                >
                  {isDeleting ? 'Eliminando…' : 'Eliminar'}
                </IonButton>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;