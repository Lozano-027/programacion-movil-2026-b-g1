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
  IonText,
  IonTitle,
  IonToolbar,
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
 * Estados: cargando · listo · no encontrado (ApiError 404) · error con «Reintentar».
 * «Eliminar» no borra de una vez: muestra una confirmación (`isConfirmingDelete`).
 */
type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

const ProductDetailPage: React.FC = () => {
  const productId = Number(useParams<{ id: string }>().id);
  const history = useHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProduct = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setIsConfirmingDelete(false);
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
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const view = product ? toProductView(product) : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>{view?.name ?? 'Detalle del producto'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}

        {status === 'not-found' && (
          <EmptyState
            title="No encontrado"
            message={errorMessage}
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
                <IonLabel>Id</IonLabel>
                <IonText slot="end">{view.id}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Nombre</IonLabel>
                <IonText slot="end">{view.name}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Categoría</IonLabel>
                <IonText slot="end">{view.category}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Precio</IonLabel>
                <IonText slot="end">{view.priceLabel}</IonText>
              </IonItem>
              <IonItem>
                <IonLabel>Stock</IonLabel>
                <IonText slot="end">
                  {view.stock} ({view.stockLabel})
                </IonText>
              </IonItem>
            </IonList>

            {/* Error al eliminar (por ejemplo, la API se detuvo): el producto sigue en pantalla. */}
            {errorMessage && !isConfirmingDelete && (
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            )}

            {!isConfirmingDelete ? (
              <div className="ion-margin-top">
                <IonButton routerLink={`/productos/${view.id}/editar`}>Editar</IonButton>
                <IonButton color="danger" fill="outline" onClick={() => setIsConfirmingDelete(true)}>
                  Eliminar
                </IonButton>
              </div>
            ) : (
              <div className="ion-margin-top">
                <IonText>
                  <p>¿Eliminar «{view.name}»? Esta acción no se puede deshacer.</p>
                </IonText>
                <IonButton color="danger" disabled={isDeleting} onClick={() => void handleDelete()}>
                  {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
                </IonButton>
                <IonButton fill="outline" disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)}>
                  Cancelar
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;
