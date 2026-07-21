import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { Star, Shockwave, Particle, Powerup } from './utils.js';
import { AudioSys } from './audio.js';
import { calculateEnemyScore } from './score.js';
import { GAME_SETTINGS } from './settings.js';
import { saveScore, loadLeaderboard } from './leaderboard.js';

export class Game {
    constructor(wordsData) {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.WORDS = wordsData;
        this.state = 'MENU';
        this.stars = [];
        this.resetVariables();
        this.player = new Player(this);
        
        for(let i=0; i<100; i++) this.stars.push(new Star(this.width, this.height));
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        requestAnimationFrame((t) => this.loop(t));
    }

    resetVariables() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.enemies = []; this.bullets = []; this.particles = []; this.shockwaves = []; this.powerups = [];
        this.score = 0; this.combo = 0; this.wordsTyped = 0; this.totalKeystrokes = 0; this.missedKeystrokes = 0;
        this.currentInput = ""; this.activePowerup = null; this.powerupTimer = 0; this.shake = 0;
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth; this.height = this.canvas.height = window.innerHeight;
        if(this.player) { this.player.y = this.height - 80; this.player.x = this.width / 2; }
        this.stars.forEach(s => { s.width = this.width; s.height = this.height; });
    }

    startWithMode(mode) {
        this.difficulty = mode;
        const diffConfig = GAME_SETTINGS[mode];
        this.maxLives = diffConfig.lives; this.difficultyMultiplier = diffConfig.multiplier;
        this.start();
    }

    start() {
        AudioSys.init(); this.resetVariables(); this.lives = this.maxLives;
        this.state = 'PLAYING'; this.startTime = Date.now(); this.lastTime = performance.now();
        this.updateHUD(); this.updateInputDisplay();
        document.getElementById('damageOverlay').style.opacity = 0; document.getElementById('feverOverlay').style.opacity = 0;
        this.spawnEnemy();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED'; this.pauseTime = performance.now();
            document.getElementById('pauseScreen').classList.remove('hidden');
            if (AudioSys.ctx) AudioSys.ctx.suspend();
            if (this.spawnTimer) { clearTimeout(this.spawnTimer); this.spawnTimer = null; }
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING'; document.getElementById('pauseScreen').classList.add('hidden');
            this.lastTime += (performance.now() - this.pauseTime);
            if (AudioSys.ctx) AudioSys.ctx.resume();
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        if (this.state !== 'PLAYING') return;
        const wordsArr = this.WORDS[this.difficulty === 'easy' ? (Math.random() > 0.3 ? 'short' : 'medium') : (this.difficulty === 'hard' ? (Math.random() > 0.5 ? 'medium' : 'long') : (Math.random() > 0.3 ? 'long' : 'medium'))];
        const word = wordsArr[Math.floor(Math.random() * wordsArr.length)];
        const x = Math.random() * (this.width - 150) + 75;
        const type = (this.difficulty !== 'easy' && Math.random() > 0.7) ? 'ARMORED' : 'NORMAL';
        const speed = (Math.random() * 0.5 + 0.5) * this.difficultyMultiplier;
        
        this.enemies.push(new Enemy(x, -50, word, speed, type));
        if (this.difficulty !== 'expert' && Math.random() > 0.95 && this.powerups.length < 2) {
            this.powerups.push(new Powerup(Math.random() * (this.width - 150) + 75, -50, ['shield', 'slowtime', 'multikill'][Math.floor(Math.random() * 3)]));
        }
        
        let nextSpawn = Math.max(800, 2000 - (this.difficultyMultiplier * 200));
        if (this.difficulty === 'expert') nextSpawn = Math.max(600, nextSpawn - 300);
        this.spawnTimer = setTimeout(() => this.spawnEnemy(), nextSpawn);
    }

    handleInput(e) {
        if (this.state !== 'PLAYING' || e.key.length !== 1 || !/[a-z]/.test(e.key.toLowerCase())) return;
        this.totalKeystrokes++;
        const key = e.key.toLowerCase(); const prospectiveInput = this.currentInput + key;
        const matches = this.enemies.filter(enemy => enemy.word.startsWith(prospectiveInput));
        
        if (matches.length > 0) {
            const exact = matches.filter(en => en.word === prospectiveInput);
            if (exact.length > 0) {
                exact.forEach(en => this.destroyEnemy(en));
                this.currentInput = matches.filter(en => en.word !== prospectiveInput).length > 0 ? prospectiveInput : "";
            } else {
                this.currentInput = prospectiveInput; AudioSys.playKeystroke();
                matches.forEach(m => { this.bullets.push(new Bullet(this.player.x, this.player.y - 40, m.x, m.y)); AudioSys.playShoot(); });
            }
        } else {
            this.missedKeystrokes++; this.combo = 0; this.currentInput = ""; AudioSys.playError(); this.shake = 3;
        }
        this.updateHUD(); this.updateInputDisplay();
    }

    destroyEnemy(enemy) {
        this.score += calculateEnemyScore(this.combo, enemy.type === 'ARMORED', this.activePowerup);
        this.combo++; this.wordsTyped++;
        this.difficultyMultiplier += (this.difficulty === 'expert' ? 0.02 : 0.01);
        AudioSys.playExplosion();
        const color = enemy.type === 'ARMORED' ? 'rgb(255, 170, 0)' : 'rgb(0, 243, 255)';
        for (let i = 0; i < (this.activePowerup === 'multikill' ? 30 : 20); i++) this.particles.push(new Particle(enemy.x, enemy.y, color));
        this.shockwaves.push(new Shockwave(enemy.x, enemy.y, color));
        this.shake = 5; this.enemies = this.enemies.filter(e => e !== enemy);
        this.updateHUD(); this.animateCombo();
    }

    loseLife() {
        if (this.activePowerup === 'shield') {
            this.activePowerup = null; document.getElementById('powerupDisplay').classList.remove('active'); AudioSys.playShieldHit();
            for (let i = 0; i < 20; i++) this.particles.push(new Particle(this.player.x, this.player.y, 'rgb(0, 243, 255)'));
            this.shake = 8; const ov = document.getElementById('damageOverlay'); ov.style.background = 'radial-gradient(circle, transparent 50%, rgba(0, 243, 255, 0.6) 100%)'; ov.style.opacity = 1; setTimeout(() => ov.style.opacity = 0, 100);
        } else {
            this.lives--; this.updateHUD(); AudioSys.playExplosion();
            for (let i = 0; i < 20; i++) this.particles.push(new Particle(this.player.x, this.player.y, 'rgb(255, 0, 85)'));
            this.shake = 15; const ov = document.getElementById('damageOverlay'); ov.style.opacity = 1; setTimeout(() => ov.style.opacity = 0, 200);
            if (this.lives <= 0) this.gameOver();
        }
    }

    updateInputDisplay() {
        const el = document.getElementById('inputBufferDisplay');
        if (!this.currentInput) { el.style.opacity = 0; } 
        else { el.style.opacity = 0.9; el.innerHTML = this.currentInput; el.style.transform = "translateX(-50%) scale(1.1)"; setTimeout(() => el.style.transform = "translateX(-50%) scale(1)", 50); }
    }

    animateCombo() {
        const el = document.getElementById('comboDisplay');
        el.innerText = `COMBO x${this.combo}`; el.style.opacity = 1; el.style.transform = "translateX(-50%) scale(1.5)";
        el.style.color = this.combo > 10 ? 'var(--primary)' : 'var(--success)';
        document.getElementById('feverOverlay').style.opacity = this.combo > 10 ? 1 : 0;
        setTimeout(() => { el.style.transform = "translateX(-50%) scale(1)"; el.style.opacity = this.combo > 1 ? 1 : 0; }, 100);
    }

    updateHUD() {
        document.getElementById('scoreDisplay').innerText = this.score; document.getElementById('livesDisplay').innerText = this.lives;
        const elapsedMin = (Date.now() - this.startTime) / 60000;
        document.getElementById('wpmDisplay').innerText = elapsedMin > 0 ? Math.floor(this.wordsTyped / elapsedMin) : 0;
    }

    async gameOver() {
        this.state = 'GAMEOVER'; if (this.spawnTimer) { clearTimeout(this.spawnTimer); this.spawnTimer = null; }
        const elapsedMin = (Date.now() - this.startTime) / 60000;
        const finalWpm = elapsedMin > 0 ? Math.floor(this.wordsTyped / elapsedMin) : 0;
        const accuracy = this.totalKeystrokes > 0 ? Math.floor(((this.totalKeystrokes - this.missedKeystrokes) / this.totalKeystrokes) * 100) : 0;
        document.getElementById('finalScore').innerText = this.score; document.getElementById('finalWpm').innerText = finalWpm; document.getElementById('finalAcc').innerText = accuracy + '%'; document.getElementById('finalWords').innerText = this.wordsTyped;
        document.getElementById('gameOverModeBadge').className = `difficulty-badge ${this.difficulty}`; document.getElementById('gameOverModeBadge').textContent = `${this.difficulty.toUpperCase()} MODE`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        await saveScore(this.score, finalWpm, this.difficulty);
        loadLeaderboard('leaderboard-list', this.difficulty);
    }

    loop(timestamp) {
        let dt = (timestamp - this.lastTime) / 1000; if (dt > 0.1) dt = 0.1; this.lastTime = timestamp;
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.6)'; this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.save();
        if (this.shake > 0) { this.ctx.translate((Math.random()-0.5)*this.shake, (Math.random()-0.5)*this.shake); this.shake *= 0.9; if(this.shake<0.5) this.shake=0; }
        
        const timeScale = this.activePowerup === 'slowtime' ? 0.5 : 1;
        this.stars.forEach(s => { s.update(dt, this.state === 'PLAYING' ? (timeScale===0.5 ? 2 : 5) : 0.5); s.draw(this.ctx); });

        if (this.state === 'PLAYING') {
            if (this.activePowerup) {
                this.powerupTimer -= dt;
                if (this.powerupTimer <= 0) { this.activePowerup = null; document.getElementById('powerupDisplay').classList.remove('active'); }
            }
            this.player.update(dt); this.player.draw(this.ctx);
            const activeMatches = this.enemies.filter(e => this.currentInput.length > 0 && e.word.startsWith(this.currentInput));
            
            this.enemies.forEach((enemy, index) => {
                enemy.update(dt * timeScale);
                enemy.draw(this.ctx, this.currentInput, activeMatches.includes(enemy), activeMatches.includes(enemy) && activeMatches.length === 1);
                if (enemy.y > this.height - 50) { this.enemies.splice(index, 1); this.loseLife(); }
            });
            this.powerups.forEach((p, i) => {
                p.update(dt * timeScale); p.draw(this.ctx);
                if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 40) {
                    this.activePowerup = p.type; this.powerupTimer = 10;
                    const d = document.getElementById('powerupDisplay'); d.classList.add('active'); AudioSys.playPowerup();
                    if(p.type === 'shield') { d.textContent = '🛡️ SHIELD ACTIVE'; d.style.borderColor = 'var(--primary)'; }
                    else if(p.type === 'slowtime') { d.textContent = '⏰ SLOW MOTION'; d.style.borderColor = 'var(--warning)'; }
                    else { d.textContent = '⚡ DOUBLE POINTS'; d.style.borderColor = 'var(--danger)'; }
                    this.powerups.splice(i, 1);
                }
                if (p.y > this.height) this.powerups.splice(i, 1);
            });
            this.bullets.forEach((b, i) => { b.update(dt); b.draw(this.ctx); if(b.life <= 0) this.bullets.splice(i, 1); });
            this.particles.forEach((p, i) => { p.update(dt); p.draw(this.ctx); if(p.life <= 0) this.particles.splice(i, 1); });
            this.shockwaves.forEach((s, i) => { s.update(dt); s.draw(this.ctx); if(s.opacity <= 0) this.shockwaves.splice(i, 1); });
            
            if (activeMatches.length > 0) {
                activeMatches.forEach(target => {
                    this.ctx.beginPath(); this.ctx.moveTo(this.player.x, this.player.y - 20); this.ctx.lineTo(target.x, target.y);
                    this.ctx.strokeStyle = activeMatches.length === 1 ? 'rgba(0, 243, 255, 0.6)' : 'rgba(0, 243, 255, 0.2)';
                    this.ctx.lineWidth = 1; this.ctx.setLineDash([5, 5]); this.ctx.stroke(); this.ctx.setLineDash([]);
                });
            }
        } else if (this.state !== 'MENU') {
            this.player.draw(this.ctx); this.enemies.forEach(e => e.draw(this.ctx, this.currentInput, false, false));
            this.powerups.forEach(p => p.draw(this.ctx)); this.bullets.forEach(b => b.draw(this.ctx));
            this.particles.forEach(p => p.draw(this.ctx)); this.shockwaves.forEach(s => s.draw(this.ctx));
        }
        this.ctx.restore();
        requestAnimationFrame((t) => this.loop(t));
    }
}
