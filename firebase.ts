import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';

import { getDatabase } from 'firebase/database';


const firebaseConfig = {

  apiKey: "AIzaSyDFwusZ60ZdCwNfg__YrMA6Ww25jeBOiDk",

  authDomain: "vid1-e2c7d.firebaseapp.com",

  databaseURL: "https://vid1-e2c7d-default-rtdb.firebaseio.com",

  projectId: "vid1-e2c7d",

  storageBucket: "vid1-e2c7d.firebasestorage.app",

  messagingSenderId: "323883326794",

  appId: "1:323883326794:web:e1254b899aefa6584175b3",

  measurementId: "G-GQHZRYG3B0"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const database = getDatabase(app);

export default app;
