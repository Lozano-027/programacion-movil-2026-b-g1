import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Book, getBook } from '../services/api';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBook = async () => {
    setLoading(true);
    setError(null);
    try {
      setBook(await getBook(id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/books" />
          </IonButtons>
          <IonTitle>Detalle</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading && (
          <div className="ion-text-center">
            <IonSpinner />
          </div>
        )}

        {!loading && error && (
          <>
            <IonText color="danger">
              <p>{error}</p>
            </IonText>
            <IonButton fill="outline" onClick={loadBook}>
              Reintentar
            </IonButton>
            <IonButton fill="clear" routerLink="/books" routerDirection="back">
              Volver a la lista
            </IonButton>
          </>
        )}

        {!loading && book && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Libro #{book.id}</IonCardSubtitle>
              <IonCardTitle>{book.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>Autor:</strong> {book.author}</p>
              <p><strong>Año:</strong> {book.year ?? 'Sin dato'}</p>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default BookDetailPage;
