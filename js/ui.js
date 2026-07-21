import { loadLeaderboard } from './leaderboard.js';

export function setupUI(gameInstance) {
    document.getElementById('modeSelectBtn').addEventListener('click', () => {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('modeSelectScreen').classList.remove('hidden');
    });

    document.getElementById('backToStartBtn').addEventListener('click', () => {
        document.getElementById('modeSelectScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    });

    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            document.getElementById('modeSelectScreen').classList.add('hidden');
            gameInstance.startWithMode(mode);
        });
    });

    document.getElementById('openLeaderboardBtn').addEventListener('click', () => {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('leaderboardMenuScreen').classList.remove('hidden');
        switchLeaderboard('easy');
    });

    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
        document.getElementById('leaderboardMenuScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    });

    document.querySelectorAll('.lb-filter').forEach(btn => {
        btn.addEventListener('click', (e) => switchLeaderboard(e.target.dataset.mode));
    });

    function switchLeaderboard(mode) {
        const badge = document.getElementById('leaderboardModeBadge');
        badge.className = `difficulty-badge ${mode}`;
        badge.textContent = `${mode.toUpperCase()} MODE`;
        loadLeaderboard('leaderboard-list-start', mode);
    }

    document.getElementById('resumeBtn').addEventListener('click', () => gameInstance.togglePause());
    
    document.getElementById('quitBtn').addEventListener('click', () => {
        gameInstance.state = 'MENU';
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    });

    document.getElementById('restartBtn').addEventListener('click', () => gameInstance.start());
    document.getElementById('mainMenuBtn').addEventListener('click', () => {
        gameInstance.state = 'MENU';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') gameInstance.togglePause();
    });
}
