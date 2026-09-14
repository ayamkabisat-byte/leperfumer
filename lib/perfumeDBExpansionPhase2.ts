import type { Note } from './perfumeDB';

type Layer = Note['layers'][number];
const group = (cat: string, layers: Layer[], names: string[]): Note[] => names.map((name) => ({ name, cat, layers }));

/** Second research pass: material forms and subfamilies that materially change how a note behaves. */
export const CURATED_NOTE_EXPANSION_PHASE_2: Note[] = [
  ...group('citrus', ['top', 'mid'], [
    'Bergamot Essential Oil', 'Bergamot FCF', 'Bergamot Rectified', 'Calabrian Bergamot',
    'Lemon Essential Oil', 'Sicilian Lemon Oil', 'Lemon Distilled Oil',
    'Lime Expressed Oil', 'Lime Distilled Oil', 'Mexican Lime',
    'Green Mandarin Essential Oil', 'Red Mandarin Essential Oil', 'Yellow Mandarin Essential Oil',
    'Bitter Orange Essential Oil', 'Sweet Orange Essential Oil', 'Blood Orange Essential Oil',
    'Grapefruit Essential Oil', 'Pink Grapefruit', 'White Grapefruit', 'Yuzu Essential Oil',
  ]),

  ...group('flowers', ['top', 'mid', 'base'], [
    'Iris Germanica', 'Iris Florentina', 'Italian Iris', 'Tuscan Iris',
    'Orris Butter', 'Orris Absolute', 'Orris Concrete', 'Orris Resinoid',
    'Iris Pallida Absolute', 'Iris Pallida Butter', 'Iris Germanica Butter',
  ]),

  ...group('flowers', ['top', 'mid'], [
    'Lavender Essential Oil', 'Lavender Absolute', 'French Lavender', 'Bulgarian Lavender',
    'English Lavender', 'Maillette Lavender', 'High Altitude Lavender',
    'Lavandin', 'Lavandin Grosso', 'Lavandin Super', 'Lavandin Abrialis',
  ]),

  ...group('greens', ['mid', 'base'], [
    'Virginia Tobacco', 'Burley Tobacco', 'Oriental Tobacco', 'Turkish Tobacco', 'Latakia Tobacco',
    'Tobacco Absolute', 'Virginia Tobacco Absolute', 'Cured Tobacco', 'Sun-Cured Tobacco',
    'Fire-Cured Tobacco', 'Cigar Tobacco', 'Pipe Tobacco', 'Tobacco Leaf Tincture',
  ]),

  ...group('spices', ['mid', 'base'], [
    'Arabica Coffee', 'Robusta Coffee', 'Roasted Coffee Beans', 'Coffee Absolute',
    'Coffee CO2 Extract', 'Coffee Bean Absolute', 'Dark Roast Coffee', 'Turkish Coffee',
    'Ethiopian Coffee', 'Vietnamese Coffee', 'Coffee Husk',
    'Cacao Absolute', 'Cocoa Absolute', 'Cacao CO2 Extract', 'Cacao Nibs', 'Roasted Cacao',
    'Cacao Husk', 'Cocoa Powder', 'Dark Cocoa',
  ]),

  ...group('sweets', ['mid', 'base'], [
    'Espresso Accord', 'Coffee Cream Accord', 'Coffee Caramel Accord', 'Mocha Accord',
    'Dark Chocolate Accord', 'Milk Chocolate Accord', 'White Chocolate Accord',
    'Chocolate Ganache Accord', 'Cocoa Butter Accord', 'Cacao Praline Accord',
  ]),

  ...group('greens', ['top', 'mid'], [
    'Sencha Tea', 'Sencha Absolute', 'Gyokuro Tea', 'Jasmine Green Tea', 'White Tea',
    'Silver Needle Tea', 'Darjeeling Tea', 'Assam Black Tea', 'Ceylon Black Tea',
    'Keemun Black Tea', 'Phoenix Dan Cong Tea', 'Milk Oolong', 'Roasted Oolong',
    'Smoked Black Tea', 'Lapsang Souchong Absolute', 'Tea Leaf Absolute',
  ]),

  ...group('resins', ['mid', 'base'], [
    'Amber Accord', 'Golden Amber Accord', 'White Amber Accord', 'Black Amber Accord',
    'Dry Amber Accord', 'Balsamic Amber Accord', 'Resinous Amber Accord', 'Mineral Amber Accord',
  ]),

  ...group('syntheticWeird', ['mid', 'base'], [
    'Amberwood', 'Ambercore', 'Ambermor', 'Ambrinol S', 'Fixamber', 'Okoumal',
    'Georgywood', 'Sylvamber', 'Karanal', 'Trisamber',
  ]),

  ...group('musk', ['mid', 'base'], [
    'Ambrette Seed', 'Ambrette Seed Absolute', 'Ambrette Seed CO2 Extract',
    'Musk Ketone', 'Musk Xylene', 'Ethylene Brassylate', 'Globalide', 'Romandolide',
    'Velvione', 'Exaltenone', 'Civettone', 'Aurelione', 'Musk R1',
  ]),

  ...group('resins', ['top', 'mid', 'base'], [
    'Frankincense Essential Oil', 'Olibanum Essential Oil', 'Boswellia Carterii Oil',
    'Boswellia Sacra Oil', 'Myrrh Essential Oil', 'Elemi Resinoid',
  ]),
];

export const mergeNoteExpansionPhase2 = (base: Note[]): Note[] => {
  const merged = new Map(base.map((note) => [note.name.toLocaleLowerCase(), note]));
  CURATED_NOTE_EXPANSION_PHASE_2.forEach((note) => merged.set(note.name.toLocaleLowerCase(), note));
  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
};
