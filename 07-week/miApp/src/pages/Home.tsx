import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import Saludo from '../components/Saludo';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis Buenos Hábitos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle>Mis Buenos Hábitos</IonTitle>
          </IonToolbar>
        </IonHeader>

        <Saludo nombre="Julio" />
      </IonContent>
    </IonPage>
  );
};

export default Home;
