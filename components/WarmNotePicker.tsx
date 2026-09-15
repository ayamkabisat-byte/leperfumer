'use client';

import { useMemo, useState } from 'react';
import { FULL_DATABASE, type Note } from '@/lib/perfumeDB';
import { getNoteLayerProfile, isExperimentalNote, type Layer } from '@/lib/recipeGenerator';
import { NOTE_FAMILIES, getMaterialKind, getNoteFamily, getNoteParent, materialKindLabel } from '@/lib/noteTaxonomy';
import { NoteFamilyVisual } from './NoteFamilyVisual';

const LABEL: Record<Layer, string> = { top: 'Top', mid: 'Heart', base: 'Base' };
const layerCode = (layer: Layer) => layer === 'top' ? 'T' : layer === 'mid' ? 'H' : 'B';

export function WarmNotePicker({ target, maxCount, locked, includeExperimental, reservedNames, repetitionEnabled, onToggle, onClear, onClose }: {
  target: Layer | 'list'; maxCount: number; locked: Note[]; includeExperimental: boolean;
  reservedNames: Set<string>; repetitionEnabled: boolean; onToggle: (note: Note) => void;
  onClear: () => void; onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [custom, setCustom] = useState('');
  const [familyId, setFamilyId] = useState('gourmand');
  const [parent, setParent] = useState<string | null>('Vanilla');
  const selected = useMemo(() => new Set(locked.map((n) => n.name.toLocaleLowerCase())), [locked]);

  const eligible = useMemo(() => FULL_DATABASE
    .filter((note) => target === 'list' || note.layers.includes(target))
    .filter((note) => includeExperimental || !isExperimentalNote(note))
    .filter((note) => !reservedNames.has(note.name.toLocaleLowerCase())), [target, includeExperimental, reservedNames]);

  const families = useMemo(() => NOTE_FAMILIES.map((family) => ({
    family,
    notes: eligible.filter((note) => getNoteFamily(note).id === family.id),
  })).filter((entry) => entry.notes.length), [eligible]);

  const activeEntry = families.find((entry) => entry.family.id === familyId) ?? families[0];
  const parentGroups = useMemo(() => {
    const map = new Map<string, Note[]>();
    (activeEntry?.notes ?? []).forEach((note) => {
      const key = getNoteParent(note);
      map.set(key, [...(map.get(key) ?? []), note]);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, [activeEntry]);

  const activeParent = parent && parentGroups.some(([name]) => name === parent) ? parent : parentGroups[0]?.[0] ?? null;
  const query = search.trim().toLocaleLowerCase();
  const visibleNotes = useMemo(() => {
    const source = query ? eligible : (activeParent ? parentGroups.find(([name]) => name === activeParent)?.[1] ?? [] : activeEntry?.notes ?? []);
    return source.filter((note) => !query || `${note.name} ${getNoteParent(note)} ${getMaterialKind(note)} ${getNoteFamily(note).label}`.toLocaleLowerCase().includes(query));
  }, [query, eligible, activeParent, parentGroups, activeEntry]);

  const chooseFamily = (id: string) => {
    const entry = families.find((item) => item.family.id === id);
    setFamilyId(id);
    setSearch('');
    if (!entry) return setParent(null);
    const counts = new Map<string, number>();
    entry.notes.forEach((note) => counts.set(getNoteParent(note), (counts.get(getNoteParent(note)) ?? 0) + 1));
    setParent([...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null);
  };

  const addCustom = () => {
    const name = custom.trim().slice(0, 80);
    if (!name || locked.length >= maxCount || reservedNames.has(name.toLocaleLowerCase())) return;
    onToggle({ name, cat: 'Custom', layers: target === 'list' ? ['top', 'mid', 'base'] : [target] });
    setCustom('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal-panel warm-note-explorer" onClick={(event) => event.stopPropagation()}>
        <header className="note-explorer-head">
          <div>
            <div className="eyebrow">Add a note to your formula</div>
            <h2 className="note-explorer-title">Explore the ingredients of emotion.</h2>
            <p>Family → material group → individual material. Layer eligibility stays visible while you browse.</p>
          </div>
          <div className="note-explorer-status">
            <strong>{locked.length}/{maxCount}</strong><span>{target === 'list' ? 'notes selected' : `${LABEL[target]} notes locked`}</span>
            {repetitionEnabled && <small>↻ repetition enabled</small>}
          </div>
          <button className="ghost-button note-explorer-close" onClick={onClose} aria-label="Close note picker">×</button>
        </header>

        <div className="note-explorer-tools">
          <div className="note-search-wrap"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search note, origin, extract, molecule…" autoFocus /></div>
          <div className="note-custom-wrap"><input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }} placeholder="Custom note…"/><button className="soft-button" disabled={!custom.trim() || locked.length >= maxCount} onClick={addCustom}>Add</button></div>
        </div>

        <div className="note-explorer-columns">
          <section className="note-explorer-column family-column">
            <div className="column-label">1 · Choose family</div>
            <div className="family-cabinet">
              {families.map(({ family, notes }) => <button key={family.id} className={`family-bento ${family.id === activeEntry?.family.id ? 'active' : ''}`} onClick={() => chooseFamily(family.id)}>
                <NoteFamilyVisual family={family}/><span className="family-bento-copy"><strong>{family.label}</strong><small>{family.description}</small><em>{notes.length} notes</em></span>
              </button>)}
            </div>
          </section>

          <section className="note-explorer-column group-column">
            <div className="column-label">2 · Material group</div>
            <div className="group-list">
              {parentGroups.map(([name, notes]) => <button key={name} className={`material-group-card ${name === activeParent && !query ? 'active' : ''}`} onClick={() => { setParent(name); setSearch(''); }}>
                <span className="material-orb"><NoteFamilyVisual family={activeEntry.family} compact/></span>
                <span><strong>{name}</strong><small>{summarizeKinds(notes)}</small></span><em>{notes.length} →</em>
              </button>)}
            </div>
          </section>

          <section className="note-explorer-column notes-column">
            <div className="column-label">3 · Choose note</div>
            <div className="notes-column-heading"><div><h3>{query ? 'Search results' : activeParent ?? activeEntry?.family.label}</h3><p>{query ? `Matching “${search}”` : activeEntry?.family.description}</p></div><span>{visibleNotes.length}</span></div>
            <div className="note-material-list">
              {visibleNotes.length === 0 && <div className="empty-note-state">No matching materials.</div>}
              {visibleNotes.map((note) => {
                const key = note.name.toLocaleLowerCase();
                const isSelected = selected.has(key);
                const disabled = !isSelected && locked.length >= maxCount;
                const lp = getNoteLayerProfile(note);
                const kind = getMaterialKind(note);
                return <button key={note.name} className={`note-material-row ${isSelected ? 'selected' : ''}`} disabled={disabled} onClick={() => onToggle(note)} title={lp.rationale}>
                  <span className={`material-thumb kind-${kind}`}><span>{getNoteFamily(note).icon}</span></span>
                  <span className="material-copy"><strong>{note.name}</strong><small>{materialKindLabel(kind)} · {getNoteParent(note)}</small></span>
                  <span className="material-layer"><b>{layerCode(lp.typicalLayer)}</b><small>{lp.allowedLayers.map(layerCode).join('/')}</small></span>
                  <span className="material-add">{isSelected ? '✓' : '+'}</span>
                </button>;
              })}
            </div>
          </section>
        </div>

        <footer className="note-explorer-foot"><button className="ghost-button" onClick={onClear}>Clear selection</button><p><b>T/H/B</b> = typical / allowed layer · Notes List never forces a pyramid.</p><button className="primary-button" onClick={onClose}>Done · {locked.length} selected</button></footer>
      </section>
    </div>
  );
}

function summarizeKinds(notes: Note[]) {
  const kinds = [...new Set(notes.map((note) => materialKindLabel(getMaterialKind(note))))];
  return kinds.slice(0, 3).join(' · ');
}
