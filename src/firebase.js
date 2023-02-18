import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBT9fEeWF1W-WYtmSd7h6auHzkiCrvf0As",
  authDomain: "gestor-escolar-2e6c0.firebaseapp.com",
  projectId: "gestor-escolar-2e6c0",
  storageBucket: "gestor-escolar-2e6c0.appspot.com",
  messagingSenderId: "1077361603753",
  appId: "1:1077361603753:web:c1b290efeb345f9b60e5b8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();


export {db, auth, app};