import type { Note } from './perfumeDB';

type Layer = Note['layers'][number];
export type NoteKind = 'natural' | 'extract' | 'regional' | 'molecule' | 'accord' | 'fantasy';

export interface NoteMetadata {
  parent?: string;
  kind: NoteKind;
  profile?: string;
  aliases?: string[];
  source?: 'Fragrantica' | 'The Good Scents Company' | 'Eden Botanicals' | 'Curated perfumery vocabulary';
}

const group = (cat: string, layers: Layer[], names: string[]): Note[] =>
  names.map((name) => ({ name, cat, layers }));

/**
 * Curated 2026 expansion.
 *
 * The legacy list is broad but behaves like a flat note directory. This layer adds:
 * - notes present in newer public note directories,
 * - meaningful botanical/origin/extraction variants,
 * - common professional aroma materials,
 * - better layer placement for materials that were previously lumped into one bucket.
 *
 * We intentionally do not mirror any one catalogue wholesale. A formula generator benefits
 * more from useful distinctions (e.g. Vanilla Absolute vs Ethyl Vanillin) than thousands of
 * near-duplicate novelty labels.
 */
export const CURATED_NOTE_EXPANSION: Note[] = [
  ...group('citrus', ['top'], [
    'Black Lemon', 'Kabosu', 'Murcott', 'Bergamot Peel', 'Mandarin Peel',
    'Sweet Orange Peel', 'Yuzu Peel', 'Lime Peel', 'Lemon Peel',
  ]),

  ...group('fruits', ['top', 'mid'], [
    'Banana Peel', 'Calafate', 'Fruity Powder', 'Green Banana', 'Guava Nectar',
    'Maqui Berry', 'Nalca', 'Pine Nuts', 'Quenepa', 'Radish', 'Black Fig',
    'White Peach', 'Yellow Peach', 'Green Mango', 'Red Grape', 'Muscat Grape',
  ]),

  ...group('greens', ['top', 'mid'], [
    'Achillea Olympus', 'Culantro', 'Forest Foliage', 'Hojicha', 'Olymra Plant Accord',
    'Phoenix Dan Cong Oolong', 'Powdered Leaf', 'Samphire', 'Strawberry Gum',
    'Terebinth Tree', 'Black Tea Absolute', 'Green Tea Absolute', 'Mate Absolute',
    'Tobacco Leaf Absolute', 'Violet Leaf Absolute',
  ]),

  ...group('flowers', ['mid'], [
    'Blue Pea Flower', 'Bouvardia', 'Canna Flower', 'Coriander Flower', 'Corydalis',
    'Garlic Blossom', 'Green Petals', 'Kanzan Cherry', 'Madonna Lily', 'Orange Jasmine',
    'Osmanthus Milk', 'Vervain', 'Magnolia Absolute', 'Osmanthus Absolute',
    'Narcissus Absolute', 'Violet Flower Absolute',
  ]),

  ...group('whiteFlowers', ['mid'], [
    'Jasmine Grandiflorum', 'Jasmine Sambac', 'Arabian Jasmine', 'Jasmine Absolute',
    'Jasmine Grandiflorum Absolute', 'Jasmine Sambac Absolute', 'Jasmine CO2 Extract',
    'Jasmine Auriculatum', 'Tuberose Absolute', 'Orange Blossom Absolute',
    'Neroli Essential Oil', 'Ylang-Ylang Extra', 'Ylang-Ylang Complete',
    'Gardenia Accord', 'Tiare Absolute',
  ]),

  ...group('flowers', ['mid'], [
    'Damask Rose', 'Rosa Damascena', 'Rose de Mai', 'Centifolia Rose', 'May Rose',
    'Rose Otto', 'Rose Absolute', 'Bulgarian Rose', 'Turkish Rose', 'Moroccan Rose',
    'Grasse Rose', 'Taif Rose', 'Damask Rose Absolute', 'Centifolia Rose Absolute',
    'Rose CO2 Extract',
  ]),

  // Vanilla: species, origin and extraction are kept separate because they smell materially different.
  ...group('spices', ['base'], [
    'Vanilla Bean', 'Vanilla Planifolia', 'Madagascar Vanilla', 'Madagascar Bourbon Vanilla',
    'Bourbon Vanilla', 'Tahitian Vanilla', 'Vanilla Tahitensis', 'Mexican Vanilla',
    'Indonesian Vanilla', 'Ugandan Vanilla', 'Vanilla Pompona', 'Vanilla Absolute',
    'Madagascar Vanilla Absolute', 'Vanilla Tahitensis Absolute', 'Vanilla CO2 Extract',
    'Vanilla Tahitensis CO2 Extract', 'Vanilla Tincture', 'Bourbon Vanilla Tincture',
    'Vanilla Planifolia Infusion', 'Vanilla Extract', 'Vanilla Oleoresin',
    'Bourbon Vanilla Oleoresin', 'Bali Vanilla Oleoresin', 'Vanilla Resinoid',
  ]),

  ...group('sweets', ['base'], [
    'Boba', 'Mochi', 'Oatmilk', 'Ube', 'Salted Egg Yolk', 'Strawberry Yogurt',
    'Sugar Cookie', 'Vanilla Caviar', 'Vanilla Macaroon', 'Vanilla Sauce',
    'Vanilla Custard Accord', 'Vanilla Cream Accord', 'Vanilla Sugar Accord',
    'Toasted Vanilla Accord', 'Burnt Vanilla Accord', 'Vanilla Marshmallow Accord',
  ]),

  ...group('woods', ['base'], [
    'Patchouli Heart', 'Patchouli CO2 Extract', 'Indonesian Patchouli', 'Green Patchouli',
    'Dark Patchouli', 'Haitian Vetiver', 'Java Vetiver', 'Bourbon Vetiver', 'Vetiver Heart',
    'Vetiver Absolute', 'Santalum Album', 'Indian Sandalwood', 'Mysore Sandalwood',
    'Australian Sandalwood', 'New Caledonian Sandalwood', 'Assam Oud', 'Australian Oud',
    'Cambodian Oud', 'Chinese Oud', 'Indian Oud', 'Indonesian Oud', 'Laotian Oud',
    'Malaysian Oud', 'Thai Oud', 'Trat Oud', 'Vietnamese Oud', 'Borneo Oud',
    'White Oud', 'Oud Butter', 'Oud Sumatra', 'Oud CO2 Extract', 'Cedarwood Atlas',
    'Virginia Cedarwood', 'Texas Cedarwood', 'Hinoki Essential Oil',
  ]),

  ...group('resins', ['base'], [
    'Siam Benzoin', 'Sumatra Benzoin', 'Benzoin Absolute', 'Benzoin Resinoid',
    'Frankincense Carterii', 'Frankincense Sacra', 'Frankincense Serrata',
    'Olibanum Absolute', 'Olibanum Resinoid', 'Myrrh Absolute', 'Myrrh Resinoid',
    'Labdanum Absolute', 'Labdanum Resinoid', 'Elemi Essential Oil',
    'Peru Balsam Absolute', 'Tolu Balsam Absolute', 'Opoponax Resinoid',
  ]),

  // High-volatility aroma materials.
  ...group('syntheticWeird', ['top'], [
    'Aldehyde C-10', 'Aldehyde C-11', 'Aldehyde C-12 MNA', 'cis-3-Hexenol',
    'Linalool', 'Linalyl Acetate', 'Dihydromyrcenol', 'Citral', 'Citronellal',
    'Verdox', 'Calone', 'Floralozone',
  ]),

  // Floral / fruity heart materials.
  ...group('syntheticWeird', ['mid'], [
    'Hedione', 'Hedione HC', 'Methyl Jasmonate', 'Benzyl Acetate', 'Benzyl Salicylate',
    'Hydroxycitronellal', 'Methyl Anthranilate', 'Alpha Ionone', 'Beta Ionone',
    'Methyl Ionone', 'Rose Oxide', 'Damascone', 'Beta Damascone', 'Damascenone',
    'Phenethyl Alcohol', 'Geraniol', 'Citronellol', 'Nerol', 'Helional', 'Melonal',
    'Aquaflora', 'Calypsone', 'Cascalone',
  ]),

  // Long-lasting woods, ambers, musks and gourmand molecules.
  ...group('syntheticWeird', ['base'], [
    'Vanillin', 'Ethyl Vanillin', 'Methyl Vanillate', 'Vanillyl Acetate', 'Vanilla Cresol',
    'Coumarin', 'Heliotropin (Piperonal)', 'Ethyl Maltol', 'Evernyl', 'Iso E Super',
    'Timbersilk', 'Cashmeran', 'Javanol', 'Sandalore', 'Polysantol', 'Cedramber',
    'Norlimbanol', 'Ambroxan', 'Cetalox', 'Ambrofix', 'Amber Xtreme',
    'Ethylene Brassylate', 'Galaxolide', 'Habanolide', 'Helvetolide', 'Ambrettolide',
    'Exaltolide', 'Muscenone', 'Cosmone', 'Serenolide', 'Tonalide',
  ]),
];

