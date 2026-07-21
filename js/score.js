export function calculateEnemyScore(combo, isArmored, activePowerup) {
    let points = 10 * (1 + Math.floor(combo / 5)) * (isArmored ? 2 : 1);
    if (activePowerup === 'multikill') points *= 2;
    return points;
}
