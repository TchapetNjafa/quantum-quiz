/* Quiz PHY321 — fiches de révision (recto/verso).
   Paquet : les fiches de la banque + les QCM et vrai/faux retournés en fiches.
   Répétition simple : « À revoir » remet la fiche en tête, « Je savais » la fait reculer. */
(() => {
  'use strict';
  const { loadBank, store, shuffle, esc, typeset, CHAPTERS, carnetLink } = window.Q;
  const $ = id => document.getElementById(id);
  let deck = [], i = 0, flipped = false;

  function toCard(q) {
    if (q.kind === 'flashcard') return { id: q.id, ch: q.chapter, front: q.front, back: q.back, q };
    const answer = q.kind === 'qcm' ? q.options[q.correct_answer] : (q.correct_answer ? 'Vrai.' : 'Faux.');
    return { id: q.id, ch: q.chapter, front: q.question, back: answer, more: q.explanation, q };
  }

  async function init() {
    let bank;
    try { bank = await loadBank(); } catch (err) {
      $('fc-card').textContent = 'Impossible de charger les fiches (' + err.message + ').';
      return;
    }
    const all = bank.filter(q => ['flashcard', 'qcm', 'vrai_faux'].includes(q.kind)).map(toCard);
    const sel = $('fc-chapter');
    sel.insertAdjacentHTML('beforeend', Object.entries(CHAPTERS).map(([n, c]) => `<option value="${n}">${n} · ${esc(c.title)}</option>`).join(''));
    const ch = Number(new URLSearchParams(location.search).get('chapitre'));
    if (CHAPTERS[ch]) sel.value = String(ch);
    const build = () => {
      const boxes = store.read().boxes || {};
      const chosen = all.filter(c => !sel.value || c.ch === Number(sel.value));
      // les fiches les moins sues d'abord, ordre aléatoire à niveau égal
      deck = shuffle(chosen).sort((a, b) => (boxes[a.id] || 0) - (boxes[b.id] || 0));
      i = 0; show();
    };
    sel.addEventListener('change', build);
    $('fc-flip').addEventListener('click', flip);
    $('fc-yes').addEventListener('click', () => rate(true));
    $('fc-no').addEventListener('click', () => rate(false));
    build();
  }

  function show() {
    const c = deck[i];
    flipped = false;
    $('fc-pos').textContent = deck.length ? `Fiche ${i + 1} sur ${deck.length}` : 'Aucune fiche';
    if (!c) return;
    $('fc-card').innerHTML = `<span class="fc-side">Recto · chapitre ${c.ch}</span><p class="fc-text">${esc(c.front)}</p>`;
    $('fc-flip').hidden = false;
    $('fc-actions').hidden = true;
    typeset($('fc-card'));
  }

  function flip() {
    const c = deck[i];
    if (!c || flipped) return;
    flipped = true;
    const link = carnetLink(c.q);
    $('fc-card').innerHTML = `<span class="fc-side">Verso · § ${esc(c.q.section_ref || '')}</span><p class="fc-text">${esc(c.back)}</p>
      ${c.more ? `<p class="muted">${esc(c.more)}</p>` : ''}
      <p class="refs"><a href="${link.href}" target="_blank" rel="noopener">${link.label} →</a></p>`;
    $('fc-flip').hidden = true;
    $('fc-actions').hidden = false;
    typeset($('fc-card'));
  }

  function rate(known) {
    const c = deck[i];
    store.update(s => {
      const boxes = { ...(s.boxes || {}) };
      boxes[c.id] = known ? Math.min(4, (boxes[c.id] || 0) + 1) : 0;
      return { ...s, boxes };
    });
    i = (i + 1) % deck.length;
    show();
    $('fc-card').focus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
