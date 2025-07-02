import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAQ7WmHofbCGRMjyhztICYwneUjmMbH6vw",
  authDomain: "takeypay-ea1fb.firebaseapp.com",
  projectId: "takeypay-ea1fb",
  storageBucket: "takeypay-ea1fb.firebasestorage.app",
  messagingSenderId: "209841365344",
  appId: "1:209841365344:web:f2077d3c62b2ce3b737e05",
  measurementId: "G-V7Q3XPJ5W2"
};

//Inicializando o Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } 
  else {
    firebase.app(); // Caso já tenha uma instância
  }
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

const app = firebase.app();
  //const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export { firebase, app };
