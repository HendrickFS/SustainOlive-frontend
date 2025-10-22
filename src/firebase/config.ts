// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAN9_UF8KXD8-vBYCo6H4L0kE6w4UZisho",
  authDomain: "sustainolive-auth.firebaseapp.com",
  projectId: "sustainolive-auth",
  storageBucket: "sustainolive-auth.firebasestorage.app",
  messagingSenderId: "311485292725",
  appId: "1:311485292725:web:50fa3bb9f6210d62779efc",
  measurementId: "G-CKT2LNQCLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);