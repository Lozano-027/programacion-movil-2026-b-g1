import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLabel,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { createProduct, getProduct, updateProduct } from '../data/products-api';
import { CATEGORIES, validateProduct, type ProductField, type ProductInput } from '../domain/product';
import EmptyState from './EmptyState';

/**
 * Pantalla: formulario de producto. La misma pantalla sirve para dos rutas:
 *  - /productos/nuevo          → crear (no hay `id` en la ruta)
 *  - /productos/:id/editar     → editar (hay `id`; se precargan los campos con `getProduct`)
 *
 * Validación EN LÍNEA: en cada render se llama a `validateProduct` con lo escrito, y el error de
 * un campo se muestra apenas la persona lo toca (`touchedFields`) o cuando intenta guardar.
 * Si el servidor rechaza (ApiError 400), se muestran su mensaje y sus `details`.
 */
type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

/** Campos de texto vacíos se convierten en NaN para que `validateProduct` los marque inválidos. */
function toNumber(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text);
}

const FIELD_LABELS: Record<ProductField, string> = { name: 'Nombre', price: 'Precio', stock: 'Stock', category: 'Categoría' };
const NO_TOUCHED_FIELDS: Record<ProductField, boolean> = { name: false, price: false, category: false, stock: false };

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = id !== undefined;
  const productId = Number(id);
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  // Los campos numéricos se guardan como texto (lo que escribe la persona) y se convierten al validar.
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [category, setCategory] = useState('');
  const [stockText, setStockText] = useState('');

  const [status, setStatus] = useState<LoadStatus>(isEditing ? 'loading' : 'ready');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [touchedFields, setTouchedFields] = useState(NO_TOUCHED_FIELDS);
  const [hasTriedToSave, setHasTriedToSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverDetails, setServerDetails] = useState<string[]>([]);

  // Modo editar: precarga los campos con el producto actual.
  useEffect(() => {
    if (!isEditing) return;
    let isActive = true; // evita actualizar el estado si la pantalla ya se cerró
    getProduct(productId)
      .then((product) => {
        if (!isActive) return;
        setName(product.name);
        setPriceText(String(product.price));
        setCategory(product.category);
        setStockText(String(product.stock));
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadErrorMessage(getErrorMessage(error));
        setStatus(error instanceof ApiError && error.status === 404 ? 'not-found' : 'error');
      });
    return () => {
      isActive = false;
    };
  }, [isEditing, productId]);

  const input: ProductInput = {
    name,
    price: toNumber(priceText),
    category,
    stock: toNumber(stockText),
  };
  const validation = validateProduct(input);

  const markTouched = (field: ProductField) => setTouchedFields((current) => ({ ...current, [field]: true }));

  /** Mensaje de error de un campo, solo si ya se tocó o si se intentó guardar. */
  const getFieldError = (field: ProductField): string | undefined =>
    touchedFields[field] || hasTriedToSave ? validation.errors[field] : undefined;

  const handleSave = async () => {
    setHasTriedToSave(true);
    setServerError('');
    setServerDetails([]);
    if (!validation.isValid) return; // no se llama a la API con datos inválidos

    setIsSaving(true);
    try {
      const cleanInput = { ...input, name: input.name.trim() };
      if (isEditing) {
        await updateProduct(productId, cleanInput);
        history.replace(`/productos/${productId}`);
      } else {
        await createProduct(cleanInput);
        history.replace('/productos');
      }
      void presentToast({ message: 'Producto guardado', duration: 2000, color: 'success', position: 'top' });
    } catch (error) {
      setServerError(getErrorMessage(error));
      setServerDetails(error instanceof ApiError ? error.details : []);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = Object.values(touchedFields).some(Boolean);
  const pendingFields = (Object.keys(validation.errors) as ProductField[]).map((field) => FIELD_LABELS[field]);

  /** Cancelar con cambios sin guardar pide confirmación antes de descartarlos. */
  const handleCancel = () => {
    if (!hasChanges) {
      history.goBack();
      return;
    }
    void presentAlert({
      header: '¿Descartar cambios?',
      message: 'Los datos que escribió no se guardarán.',
      buttons: [
        { text: 'Seguir editando', role: 'cancel' },
        { text: 'Descartar', role: 'destructive', handler: () => history.goBack() },
      ],
    });
  };
  
  const renderFieldError = (field: ProductField) => {
    const message = getFieldError(field);
    return message ? (
      <IonText color="danger">
        <p className="ion-no-margin ion-margin-bottom">
          <small>{message}</small>
        </p>
      </IonText>
    ) : null;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}

        {status === 'not-found' && (
          <EmptyState
            title="No encontrado"
            message={loadErrorMessage}
            actionLabel="Volver a la lista"
            onAction={() => history.replace('/productos')}
          />
        )}

        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={loadErrorMessage}
            actionLabel="Volver a la lista"
            onAction={() => history.replace('/productos')}
          />
        )}

        {status === 'ready' && (
          <>
            <IonInput
              className="ion-margin-top"
              label="Nombre"
              labelPlacement="floating"
              fill="outline"
              maxlength={60}
              value={name}
              onIonInput={(event) => {
                setName(String(event.detail.value ?? ''));
                markTouched('name');
              }}
            />
            {renderFieldError('name')}

            <IonInput
              className="ion-margin-top"
              label="Precio (COP)"
              labelPlacement="floating"
              fill="outline"
              type="number"
              inputmode="decimal"
              value={priceText}
              onIonInput={(event) => {
                setPriceText(String(event.detail.value ?? ''));
                markTouched('price');
              }}
            />
            {renderFieldError('price')}

            <IonInput
              className="ion-margin-top"
              label="Stock (unidades)"
              labelPlacement="floating"
              fill="outline"
              type="number"
              inputmode="numeric"
              value={stockText}
              onIonInput={(event) => {
                setStockText(String(event.detail.value ?? ''));
                markTouched('stock');
              }}
            />
            {renderFieldError('stock')}

            <div className="ion-margin-top">
              <IonLabel>Categoría</IonLabel>
              <div>
                {CATEGORIES.map((option) => (
                  <IonButton
                    key={option}
                    size="small"
                    className="touch-target"
                    aria-pressed={category === option}
                    fill={category === option ? 'solid' : 'outline'}
                    onClick={() => {
                      setCategory(option);
                      markTouched('category');
                    }}
                  >
                    {option}
                  </IonButton>
                ))}
              </div>
            </div>
            {renderFieldError('category')}

            {serverError && (
              <IonText color="danger">
                <p>
                  <strong>{serverError}</strong>
                </p>
                {serverDetails.length > 0 && (
                  <ul>
                    {serverDetails.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </IonText>
            )}

            <IonButton
              expand="block"
              className="ion-margin-top"
              disabled={isSaving || !validation.isValid}
              onClick={() => void handleSave()}
            >
              {isSaving && <IonSpinner name="crescent" slot="start" aria-hidden="true" />}
              {isSaving ? 'Guardando…' : 'Guardar'}
            </IonButton>
            {!validation.isValid && (
              <IonText color="medium">
                <p className="ion-text-center">
                  <small>Para guardar, revise: {pendingFields.join(', ')}.</small>
                </p>
              </IonText>
            )}
            <IonButton expand="block" fill="clear" disabled={isSaving} onClick={handleCancel}>
              Cancelar
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;
