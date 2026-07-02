import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0360650018",
  appId: "1:456458499374:web:e9e5d7d1fcaabf575f36bf",
  apiKey: "AIzaSyA5bD5ZRxDVtShst7g88EytE3TS6j_86yI",
  authDomain: "gen-lang-client-0360650018.firebaseapp.com",
  storageBucket: "gen-lang-client-0360650018.firebasestorage.app",
  messagingSenderId: "456458499374"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };
