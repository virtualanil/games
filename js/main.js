import { initAuth, loginWithGoogle } from './auth.js';
import { Game } from './game.js';
import { setupUI } from './ui.js';

let game = null;

async function bootstrap() {
    // 1. Initialize Auth and standard UI immediately
    try {
        initAuth();
    } catch (e) {
        console.error("Auth Init Error:", e);
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', loginWithGoogle);
    }

    // 2. Fetch game data and initialize canvas game
    try {
        const res = await fetch('data/words.json');
        const wordsData = await res.json();
        
        game = new Game(wordsData);
        setupUI(game);
        console.log("Game System Initialized Successfully");
    } catch(err) {
        console.error("Failed to load game words data. Make sure you are using a local server.", err);
        // Fallback UI binding even if game fails
        setupUI(null);
    }
}

// Start application
window.addEventListener('DOMContentLoaded', bootstrap);
