import re

with open(r'src\logic\useGameLoop.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ── Change 1: Remove Stage 6 full heal + stage clear heal ──
old1 = '''            // v2.0.0.14/16: Stage 6 Reward (Chapter 1 Only: difficulty-based MAX HP bonus + FULL HEAL)
            if (store.chapterNum === '1' && stageNum === 6) {
                const bonus = Math.floor(maxHp * config.stage6MaxHpBonus);
                maxHp += bonus;
                store.setHasStage6Bonus(true);
                store.setPlayerMaxHp(maxHp);
                setPlayerHp(maxHp); // FULL HEAL per user request
            } else if (!isFinalBoss) {
                // Stage Clear Heal: \ub9ac\uc2a4\ud2b8 \uc77c\uc0c1 \ud68c\ubcf5\ub7c9 (NORMAL \uae30\uc900)
                // Ch1=40, Ch2=30, Ch3=20 (EASY \xd71.5, HARD/HELL \xd70.8)
                const chapterHealBase: Record<string, number> = {
                    '1': 40, '2A': 30, '2B': 30, '3A': 20, '3B': 20
                };
                const diffMultiplier = store.difficulty === Difficulty.EASY ? 1.5
                    : (store.difficulty === Difficulty.HARD || store.difficulty === Difficulty.HELL) ? 0.8
                    : 1.0;
                const baseHeal = chapterHealBase[store.chapterNum] ?? 30;
                const healAmount = Math.floor(baseHeal * diffMultiplier);
                const newHp = Math.min(maxHp, currentHp + healAmount);
                setPlayerHp(newHp);
            }'''

new1 = '''            // v3.0: Stage 6 Max HP Bonus (Chapter 1 only) - no heal, bonus only
            if (store.chapterNum === '1' && stageNum === 6) {
                const bonus = Math.floor(maxHp * config.stage6MaxHpBonus);
                maxHp += bonus;
                store.setHasStage6Bonus(true);
                store.setPlayerMaxHp(maxHp);
                // HP heal removed - healing only at rest nodes (v3.0)
            }
            // v3.0: No post-battle HP heal (replaced by rest node system)'''

if old1 in content:
    content = content.replace(old1, new1, 1)
    print('Change 1 applied: Stage clear heal removed')
else:
    # Try with garbled Korean
    print('Change 1: Exact match failed, trying line-based approach')
    lines = content.split('\n')
    start = -1
    end = -1
    for i, line in enumerate(lines):
        if 'v2.0.0.14/16: Stage 6 Reward' in line:
            start = i
        if start >= 0 and i > start and line.strip() == '}' and end == -1:
            # Find the closing brace of the else block
            # Count depth
            depth = 0
            for j in range(start, i+1):
                depth += lines[j].count('{') - lines[j].count('}')
            if depth == 0:
                end = i
                break
    if start >= 0 and end >= 0:
        lines[start:end+1] = new1.split('\n')
        content = '\n'.join(lines)
        print(f'Change 1 applied via line approach: lines {start}-{end}')
    else:
        print(f'Change 1 FAILED: start={start}, end={end}')

# ── Change 2: Remove final boss +200 HP transition heal ──
# Find and remove the isFinalBoss heal block
pattern2 = r'            // \S.*?[Hh]eal.*?\+200.*?\n            if \(isFinalBoss\) \{[^}]+\}\n'
match2 = re.search(pattern2, content, re.DOTALL)
if match2:
    content = content[:match2.start()] + '            // v3.0: Chapter transition HP heal removed (rest nodes only)\n' + content[match2.end():]
    print('Change 2 applied: Final boss +200 HP heal removed')
else:
    # Try direct string search
    old2_search = 'if (isFinalBoss) {\n                const freshPlayer = useGameStore.getState().player;\n                const transitionHeal = 200;'
    if old2_search in content:
        # Find the block boundaries
        idx = content.find(old2_search)
        # Find the closing brace
        open_br = content.find('{', idx)
        depth = 0
        end_idx = open_br
        for i in range(open_br, min(open_br + 500, len(content))):
            if content[i] == '{':
                depth += 1
            elif content[i] == '}':
                depth -= 1
                if depth == 0:
                    end_idx = i + 1
                    break
        # Also find comment line before
        line_start = content.rfind('\n', 0, idx) + 1
        block = content[line_start:end_idx]
        content = content[:line_start] + '            // v3.0: Chapter transition HP heal removed (rest nodes only)\n' + content[end_idx+1:]
        print('Change 2 applied (manual): Final boss +200 HP heal removed')
    else:
        print('Change 2 FAILED: isFinalBoss block not found')

# ── Change 3: Replace auto-progression with returnToStageMap ──
old3_marker = '        // 5. Transition to next stage or unlock difficulty on final stage clear'
new3_end_marker = '    };\n\n    const startInitialDraw'

if old3_marker in content:
    start_idx = content.find(old3_marker)
    end_idx = content.find(new3_end_marker)
    if end_idx > start_idx:
        new3 = '''        // 5. v3.0: Return to Stage Map after victory
        // Mark current node as completed
        const currentNodeId = store.stageMapProgress?.currentNodeId;
        if (currentNodeId) {
            store.completeMapNode(currentNodeId);
        }

        // Difficulty unlock on final boss clear
        if (stageNum >= 10) {
            if (store.chapterNum === '1' && store.difficulty === Difficulty.EASY) {
                store.unlockDifficulty(Difficulty.NORMAL);
                store.setClearPopupDifficulty(Difficulty.EASY);
            } else if (store.chapterNum === '3A' || store.chapterNum === '3B') {
                if (store.difficulty === Difficulty.NORMAL) {
                    store.unlockDifficulty(Difficulty.HARD);
                    store.setClearPopupDifficulty(Difficulty.NORMAL);
                } else if (store.difficulty === Difficulty.HARD) {
                    store.unlockDifficulty(Difficulty.HELL);
                    store.setClearPopupDifficulty(Difficulty.HARD);
                } else if (store.difficulty === Difficulty.HELL) {
                    store.setClearPopupDifficulty(Difficulty.HELL);
                }
            }
        }

        // Return to stage map (fade transition)
        triggerTransition(() => {
            setMessage("");
            store.returnToStageMap();
        });
    '''
        content = content[:start_idx] + new3 + content[end_idx:]
        print('Change 3 applied: Auto-progression replaced with returnToStageMap')
    else:
        print(f'Change 3 FAILED: end marker not found after start_idx={start_idx}')
else:
    print('Change 3 FAILED: start marker not found')

with open(r'src\logic\useGameLoop.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('File saved.')
