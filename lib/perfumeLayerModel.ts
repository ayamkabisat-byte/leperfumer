import type { Note } from './perfumeDB';

export type PerfumeLayer = 'top' | 'mid' | 'base';
export type LayerConfidence = 'high' | 'medium' | 'contextual';

export interface NoteLayerProfile {
  allowedLayers: PerfumeLayer[];
  typicalLayer: PerfumeLayer;
  confidence: LayerConfidence;
  rationale: string;
}

const profile = (
  allowedLayers: PerfumeLayer[],
  typicalLayer: PerfumeLayer,
  rationale: string,
  confidence: LayerConfidence = 'medium',
): NoteLayerProfile => ({ allowedLayers, typicalLayer, rationale, confidence });

const CATEGORY_PROFILES: Record<string, NoteLayerProfile> = {
  citrus: profile(['top', 'mid'], 'top', 'Citrus materials are usually highly volatile but can bridge into the heart.'),
  greens: profile(['top', 'mid'], 'top', 'Green/aromatic materials usually shape the opening and aromatic heart.'),
  flowers: profile(['top', 'mid'], 'mid', 'Florals usually form the heart; lighter floral effects can appear in the opening.'),
  whiteFlowers: profile(['mid', 'base'], 'mid', 'Rich white florals usually dominate the heart and can persist into drydown.'),
  fruits: profile(['top', 'mid'], 'top', 'Fruit notes are commonly volatile accords spanning opening and heart.'),
  spices: profile(['top', 'mid', 'base'], 'mid', 'Spices range from bright cardamom/pepper to persistent saffron, tonka and warm spice effects.', 'contextual'),
  sweets: profile(['mid', 'base'], 'base', 'Gourmand notes are commonly heart-to-base accords with strong drydown presence.'),
  woods: profile(['mid', 'base'], 'base', 'Woods are generally substantive but often provide structure before the final drydown.'),
  resins: profile(['mid', 'base'], 'base', 'Balsams and resins are low-volatility materials that can emerge from heart into base.'),
  musk: profile(['mid', 'base'], 'base', 'Musks/animalics are persistent, though modern musks can radiate through the heart.'),
  beverages: profile(['top', 'mid', 'base'], 'mid', 'Beverage notes are constructed accords whose placement depends on the formula.', 'contextual'),
  syntheticWeird: profile(['mid'], 'mid', 'Synthetic/fantasy materials require material-specific volatility data.', 'contextual'),
  uncategorized: profile(['top', 'mid', 'base'], 'mid', 'Unclassified/fantasy notes are context-dependent accords.', 'contextual'),
  Custom: profile(['top', 'mid', 'base'], 'mid', 'Custom notes can be positioned freely by the composer.', 'contextual'),
};

const EXACT: Record<string, NoteLayerProfile> = {};
const add = (names: string[], p: NoteLayerProfile) => names.forEach((name) => { EXACT[name.toLocaleLowerCase()] = p; });

add([
  'Bergamot', 'Lemon', 'Lime', 'Grapefruit', 'Mandarin Orange', 'Tangerine', 'Yuzu',
  'Neroli', 'Petitgrain', 'Orange Blossom', 'Lavender', 'Clary Sage', 'Mint', 'Spearmint',
  'Pink Pepper', 'Cardamom', 'Ginger', 'Juniper', 'Galbanum', 'Aldehydes',
], profile(['top', 'mid'], 'top', 'Commonly used as an opening material but capable of bridging into the heart.', 'high'));

add([
  'Rose', 'Damask Rose', 'Turkish Rose', 'Bulgarian Rose', 'Rose Otto', 'Rose Absolute',
  'Peony', 'Violet', 'Geranium', 'Magnolia', 'Champaca', 'Ylang-Ylang', 'Osmanthus',
  'Iris', 'Orris Root', 'Orris Butter', 'Heliotrope', 'Narcissus',
], profile(['top', 'mid', 'base'], 'mid', 'Floral character is typically heart-led, while different extracts/accords may appear earlier or persist into drydown.', 'contextual'));

add([
  'Jasmine', 'Jasmine Grandiflorum', 'Jasmine Sambac', 'Arabian Jasmine', 'Jasmine Absolute',
  'Jasmine Grandiflorum Absolute', 'Jasmine Sambac Absolute', 'Jasmine CO2 Extract',
  'Tuberose', 'Tuberose Absolute', 'Gardenia', 'Frangipani', 'Tiare Flower',
], profile(['mid', 'base'], 'mid', 'Indolic/rich white florals are heart materials with substantial drydown persistence.', 'high'));

