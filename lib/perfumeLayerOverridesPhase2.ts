import type { Note } from './perfumeDB';
import { getNoteLayerProfile as baseProfile, type NoteLayerProfile, type PerfumeLayer } from './perfumeLayerModel';

const makeProfile = (allowedLayers: PerfumeLayer[], typicalLayer: PerfumeLayer, rationale: string): NoteLayerProfile => ({ allowedLayers, typicalLayer, rationale, confidence: 'high' });
const containsAny = (name: string, words: string[]) => words.some((word) => name.toLocaleLowerCase().includes(word));

export const getResolvedNoteLayerProfile = (note: Note): NoteLayerProfile => {
  const name = note.name.toLocaleLowerCase();
  if (containsAny(name, ['iris', 'orris'])) return makeProfile(['top','mid','base'], 'mid', 'Iris and orris can occur in opening, heart, or persistent drydown depending on extract and formula.');
  if (containsAny(name, ['lavender', 'lavandin'])) return makeProfile(['top','mid'], 'top', 'Lavender and lavandin usually bridge an aromatic opening into the heart.');
  if (name.includes('tobacco')) return makeProfile(['mid','base'], 'base', 'Tobacco can form a dry aromatic heart or a deep sweet and leathery base.');
  if (containsAny(name, ['coffee','espresso','mocha'])) return makeProfile(['mid','base'], 'base', 'Roasted coffee materials usually span heart and base.');
  if (containsAny(name, ['cacao','cocoa','chocolate'])) return makeProfile(['mid','base'], 'base', 'Cacao and chocolate are warm balsamic gourmand heart-to-base effects.');
  if (containsAny(name, ['tea','sencha','gyokuro','hojicha','oolong','darjeeling','keemun','lapsang'])) return makeProfile(['top','mid'], 'mid', 'Tea materials usually develop from an aromatic opening into the heart.');
  if (containsAny(name, ['amberwood','ambercore','ambermor','fixamber','okoumal','sylvamber','karanal','trisamber'])) return makeProfile(['mid','base'], 'base', 'Woody amber materials provide persistent heart-to-base warmth and diffusion.');
  if (containsAny(name, ['ambrette','musk','globalide','romandolide','velvione','exaltenone','civettone','aurelione','ethylene brassylate'])) return makeProfile(['mid','base'], 'base', 'Musk materials are persistent bases that can radiate through the heart.');
  if (containsAny(name, ['frankincense','olibanum','boswellia','myrrh','elemi'])) return makeProfile(['top','mid','base'], 'base', 'Resin oils combine terpenic lift with persistent balsamic drydown.');
  if (containsAny(name, ['bergamot','lemon','lime','mandarin','grapefruit','yuzu']) && containsAny(name, ['oil','fcf','rectified'])) return makeProfile(['top','mid'], 'top', 'Citrus oil is a high-volatility opening material that can bridge into the heart.');
  return baseProfile(note);
};

export const applyResolvedLayerProfiles = (notes: Note[]): Note[] => notes.map((note) => ({ ...note, layers: getResolvedNoteLayerProfile(note).allowedLayers }));
