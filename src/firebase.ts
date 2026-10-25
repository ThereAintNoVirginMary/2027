import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXUgXRP5cMMxUzTjbMAxoqIZGUmU7l490",
  authDomain: "thereaintnovirginmary2027.firebaseapp.com",
  projectId: "thereaintnovirginmary2027",
  storageBucket: "thereaintnovirginmary2027.firebasestorage.app",
  messagingSenderId: "1061446738611",
  appId: "1:1061446738611:web:8634ac4c1eadd4890f06c6",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
