import { auth, provider } from './firebase.js';
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export let currentUser = null;

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.getElementById("loginBtn");
        const modeSelectBtn = document.getElementById("modeSelectBtn");
        const userDisplay = document.getElementById("userDisplay");

        if (user) {
            currentUser = user;
            if (userDisplay) userDisplay.innerHTML = `COMMANDER: <span>${user.displayName}</span>`;
            if (loginBtn) loginBtn.classList.add('hidden');
            if (modeSelectBtn) modeSelectBtn.classList.remove('hidden');
        } else {
            currentUser = null;
            if (userDisplay) userDisplay.innerHTML = `GUEST`;
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (modeSelectBtn) modeSelectBtn.classList.add('hidden');
        }
    });
}

export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
    } catch (err) {
        console.error("Login Error:", err);
        alert("Login failed: " + err.message);
    }
}
