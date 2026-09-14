import type { Note } from './perfumeDB';
import { NOTE_METADATA } from './perfumeDBExpansion';

export interface NoteFamily {
  id: string;
  label: string;
  icon: string;
  description: string;
  categories: string[];
}

export const NOTE_FAMILIES: NoteFamily[] = [
  { id: 'citrus', label: 'Citrus', icon: '◐', description: 'Peel, zest, oils & sparkling hesperidics', categories: ['citrus'] },
  { id: 'floral', label: 'Floral', icon: '✿', description: 'Rose, iris, lavender & floral materials', categories: ['flowers'] },
  { id: 'white-floral', label: 'White Floral', icon: '❉', description: 'Jasmine, tuberose, gardenia & indolics', categories: ['whiteFlowers'] },
  { id: 'green', label: 'Green & Tea', icon: '⌁', description: 'Leaves, herbs, grasses, tea & aromatic greens', categories: ['greens'] },
  { id: 'fruit', label: 'Fruit', icon: '●', description: 'Fresh, dried, tropical & reconstructed fruits', categories: ['fruits'] },
  { id: 'spice', label: 'Spice & Botanical', icon: '✦', description: 'Spices, seeds, coffee, cacao & botanicals', categories: ['spices'] },
  { id: 'gourmand', label: 'Gourmand', icon: '◇', description: 'Vanilla accords, sweets, pastry & edible effects', categories: ['sweets'] },
  { id: 'wood', label: 'Wood', icon: '⌃', description: 'Oud, sandalwood, cedar, vetiver & patchouli', categories: ['woods'] },
  { id: 'resin', label: 'Resin & Incense', icon: '◈', description: 'Benzoin, amber, incense, balsams & resins', categories: ['resins'] },
  { id: 'musk', label: 'Musk & Animalic', icon: '◎', description: 'Musks, ambergris, leather & animalic materials', categories: ['musk'] },
  { id: 'beverage', label: 'Beverage', icon: '◒', description: 'Tea drinks, spirits, wine, coffee drinks & cocktails', categories: ['beverages'] },
  { id: 'synthetic', label: 'Molecule & Experimental', icon: '⬡', description: 'Aroma chemicals, modern woods, ozonics & fantasy accords', categories: ['syntheticWeird'] },
  { id: 'other', label: 'Other', icon: '·', description: 'Unclassified, fantasy & custom vocabulary', categories: ['uncategorized', 'Custom'] },
];

const PARENT_PATTERNS: Array<[RegExp, string]> = [
  [/vanill/i, 'Vanilla'], [/rose|rosa |damask|centifolia|taif/i, 'Rose'], [/jasmine/i, 'Jasmine'],
  [/iris|orris/i, 'Iris & Orris'], [/lavand|lavender/i, 'Lavender & Lavandin'], [/tuberose/i, 'Tuberose'],
  [/patchouli/i, 'Patchouli'], [/vetiver/i, 'Vetiver'], [/sandal|santalum|javanol|sandalore|polysantol/i, 'Sandalwood'],
  [/oud|agarwood/i, 'Oud & Agarwood'], [/cedar/i, 'Cedarwood'], [/tobacco|cigar/i, 'Tobacco'],
  [/coffee|espresso|mocha/i, 'Coffee'], [/cacao|cocoa|chocolate/i, 'Cacao & Chocolate'],
  [/bergamot/i, 'Bergamot'], [/mandarin|tangerine/i, 'Mandarin'], [/lemon/i, 'Lemon'], [/lime/i, 'Lime'],
  [/grapefruit/i, 'Grapefruit'], [/yuzu/i, 'Yuzu'], [/tea|sencha|gyokuro|oolong|darjeeling|assam|hojicha|lapsang/i, 'Tea'],
  [/benzoin/i, 'Benzoin'], [/frankincense|olibanum|boswellia|incense/i, 'Frankincense & Incense'],
  [/myrrh/i, 'Myrrh'], [/labdanum/i, 'Labdanum'], [/amber|ambrox|cetalox|ambrofix/i, 'Amber & Amberwood'],
  [/musk|galaxolide|habanolide|helvetolide|ambrettolide|exaltolide|muscenone|tonalide/i, 'Musk'],
  [/aldehyde/i, 'Aldehydes'], [/hedione|jasmonate/i, 'Jasmine Molecules'], [/ionone|damascone|damascenone/i, 'Ionones & Rose Ketones'],
];

export const getNoteFamily = (note: Note): NoteFamily =>
  NOTE_FAMILIES.find((family) => family.categories.includes(note.cat)) ?? NOTE_FAMILIES[NOTE_FAMILIES.length - 1];

export const getNoteParent = (note: Note): string => {
  const metadataParent = NOTE_METADATA[note.name]?.parent;
  if (metadataParent) return metadataParent;
  const match = PARENT_PATTERNS.find(([pattern]) => pattern.test(note.name));
  if (match) return match[1];
  return getNoteFamily(note).label;
};

export const getMaterialKind = (note: Note): string => {
  const metadata = NOTE_METADATA[note.name];
  if (metadata?.kind) return metadata.kind;
  const value = note.name.toLocaleLowerCase();
  if (/absolute|concrete|resinoid|tincture|extract|co2|essential oil| oleoresin| infusion/.test(value)) return 'extract';
  if (/accord|notes$|effect|fantasy/.test(value)) return 'accord';
  if (note.cat === 'syntheticWeird' || /aldehyde|ambrox|cetalox|hedione|ionone|molecule|galaxolide|habanolide|vanillin/.test(value)) return 'molecule';
  if (/madagascar|tahitian|turkish|bulgarian|indonesian|haitian|java |mysore|calabrian|sicilian|virginia|assam|cambodian|laotian|vietnamese/.test(value)) return 'regional';
  return 'natural';
};

export const materialKindLabel = (kind: string) => ({
  natural: 'Natural / note', extract: 'Extract', regional: 'Origin / varietal', molecule: 'Molecule', accord: 'Accord', fantasy: 'Fantasy',
}[kind] ?? kind);
