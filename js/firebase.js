import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNVdBXRTJMkACc46EUmn38Vy4Flz3vDOQ",
    authDomain: "typing-game-c5e84.firebaseapp.com",
    projectId: "typing-game-c5e84",
    storageBucket: "typing-game-c5e84.firebasestorage.app",
    messagingSenderId: "1017813191155",
    appId: "1:1017813191155:web:af354c72711c6488562a86"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
