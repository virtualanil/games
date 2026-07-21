import { initAuth, loginWithGoogle } from './auth.js';
import { Game } from './game.js';
import { setupUI } from './ui.js';

let game;

async function bootstrap() {
    initAuth();
    
    // Login button assignment
    document.getElementById('loginBtn').addEventListener('click', loginWithGoogle);

    try {
        const res = await fetch('data/words.json');
        const wordsData = await res.json();
        
        // Initialize Game once data is loaded
        game = new Game(wordsData);
        setupUI(game);
        console.log("System Initialized");
    } catch(err) {
        console.error("Failed to load words data. Make sure you are using a local server.", err);
    }
}

// Start application
window.onload = bootstrap;