add([
  'Vanilla', 'Vanilla Bean', 'Vanilla Planifolia', 'Madagascar Vanilla', 'Madagascar Bourbon Vanilla',
  'Bourbon Vanilla', 'Tahitian Vanilla', 'Vanilla Tahitensis', 'Mexican Vanilla', 'Indonesian Vanilla',
  'Ugandan Vanilla', 'Vanilla Pompona', 'Vanilla Absolute', 'Madagascar Vanilla Absolute',
  'Vanilla Tahitensis Absolute', 'Vanilla CO2 Extract', 'Vanilla Tahitensis CO2 Extract',
  'Vanilla Tincture', 'Bourbon Vanilla Tincture', 'Vanilla Extract', 'Vanilla Oleoresin',
  'Vanilla Resinoid', 'Vanillin', 'Ethyl Vanillin', 'Methyl Vanillate', 'Vanillyl Acetate',
], profile(['mid', 'base'], 'base', 'Vanillic materials are usually persistent bases, but perfume pyramids also place vanilla in the heart.', 'high'));

add([
  'Patchouli', 'Patchouli Heart', 'Patchouli CO2 Extract', 'Indonesian Patchouli', 'Green Patchouli',
  'Dark Patchouli', 'Vetiver', 'Haitian Vetiver', 'Java Vetiver', 'Bourbon Vetiver', 'Vetiver Heart',
  'Vetiver Absolute', 'Sandalwood', 'Santalum Album', 'Indian Sandalwood', 'Mysore Sandalwood',
  'Australian Sandalwood', 'Cedar', 'Cedarwood', 'Cedarwood Atlas', 'Virginia Cedarwood',
  'Hinoki', 'Hinoki Essential Oil', 'Guaiac Wood', 'Cashmere Wood',
], profile(['mid', 'base'], 'base', 'Substantive woods usually anchor the base while contributing structure through the heart.', 'high'));

add([
  'Oud', 'Agarwood', 'Assam Oud', 'Australian Oud', 'Cambodian Oud', 'Chinese Oud', 'Indian Oud',
  'Indonesian Oud', 'Laotian Oud', 'Malaysian Oud', 'Thai Oud', 'Trat Oud', 'Vietnamese Oud',
  'Borneo Oud', 'White Oud', 'Oud Butter', 'Oud Sumatra', 'Oud CO2 Extract',
], profile(['mid', 'base'], 'base', 'Oud/agarwood is normally a long-lasting base but may be intentionally exposed in the heart.', 'high'));

add([
  'Musk', 'White Musk', 'Skin musk', 'Galaxolide', 'Habanolide', 'Helvetolide', 'Ambrettolide',
  'Exaltolide', 'Muscenone', 'Cosmone', 'Serenolide', 'Tonalide', 'Muscone', 'Civet', 'Castoreum',
], profile(['mid', 'base'], 'base', 'Persistent musks and animalic materials radiate through heart and drydown.', 'high'));

add([
  'Amber', 'Ambergris', 'Ambroxan', 'Cetalox', 'Ambrofix', 'Amber Xtreme', 'Iso E Super',
  'Timbersilk', 'Cashmeran', 'Javanol', 'Sandalore', 'Polysantol', 'Cedramber', 'Norlimbanol',
  'Kephalis', 'Oakmoss', 'Evernyl',
], profile(['mid', 'base'], 'base', 'Woody-amber and moss materials are low-volatility anchors with strong heart-to-base diffusion.', 'high'));

add([
  'Benzoin', 'Siam Benzoin', 'Sumatra Benzoin', 'Benzoin Absolute', 'Benzoin Resinoid',
  'Labdanum', 'Labdanum Absolute', 'Labdanum Resinoid', 'Myrrh', 'Myrrh Absolute', 'Myrrh Resinoid',
  'Opoponax', 'Opoponax Resinoid', 'Tolu Balsam', 'Peru Balsam', 'Styrax',
], profile(['mid', 'base'], 'base', 'Balsams and resins are substantive fixative materials, generally heart-to-base.', 'high'));

add([
  'Frankincense', 'Olibanum', 'Frankincense Carterii', 'Frankincense Sacra', 'Frankincense Serrata',
  'Olibanum Absolute', 'Olibanum Resinoid', 'Incense', 'Elemi', 'Elemi Essential Oil',
], profile(['top', 'mid', 'base'], 'base', 'Incense materials combine volatile terpenic lift with persistent resinous drydown.', 'contextual'));

