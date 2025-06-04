// Import the functions you need from the SDKs you need
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "a",// process.env.API_KEY,
  authDomain: "a",//process.env.AUTH_DOMAIN,
  projectId: "a",//PROJECT_ID,
  storageBucket: "a",//process.env.STORAGE_BUCKET,
  messagingSenderId: "a",//process.env.MESSAGING_SENDER_ID,
  appId: "a",//process.env.APP_ID,
  measurementId: "a",//process.env.MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
