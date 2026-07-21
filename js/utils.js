export class Star {
    constructor(width, height) { this.width = width; this.height = height; this.reset(); this.y = Math.random() * height; }
    reset() { this.x = Math.random() * this.width; this.y = -10; this.z = Math.random() * 2 + 0.5; this.size = Math.random() * 2; this.opacity = Math.random() * 0.5 + 0.1; this.speed = this.z * 0.5; }
    update(dt, speedMultiplier) { this.y += this.speed * speedMultiplier * 60 * dt; if (this.y > this.height) this.reset(); }
    draw(ctx) { ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}
export class Shockwave {
    constructor(x, y, color) { this.x = x; this.y = y; this.color = color; this.radius = 10; this.opacity = 1; this.lineWidth = 5; }
    update(dt) { this.radius += 100 * dt; this.opacity -= 2 * dt; this.lineWidth -= 5 * dt; }
    draw(ctx) { if (this.opacity <= 0) return; ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.strokeStyle = this.color.replace(')', `, ${this.opacity})`).replace('rgb', 'rgba'); ctx.lineWidth = Math.max(0.1, this.lineWidth); ctx.stroke(); ctx.restore(); }
}
export class Particle {
    constructor(x, y, color) { this.x = x; this.y = y; this.color = color; const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 200 + 50; this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.life = 1.0; this.decay = Math.random() * 0.03 + 0.01; this.gravity = 100; }
    update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.vy += this.gravity * dt; this.life -= this.decay; }
    draw(ctx) { ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
}
export class Powerup {
    constructor(x, y, type) { this.x = x; this.y = y; this.type = type; this.speed = 1; this.wobble = 0; }
    update(dt) { this.y += this.speed; this.wobble += dt * 3; }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y + Math.sin(this.wobble) * 10);
        let color, symbol;
        if(this.type === 'shield') { color = '#00f3ff'; symbol = '🛡️'; }
        else if(this.type === 'slowtime') { color = '#ffaa00'; symbol = '⏰'; }
        else { color = '#ff0055'; symbol = '⚡'; }
        ctx.shadowBlur = 20; ctx.shadowColor = color; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = '24px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(symbol, 0, 0);
        ctx.restore();
    }
}
