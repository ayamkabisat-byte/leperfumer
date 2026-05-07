// The main function: generate a random perfume recipe
export const getRandomRecipe = (
  counts: { top: number; mid: number; base: number },
  includeSynth: { top: boolean; mid: boolean; base: boolean }
): Recipe => {
  const poolTop = includeSynth.top ? [...DATABASE.top, ...DATABASE.synthetic] : DATABASE.top;
  const poolMid = includeSynth.mid ? [...DATABASE.mid, ...DATABASE.synthetic] : DATABASE.mid;
  const poolBase = includeSynth.base ? [...DATABASE.base, ...DATABASE.synthetic] : DATABASE.base;

  const selectedTop = getRandomItems(poolTop, counts.top);
  const selectedMid = getRandomItems(poolMid, counts.mid);
  const selectedBase = getRandomItems(poolBase, counts.base);

  // Generate a fancy name from the first word of a random mid or base note
  const mainEntity = getRandomItems([...selectedMid, ...selectedBase], 1)[0].name.split(' ')[0];
  const prefix = getRandomItems(PREFIXES, 1)[0];

  return {
    name: `${prefix} ${mainEntity}`,
    top: selectedTop,
    mid: selectedMid,
    base: selectedBase,
  };
};

// ============================================
// 2. EXPORTS UNTUK UI MANUAL SELECTION (LOCK NOTES)
// ============================================

// Export database untuk UI manual selection
export const FULL_DATABASE = DATABASE;

// Generate recipe dengan beberapa note yang sudah dikunci manual
export const getRandomRecipeWithLocks = (
  counts: { top: number; mid: number; base: number },
  includeSynth: { top: boolean; mid: boolean; base: boolean },
  locked: { top: Note[]; mid: Note[]; base: Note[] }
): Recipe => {
  const poolTop  = includeSynth.top  ? [...DATABASE.top,  ...DATABASE.synthetic] : DATABASE.top;
  const poolMid  = includeSynth.mid  ? [...DATABASE.mid,  ...DATABASE.synthetic] : DATABASE.mid;
  const poolBase = includeSynth.base ? [...DATABASE.base, ...DATABASE.synthetic] : DATABASE.base;

  // exclude locked names from random pool
  const excludeNames = (pool: Note[], lockedArr: Note[]) => {
    const names = new Set(lockedArr.map(n => n.name));
    return pool.filter(n => !names.has(n.name));
  };

  const remTop  = Math.max(0, counts.top  - locked.top.length);
  const remMid  = Math.max(0, counts.mid  - locked.mid.length);
  const remBase = Math.max(0, counts.base - locked.base.length);

  const top  = [...locked.top,  ...getRandomItems(excludeNames(poolTop,  locked.top),  remTop)];
  const mid  = [...locked.mid,  ...getRandomItems(excludeNames(poolMid,  locked.mid),  remMid)];
  const base = [...locked.base, ...getRandomItems(excludeNames(poolBase, locked.base), remBase)];

  const seedPool = [...mid, ...base];
  const mainEntity = seedPool.length > 0
    ? getRandomItems(seedPool, 1)[0].name.split(' ')[0]
    : 'Élixir';
  const prefix = getRandomItems(PREFIXES, 1)[0];

  return { name: `${prefix} ${mainEntity}`, top, mid, base };
};