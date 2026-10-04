import { useEffect, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
  RefresherEventDetail,
} from '@ionic/react';
import { Book, createBook, getBooks } from '../services/api';

const BooksPage: React.FC = () => {
  // Estado de la lista
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadBooks();
    event.detail.complete();
  };

  const handleCreate = async () => {
    // Validación en el cliente antes de llamar a la API
    if (!title.trim() || !author.trim()) {
      setFormError('Escribe el título y el autor.');
      return;
    }
    if (year && !/^\d{1,4}$/.test(year)) {
      setFormError('El año debe ser un número, por ejemplo 1967.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const created = await createBook({
        title: title.trim(),
        author: author.trim(),
        year: year ? Number(year) : undefined,
      });
      setBooks((prev) => [...prev, created]);
      setTitle('');
      setAuthor('');
      setYear('');
      setToastMessage(`"${created.title}" agregado`);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Biblioteca</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Formulario para crear */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>Agregar libro</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonInput
              label="Título"
              labelPlacement="floating"
              value={title}
              onIonInput={(e) => setTitle(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Autor"
              labelPlacement="floating"
              value={author}
              onIonInput={(e) => setAuthor(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Año (opcional)"
              labelPlacement="floating"
              inputmode="numeric"
              value={year}
              onIonInput={(e) => setYear(e.detail.value ?? '')}
            />
          </IonItem>
        </IonList>

        <div className="ion-padding-horizontal">
          {formError && (
            <IonText color="danger">
              <p>{formError}</p>
            </IonText>
          )}
          <IonButton expand="block" onClick={handleCreate} disabled={saving}>
            {saving ? <IonSpinner name="dots" /> : 'Guardar libro'}
          </IonButton>
        </div>

        {/* Lista */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>Libros</IonLabel>
          </IonListHeader>

          {loading && (
            <div className="ion-text-center ion-padding">
              <IonSpinner />
            </div>
          )}

          {!loading && error && (
            <div className="ion-padding">
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
              <IonButton fill="outline" onClick={loadBooks}>
                Reintentar
              </IonButton>
            </div>
          )}

          {!loading && !error && books.length === 0 && (
            <IonItem>
              <IonLabel>Aún no hay libros. Agrega el primero con el formulario.</IonLabel>
            </IonItem>
          )}

          {!loading &&
            !error &&
            books.map((book) => (
              // routerLink navega a la pantalla de detalle
              <IonItem key={book.id} routerLink={`/books/${book.id}`} detail>
                <IonLabel>
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                </IonLabel>
                {book.year && <IonNote slot="end">{book.year}</IonNote>}
              </IonItem>
            ))}
        </IonList>

        <IonToast
          isOpen={toastMessage !== ''}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default BooksPage;
