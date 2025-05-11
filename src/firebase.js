import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBPe14HQONI8iXZbCJyb1giC28-NQ5msHU",
  authDomain: "lnct-oas.firebaseapp.com",
  databaseURL: "https://lnct-oas-default-rtdb.firebaseio.com",
  projectId: "lnct-oas",
  storageBucket: "lnct-oas.firebasestorage.app",
  messagingSenderId: "639637178623",
  appId: "1:639637178623:web:d849c6c98a0035abc2e4ca",
  measurementId: "G-M1MNH0FK5M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where };