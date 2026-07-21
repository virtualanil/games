export function checkCollision(x1, y1, x2, y2, radius) {
    return Math.hypot(x1 - x2, y1 - y2) < radius;
}
