import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Adicione esta linha

const firebaseConfig = {
  apiKey: "AIzaSyCuu1KfeIl6oMZEQ1uRhZ0-xnD7jgPEDdM",
  authDomain: "chat-teste-4f0ab.firebaseapp.com",
  projectId: "chat-teste-4f0ab",
  storageBucket: "chat-teste-4f0ab.firebasestorage.app",
  messagingSenderId: "273740334944",
  appId: "1:273740334944:web:9fc562531258c99e39c005",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Exporte o Firestore
