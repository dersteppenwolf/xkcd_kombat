function chooseAIAction({ dist, health, energy, onGround, opponentAttacking, canPunch, canKick, difficulty, rand }) {
    if (opponentAttacking && dist < 170 && onGround) {
        return 'block';
    }

    if (health <= 30 && dist < 190) {
        return rand < 0.7 ? 'retreat' : 'block';
    }

    if (dist > 250) {
        return rand < difficulty.approachLong ? 'approach' : 'idle';
    }

    if (dist > 110) {
        if (rand < difficulty.approachMid) return 'approach';
        if (rand < difficulty.retreatMid) return 'retreat';
        if (rand < difficulty.jumpMid && onGround) return 'jump';
        return 'block';
    }

    if (energy >= SPECIAL_ENERGY_COST && (canPunch || canKick) && rand < 0.18) return 'special';
    if (canPunch && rand < difficulty.punchClose) return 'punch';
    if (canKick && rand < difficulty.kickClose) return 'kick';
    if (rand < difficulty.blockClose) return 'block';
    return canPunch || canKick ? 'retreat' : 'approach';
}