export const NOTE_METADATA: Record<string, NoteMetadata> = {
  'Vanilla Bean': { parent: 'Vanilla', kind: 'natural', profile: 'rich pod-like vanilla; balsamic, woody and gently boozy', source: 'The Good Scents Company' },
  'Vanilla Planifolia': { parent: 'Vanilla', kind: 'natural', profile: 'classic warm vanilla species used widely in perfumery', source: 'The Good Scents Company' },
  'Madagascar Vanilla': { parent: 'Vanilla', kind: 'regional', profile: 'dense, sweet, balsamic and rounded', source: 'Eden Botanicals' },
  'Madagascar Bourbon Vanilla': { parent: 'Vanilla', kind: 'regional', profile: 'dark, creamy, balsamic Bourbon-style vanilla', source: 'The Good Scents Company' },
  'Bourbon Vanilla': { parent: 'Vanilla', kind: 'regional', profile: 'rich, rounded and balsamic vanilla profile', source: 'The Good Scents Company' },
  'Tahitian Vanilla': { parent: 'Vanilla', kind: 'regional', profile: 'floral, anisic and softer exotic vanilla profile', source: 'The Good Scents Company' },
  'Vanilla Tahitensis': { parent: 'Vanilla', kind: 'natural', profile: 'floral-fruity vanilla species with a distinct Tahitian profile', source: 'The Good Scents Company' },
  'Vanilla Pompona': { parent: 'Vanilla', kind: 'natural', profile: 'rounded vanilla with caramel and chocolate-like facets', source: 'Curated perfumery vocabulary' },
  'Vanilla Absolute': { parent: 'Vanilla', kind: 'extract', profile: 'dense, sweet, balsamic, caramellic and creamy', source: 'Eden Botanicals' },
  'Madagascar Vanilla Absolute': { parent: 'Vanilla', kind: 'extract', profile: 'dense natural vanilla with bitter chocolate and balsamic depth', source: 'Eden Botanicals' },
  'Vanilla CO2 Extract': { parent: 'Vanilla', kind: 'extract', profile: 'smooth creamy vanilla with spice, tobacco and woody-balsamic nuances', source: 'Eden Botanicals' },
  'Vanilla Tincture': { parent: 'Vanilla', kind: 'extract', profile: 'sweet vanilla, toffee and woody with rummy/phenolic nuances', source: 'The Good Scents Company' },
  'Bourbon Vanilla Tincture': { parent: 'Vanilla', kind: 'extract', profile: 'Bourbon pod tincture; warm, natural and rounded', source: 'The Good Scents Company' },
  'Vanilla Planifolia Infusion': { parent: 'Vanilla', kind: 'extract', profile: 'deep natural vanilla with gourmand and lightly animalic depth', source: 'The Good Scents Company' },
  'Vanilla Oleoresin': { parent: 'Vanilla', kind: 'extract', profile: 'resinous concentrated vanilla extract', source: 'The Good Scents Company' },
  'Bourbon Vanilla Oleoresin': { parent: 'Vanilla', kind: 'extract', profile: 'concentrated Bourbon vanilla oleoresin', source: 'The Good Scents Company' },
  'Bali Vanilla Oleoresin': { parent: 'Vanilla', kind: 'extract', profile: 'regional vanilla oleoresin', source: 'The Good Scents Company' },
  'Vanillin': { parent: 'Vanilla', kind: 'molecule', profile: 'recognizable sweet vanilla molecule; cleaner and simpler than the whole bean', source: 'The Good Scents Company' },
  'Ethyl Vanillin': { parent: 'Vanilla', kind: 'molecule', profile: 'more powerful, sweeter creamy-vanilla effect than vanillin', source: 'The Good Scents Company', aliases: ['Ethylvanillin'] },
  'Vanilla Caviar': { parent: 'Vanilla', kind: 'natural', profile: 'vanilla bean seeds / caviar presentation', source: 'Fragrantica', aliases: ['Vanilla Bean Seeds', 'Vanilla Bean Caviar'] },

  'Jasmine Grandiflorum': { parent: 'Jasmine', kind: 'natural', profile: 'fruity-creamy jasmine with honeyed, sometimes smoky facets', source: 'Fragrantica' },
  'Jasmine Sambac': { parent: 'Jasmine', kind: 'natural', profile: 'greener, headier jasmine with orange-flower/tuberose facets', source: 'Fragrantica', aliases: ['Arabian Jasmine'] },
  'Jasmine Auriculatum': { parent: 'Jasmine', kind: 'natural', profile: 'watery jasmine with earthy and unusual floral nuances', source: 'Fragrantica' },
  'Rose Otto': { parent: 'Rose', kind: 'extract', profile: 'bright, green and lifted rose oil character', source: 'Fragrantica' },
  'Rose Absolute': { parent: 'Rose', kind: 'extract', profile: 'deeper petal-rich rose with honeyed/spicy nuances', source: 'Fragrantica' },
  'Damask Rose': { parent: 'Rose', kind: 'natural', profile: 'classic rich Rosa damascena profile', source: 'Fragrantica', aliases: ['Rosa Damascena'] },
  'Centifolia Rose': { parent: 'Rose', kind: 'natural', profile: 'lush Rose de Mai / cabbage rose profile', source: 'Fragrantica', aliases: ['Rose de Mai', 'May Rose'] },

  'Iso E Super': { kind: 'molecule', profile: 'transparent woody-amber material with diffusive velvety volume', source: 'Curated perfumery vocabulary' },
  'Hedione': { kind: 'molecule', profile: 'radiant jasmine-like floral diffusion', source: 'Curated perfumery vocabulary' },
  'Ambroxan': { kind: 'molecule', profile: 'dry ambergris-like woody amber with strong persistence', source: 'Curated perfumery vocabulary' },
  'Galaxolide': { parent: 'Musk', kind: 'molecule', profile: 'clean soft polycyclic musk', source: 'Fragrantica' },
  'Habanolide': { parent: 'Musk', kind: 'molecule', profile: 'radiant metallic-clean macrocyclic-style musk effect', source: 'Fragrantica' },
};

export const mergeNoteExpansion = (base: Note[]): Note[] => {
  const merged = new Map<string, Note>();
  base.forEach((note) => merged.set(note.name.toLocaleLowerCase(), note));
  CURATED_NOTE_EXPANSION.forEach((note) => merged.set(note.name.toLocaleLowerCase(), note));

  // Collapse a known spelling duplicate into the canonical perfumery name.
  merged.delete('ethylvanillin');

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const DATABASE_RESEARCH_VERSION = '2026-09-curated-1';
