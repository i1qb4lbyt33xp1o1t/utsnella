// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC0J46wGVkwbHdAo0bh66IBOI0npRfFJ_E",
    authDomain: "uts2-9dad5.firebaseapp.com",
    projectId: "uts2-9dad5",
    storageBucket: "uts2-9dad5.firebasestorage.app",
    messagingSenderId: "596378933343",
    appId: "1:596378933343:web:e53d7a6f2f78d67db2a3ea"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);