import type { NoteFamily } from '@/lib/noteTaxonomy';

export function NoteFamilyVisual({ family, compact = false }: { family: NoteFamily; compact?: boolean }) {
  return (
    <span className={`family-visual family-visual-${family.id} ${compact ? 'compact' : ''}`} aria-hidden="true">
      <span className="family-shape family-shape-a" />
      <span className="family-shape family-shape-b" />
      <span className="family-shape family-shape-c" />
      <span className="family-visual-icon">{family.icon}</span>
    </span>
  );
}
