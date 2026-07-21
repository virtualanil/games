export class Player {
    constructor(game) { this.game = game; this.x = game.width / 2; this.y = game.height - 80; this.width = 50; this.height = 50; }
    update(dt) { this.y = this.game.height - 80 + Math.sin(Date.now() / 500) * 5; }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y);
        if (this.game.activePowerup === 'shield') {
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.6)'; ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = 'var(--primary)';
            ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(0, 243, 255, 0.5)'; ctx.fillStyle = '#0a1a2a';
        ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(20, 10); ctx.lineTo(30, 20); ctx.lineTo(-30, 20); ctx.lineTo(-20, 10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#00f3ff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#00f3ff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 20; ctx.shadowColor = '#00f3ff'; ctx.fillStyle = 'rgba(0, 243, 255, 0.8)';
        ctx.beginPath(); ctx.moveTo(-10, 20); ctx.lineTo(0, 35 + Math.random() * 10); ctx.lineTo(10, 20); ctx.fill();
        ctx.restore();
    }
}
