import { FULL_DATABASE, PREFIXES, type Note, type Recipe } from './perfumeDB';
import { DATABASE_RESEARCH_VERSION, mergeNoteExpansion } from './perfumeDBExpansion';

export type Layer = 'top' | 'mid' | 'base';

const EXPERIMENTAL_CATEGORIES = new Set(['syntheticWeird', 'beverages']);

/**
 * Compatibility bridge while the legacy monolithic perfumeDB is being split up.
 * app/page.tsx imports FULL_DATABASE directly for NotePicker, so mutate that shared
 * array once at module initialization. Both picker and generator then use exactly
 * the same researched/deduplicated catalogue.
 */
export const PERFUME_DATABASE = mergeNoteExpansion(FULL_DATABASE);
FULL_DATABASE.splice(0, FULL_DATABASE.length, ...PERFUME_DATABASE);
export { DATABASE_RESEARCH_VERSION };

export const categoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    citrus: 'Citrus',
    greens: 'Green & Aromatic',
    flowers: 'Floral',
    whiteFlowers: 'White Floral',
    fruits: 'Fruit',
    spices: 'Spice & Botanical',
    sweets: 'Gourmand',
    woods: 'Wood',
    resins: 'Resin & Amber',
    musk: 'Musk & Animalic',
    beverages: 'Beverage',
    syntheticWeird: 'Synthetic & Experimental',
    uncategorized: 'Unclassified',
    Custom: 'Custom',
  };
  return labels[category] ?? category;
};

export const isExperimentalNote = (note: Note) => EXPERIMENTAL_CATEGORIES.has(note.cat);

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const uniqueByName = (notes: Note[]) => {
  const seen = new Set<string>();
  return notes.filter((note) => {
    const key = note.name.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const poolFor = (layer: Layer, includeExperimental: boolean, excluded: Set<string>) =>
  uniqueByName(PERFUME_DATABASE).filter((note) => {
    if (!note.layers.includes(layer)) return false;
    if (!includeExperimental && isExperimentalNote(note)) return false;
    return !excluded.has(note.name.toLocaleLowerCase());
  });

export const getRandomRecipeWithLocks = (
  counts: Record<Layer, number>,
  includeExperimental: Record<Layer, boolean>,
  locked: Record<Layer, Note[]>,
): Recipe => {
  const globallyReserved = new Set(
    [...locked.top, ...locked.mid, ...locked.base].map((note) => note.name.toLocaleLowerCase()),
  );

  const fillLayer = (layer: Layer) => {
    const fixed = uniqueByName(locked[layer]).slice(0, counts[layer]);
    const needed = Math.max(0, counts[layer] - fixed.length);
    const pool = poolFor(layer, includeExperimental[layer], globallyReserved);
    const picked = shuffle(pool).slice(0, needed);
    picked.forEach((note) => globallyReserved.add(note.name.toLocaleLowerCase()));
    return [...fixed, ...picked];
  };

  const top = fillLayer('top');
  const mid = fillLayer('mid');
  const base = fillLayer('base');
  const seedPool = [...mid, ...base, ...top];
  const entity = seedPool.length ? shuffle(seedPool)[0].name.split(' ')[0] : 'Élixir';
  const prefix = shuffle(PREFIXES)[0] ?? 'Atelier';

  return { name: `${prefix} ${entity}`, top, mid, base };
};
