import { checkCollision } from './collision.js';

export class Bullet {
    constructor(sx, sy, tx, ty) {
        this.x = sx; this.y = sy; this.tx = tx; this.ty = ty; this.speed = 1500; 
        const angle = Math.atan2(ty - sy, tx - sx);
        this.vx = Math.cos(angle) * this.speed; this.vy = Math.sin(angle) * this.speed; this.life = 1.0;
    }
    update(dt) {
        this.x += this.vx * dt; this.y += this.vy * dt;
        if (checkCollision(this.x, this.y, this.tx, this.ty, 50)) this.life = 0; 
    }
    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.shadowBlur = 10; ctx.shadowColor = '#00f3ff'; ctx.fillStyle = '#ccfbff';
        ctx.beginPath(); ctx.rect(-15, -2, 30, 4); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.rect(-15, -2, 10, 4); ctx.fill();
        ctx.restore();
    }
}