add(['Tobacco', 'Blonde Tobacco', 'Tobacco Absolute', 'Tobacco Leaf Absolute', 'Leather', 'Suede'],
  profile(['mid', 'base'], 'base', 'Dense tobacco/leather effects usually occupy heart and base.', 'high'));

add(['Coffee', 'Coffee CO2', 'Coffee Tincture', 'Espresso', 'Cacao', 'Chocolate', 'Honey', 'Caramel', 'Tonka Bean', 'Coumarin'],
  profile(['mid', 'base'], 'base', 'Roasted, gourmand and coumarinic materials commonly bridge heart into base.', 'high'));

add(['Rum', 'Whiskey', 'Cognac', 'Gin', 'Absinthe', 'Champagne', 'Wine', 'Sake'],
  profile(['top', 'mid', 'base'], 'mid', 'Boozy notes are accords and may be used as volatile openings, hearts or warm bases.', 'contextual'));

add(['Saffron'], profile(['top', 'mid', 'base'], 'mid', 'Saffron can function as bright leathery spice, a heart accent, or a dry base effect.', 'contextual'));
add(['Cinnamon', 'Cloves', 'Nutmeg', 'Pepper'], profile(['top', 'mid', 'base'], 'mid', 'Warm spices have broad placement depending on extraction, dose and accord.', 'contextual'));

add(['Aldehyde C-10', 'Aldehyde C-11', 'Aldehyde C-12 MNA', 'cis-3-Hexenol', 'Citral', 'Citronellal', 'Dihydromyrcenol'],
  profile(['top', 'mid'], 'top', 'High-volatility aroma material used primarily for lift and opening diffusion.', 'high'));
add(['Calone', 'Floralozone', 'Helional', 'Melonal', 'Aquaflora', 'Calypsone', 'Cascalone'],
  profile(['top', 'mid'], 'mid', 'Watery/ozonic materials often span a fresh opening and aquatic heart.', 'contextual'));
add(['Hedione', 'Hedione HC', 'Methyl Jasmonate', 'Benzyl Acetate', 'Hydroxycitronellal', 'Methyl Anthranilate', 'Alpha Ionone', 'Beta Ionone', 'Methyl Ionone', 'Rose Oxide', 'Damascone', 'Beta Damascone', 'Damascenone', 'Phenethyl Alcohol', 'Geraniol', 'Citronellol', 'Nerol'],
  profile(['top', 'mid', 'base'], 'mid', 'Floral aroma material whose perceptual effect can bridge multiple phases depending on substantivity and dose.', 'contextual'));

const LOW_VOLATILITY_HINT = /(oud|agar|wood|cedar|sandal|vetiver|patchouli|moss|musk|amber|ambro|resin|balsam|benzoin|labdanum|myrrh|vanill|tonka|leather|tobacco|styrax|castoreum|civet|coumarin|cashmer|javanol|norlimbanol|cedramber)/i;
const HIGH_VOLATILITY_HINT = /(citrus|lemon|lime|bergamot|grapefruit|mandarin|tangerine|yuzu|aldehyde|mint|pepper|cardamom|linalyl|citral|dihydromyrcenol)/i;

export const getNoteLayerProfile = (note: Note): NoteLayerProfile => {
  const exact = EXACT[note.name.toLocaleLowerCase()];
  if (exact) return exact;

  if (note.cat === 'syntheticWeird') {
    if (LOW_VOLATILITY_HINT.test(note.name)) return profile(['mid', 'base'], 'base', 'Heuristic: low-volatility woody/amber/musk/resin material.', 'medium');
    if (HIGH_VOLATILITY_HINT.test(note.name)) return profile(['top', 'mid'], 'top', 'Heuristic: volatile fresh/aromatic material.', 'medium');
  }

  return CATEGORY_PROFILES[note.cat] ?? profile(note.layers.length ? note.layers : ['mid'], note.layers[0] ?? 'mid', 'Legacy placement retained where no stronger research rule exists.', 'contextual');
};

export const applyLayerProfiles = (notes: Note[]): Note[] =>
  notes.map((note) => ({ ...note, layers: getNoteLayerProfile(note).allowedLayers }));

export const TYPICAL_LAYER_LABEL: Record<PerfumeLayer, string> = {
  top: 'Typical: Top',
  mid: 'Typical: Heart',
  base: 'Typical: Base',
};
