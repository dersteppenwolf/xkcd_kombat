function chooseAIAction({
    dist,
    health,
    energy,
    onGround,
    opponentAttacking,
    canPunch,
    canKick,
    canSpecial = false,
    attackCooldown = 0,
    opponentHealth = 100,
    x = 0,
    opponentX = 0,
    nearLeftWall = false,
    nearRightWall = false,
    difficulty,
    rand
}) {
    const canAttack = attackCooldown <= 0;
    const punchReady = canAttack && canPunch;
    const kickReady = canAttack && canKick;
    const specialReady = canAttack && canSpecial && energy >= SPECIAL_ENERGY_COST;
    const retreatBlocked = (x < opponentX && nearLeftWall) || (x > opponentX && nearRightWall);

    if (opponentAttacking && dist < 170 && onGround && rand < (difficulty.blockReaction ?? 1)) {
        return 'block';
    }

    if (specialReady && (opponentHealth <= ATTACKS.special.damage || rand < (difficulty.specialChance ?? 0.18))) return 'special';

    if (health <= 30 && dist < 190) {
        if (!retreatBlocked && rand < (difficulty.lowHealthRetreat ?? 0.7)) return 'retreat';
        return 'block';
    }

    if (dist > 250) {
        return rand < difficulty.approachLong ? 'approach' : 'idle';
    }

    if (dist > 110) {
        if (kickReady && rand < (difficulty.kickMid ?? 0)) return 'kick';
        if (rand < difficulty.approachMid) return 'approach';
        if (!retreatBlocked && rand < difficulty.retreatMid) return 'retreat';
        if (rand < difficulty.jumpMid && onGround) return 'jump';
        return 'block';
    }

    if (kickReady && dist > ATTACKS.punch.range && rand < difficulty.kickClose) return 'kick';
    if (punchReady && rand < difficulty.punchClose) return 'punch';
    if (kickReady && rand < difficulty.kickClose) return 'kick';
    if (rand < difficulty.blockClose) return 'block';
    if (retreatBlocked) return onGround && rand < (difficulty.cornerJump ?? 0.45) ? 'jump' : 'block';
    return punchReady || kickReady ? 'retreat' : 'approach';
}
