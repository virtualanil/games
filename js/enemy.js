export class Enemy {
    constructor(x, y, word, speed, type) { this.x = x; this.y = y; this.word = word; this.type = type; this.speed = speed; this.wobbleOffset = Math.random() * Math.PI * 2; }
    update(dt) { this.y += this.speed; this.wobbleOffset += dt * 2; }
    draw(ctx, inputBuffer, isMatch, isLocked) {
        ctx.save(); ctx.translate(this.x + (Math.sin(this.wobbleOffset) * 5), this.y);
        let baseColor = this.type === 'ARMORED' ? '#ffaa00' : '#ffffff';
        if (isMatch) { baseColor = isLocked ? '#ff0055' : '#00f3ff'; }
        ctx.shadowBlur = isMatch ? 20 : 10; ctx.shadowColor = baseColor;
        ctx.strokeStyle = baseColor; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        if (this.type === 'ARMORED') { ctx.moveTo(0, 20); ctx.lineTo(15, -10); ctx.lineTo(25, 0); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.lineTo(-25, 0); ctx.lineTo(-15, -10); } 
        else { ctx.moveTo(0, 25); ctx.lineTo(10, -5); ctx.lineTo(20, -10); ctx.lineTo(0, -5); ctx.lineTo(-20, -10); ctx.lineTo(-10, -5); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        
        if (isLocked) {
            ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 5, 35, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#ff0055'; ctx.beginPath(); ctx.moveTo(-5, 40); ctx.lineTo(5, 40); ctx.lineTo(0, 50); ctx.fill();
        }
        ctx.shadowBlur = 0; ctx.font = 'bold 20px "Roboto Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const matchIndex = inputBuffer.length; const typedPart = this.word.substring(0, matchIndex); const remainPart = this.word.substring(matchIndex);
        const totalWidth = ctx.measureText(this.word).width; const startX = -totalWidth / 2;

        if (isMatch && matchIndex > 0) {
            ctx.fillStyle = 'rgba(0, 255, 102, 0.9)'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ff66';
            ctx.fillText(typedPart, startX + ctx.measureText(typedPart).width/2, -30); ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = (!isMatch && matchIndex > 0) ? '#555' : '#fff';
            ctx.fillText(this.word, startX + totalWidth/2, -30);
        }
        if (isMatch && remainPart.length > 0) {
            ctx.fillStyle = isLocked ? '#ff0055' : '#fff';
            ctx.fillText(remainPart, startX + ctx.measureText(typedPart).width + ctx.measureText(remainPart).width/2, -30);
        }
        ctx.restore();
    }
}
