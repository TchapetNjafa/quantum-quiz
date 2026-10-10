/* Quiz PHY321 — affichage, saisie et correction des huit formats de question.
   render(q, root, { changed, submit }) → { read(), lock(ok), self }
   grade(q, réponse) → booléen ; correctText / answerText pour le corrigé. */
(() => {
  'use strict';
  const { esc, shuffle, carnetLink, reportLink, TYPES, LEVELS, t } = window.Q;
  const TRUE = t('Vrai', 'True'), FALSE = t('Faux', 'False');
  let uidSeq = 0;
  const LETTERS = 'ABCDEFGH';

  /* Évaluation sûre d'une réponse numérique (même règle que le Carnet) :
     0.5, 1/2, 1/sqrt(2), 2*pi, 3e-4, π, √2, virgule décimale. */
  function parseNumber(raw) {
    let s = String(raw).trim().toLowerCase().replace(/,/g, '.').replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt').replace(/[×·]/g, '*').replace(/\s+/g, '');
    if (!s || s.length > 40) return NaN;
    if (!/^(?:[0-9.e+\-*/^()]|sqrt|pi)+$/.test(s)) return NaN;
    s = s.replace(/sqrt/g, 'Math.sqrt').replace(/pi/g, 'Math.PI').replace(/\^/g, '**');
    try {
      const v = Function('"use strict";return (' + s + ')')();
      return typeof v === 'number' && isFinite(v) ? v : NaN;
    } catch { return NaN; }
  }

  function figure(q) {
    if (!q.image_url || q.kind === 'hotspot') return '';
    return `<figure class="q-fig"><img src="${esc(q.image_url)}" alt="${esc(q.image_alt || '')}" loading="lazy"></figure>`;
  }

  /* ---------- un module par format ---------- */
  const kinds = {};

  kinds.qcm = {
    html: (q, id) => `<div class="opts" role="radiogroup" aria-label="${t('Réponses', 'Answers')}">${q.options.map((o, i) => `
      <label class="opt"><input type="radio" name="${id}" value="${i}"><span class="opt-key" aria-hidden="true">${LETTERS[i]}</span><span class="opt-text">${esc(o)}</span></label>`).join('')}</div>`,
    read: root => { const c = root.querySelector('input:checked'); return c ? Number(c.value) : null; },
    grade: (q, a) => a === Number(q.correct_answer),
    lock(root, q, a) {
      root.querySelectorAll('.opt').forEach((el, i) => {
        el.querySelector('input').disabled = true;
        if (i === Number(q.correct_answer)) el.classList.add('is-right');
        else if (i === a) el.classList.add('is-wrong');
      });
    },
    correct: q => esc(q.options[q.correct_answer]),
    answer: (q, a) => esc(q.options[a])
  };

  kinds.vrai_faux = {
    html: (q, id) => `<div class="opts opts-vf" role="radiogroup" aria-label="${t('Réponse', 'Answer')}">
      <label class="opt"><input type="radio" name="${id}" value="1"><span class="opt-text">${TRUE}</span></label>
      <label class="opt"><input type="radio" name="${id}" value="0"><span class="opt-text">${FALSE}</span></label></div>`,
    read: root => { const c = root.querySelector('input:checked'); return c ? c.value === '1' : null; },
    grade: (q, a) => a === Boolean(q.correct_answer),
    lock(root, q, a) {
      root.querySelectorAll('.opt').forEach(el => {
        const input = el.querySelector('input'); input.disabled = true;
        const v = input.value === '1';
        if (v === Boolean(q.correct_answer)) el.classList.add('is-right');
        else if (v === a) el.classList.add('is-wrong');
      });
    },
    correct: q => q.correct_answer ? TRUE : FALSE,
    answer: (q, a) => a ? TRUE : FALSE
  };

  kinds.numerical = {
    html: (q, id) => `<div class="num-answer">
      <label for="${id}" class="sr-only">${t('Votre réponse', 'Your answer')}</label>
      <input id="${id}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="${t('ex. 0.25 ou 1/4', 'e.g. 0.25 or 1/4')}">
      ${q.unit ? `<span class="unit">${esc(q.unit)}</span>` : ''}</div>
      <p class="q-help">${t('Expressions acceptées : 1/4, 1/sqrt(2), pi/3, 2.5e-3. Virgule ou point.', 'Accepted expressions: 1/4, 1/sqrt(2), pi/3, 2.5e-3. Comma or point.')}</p>`,
    read: root => { const v = root.querySelector('input').value.trim(); return v ? v : null; },
    grade(q, a) {
      const v = parseNumber(a), t = Number(q.correct_answer), tol = Number(q.tolerance) || 0;
      return Number.isFinite(v) && Math.abs(v - t) <= tol + 1e-9 * Math.max(1, Math.abs(t));
    },
    lock(root, q, a) {
      const input = root.querySelector('input');
      input.disabled = true;
      input.classList.add(kinds.numerical.grade(q, a) ? 'is-right' : 'is-wrong');
    },
    correct: q => `${esc(q.correct_answer)}${q.unit ? ' ' + esc(q.unit) : ''}${Number(q.tolerance) ? ` <span class="muted">${t(`(à ±${esc(q.tolerance)} près)`, `(within ±${esc(q.tolerance)})`)}</span>` : ''}`,
    answer: (q, a) => Number.isFinite(parseNumber(a)) ? esc(a) : `${esc(a)} <span class="muted">${t('(nombre non reconnu)', '(number not recognised)')}</span>`
  };

  /* Toucher une étiquette puis une case (ou glisser à la souris).
     single : une seule étiquette par case, l'ancienne retourne dans la réserve. */
  function tapPlace(root, ctl, single) {
    let picked = null;
    const pick = chip => {
      root.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      picked = chip;
    };
    const place = (chip, zone) => {
      const box = zone.querySelector('.dd-items') || zone;
      if (single && zone.dataset.zone !== '') {
        box.querySelectorAll('.chip').forEach(old => { if (old !== chip) root.querySelector('.dd-bank').append(old); });
      }
      box.append(chip);
      pick(null); ctl.changed();
    };
    root.addEventListener('click', e => {
      if (root.dataset.locked) return;
      const chip = e.target.closest('.chip');
      if (chip) { pick(picked === chip ? null : chip); return; }
      const zone = e.target.closest('[data-zone]');
      if (zone && picked) place(picked, zone);
    });
    root.addEventListener('dragstart', e => {
      const chip = e.target.closest('.chip');
      if (chip) { pick(chip); e.dataTransfer.setData('text/plain', chip.dataset.item); }
    });
    root.addEventListener('dragover', e => { if (e.target.closest('[data-zone]')) e.preventDefault(); });
    root.addEventListener('drop', e => {
      const zone = e.target.closest('[data-zone]');
      if (zone && picked) { e.preventDefault(); place(picked, zone); }
    });
  }

  kinds.matching = {
    html(q) {
      const choices = shuffle([...q.pairs.map(p => p.right), ...(q.distractors || [])]);
      return `<p class="q-help">${t('Touchez une proposition, puis la ligne qui lui correspond.', 'Tap an answer, then the row it belongs to.')}${q.distractors && q.distractors.length ? t(' Certaines propositions ne servent pas.', ' Some answers are not used.') : ''}</p>
        <div class="dd-bank" data-zone="">${choices.map((c, k) =>
          `<button type="button" class="chip" draggable="true" data-item="${k}" data-text="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}</div>
        <div class="dd-zones match-zones">${q.pairs.map((p, i) => `
          <div class="dd-zone" data-zone="${i}"><button type="button" class="dd-target">${esc(p.left)}</button><div class="dd-items"></div></div>`).join('')}</div>`;
    },
    setup: (root, q, ctl) => tapPlace(root, ctl, true),
    read(root) {
      const vals = [...root.querySelectorAll('.dd-zones .dd-zone')].map(z => { const c = z.querySelector('.chip'); return c ? c.dataset.text : null; });
      return vals.every(v => v !== null) ? vals : null;
    },
    grade: (q, a) => Array.isArray(a) && q.pairs.every((p, i) => a[i] === p.right),
    lock(root, q, a) {
      root.dataset.locked = '1';
      root.querySelectorAll('.chip').forEach(c => { c.disabled = true; });
      root.querySelectorAll('.dd-zones .dd-zone').forEach((z, i) => {
        const ok = a && a[i] === q.pairs[i].right;
        const chip = z.querySelector('.chip');
        if (chip) chip.classList.add(ok ? 'is-right' : 'is-wrong');
        if (!ok) z.insertAdjacentHTML('beforeend', `<p class="match-fix">${t('Attendu :', 'Expected:')} ${esc(q.pairs[i].right)}</p>`);
      });
    },
    correct: q => `<ul class="pairs">${q.pairs.map(p => `<li>${esc(p.left)} → ${esc(p.right)}</li>`).join('')}</ul>`,
    answer: (q, a) => `<ul class="pairs">${q.pairs.map((p, i) => `<li>${esc(p.left)} → ${esc(a[i])}</li>`).join('')}</ul>`
  };

  /* Classement : toucher une étiquette puis une case (ou glisser à la souris). */
  kinds.drag_drop = {
    html: q => `<p class="q-help">${t('Touchez une étiquette, puis la case où elle va.', 'Tap a label, then the box it belongs in.')}</p>
      <div class="dd-bank" data-zone="">${shuffle(q.draggable_items).map(it =>
        `<button type="button" class="chip" draggable="true" data-item="${esc(it.id)}" aria-pressed="false">${esc(it.text)}</button>`).join('')}</div>
      <div class="dd-zones">${q.drop_zones.map(z => `
        <div class="dd-zone" data-zone="${esc(z.id)}"><button type="button" class="dd-target">${esc(z.label)}</button><div class="dd-items"></div></div>`).join('')}</div>`,
    setup: (root, q, ctl) => tapPlace(root, ctl, false),
    read(root, q) {
      const map = {};
      root.querySelectorAll('.dd-zone .chip').forEach(c => { map[c.dataset.item] = c.closest('.dd-zone').dataset.zone; });
      return Object.keys(map).length === q.draggable_items.length ? map : null;
    },
    grade: (q, a) => !!a && q.draggable_items.every(it => a[it.id] === q.correct_matches[it.id]),
    lock(root, q, a) {
      root.dataset.locked = '1';
      const label = id => (q.drop_zones.find(z => z.id === id) || {}).label || id;
      root.querySelectorAll('.chip').forEach(c => {
        c.disabled = true;
        const want = q.correct_matches[c.dataset.item];
        const ok = a && a[c.dataset.item] === want;
        c.classList.add(ok ? 'is-right' : 'is-wrong');
        if (!ok) c.insertAdjacentHTML('beforeend', ` <small>→ ${esc(label(want))}</small>`);
      });
    },
    correct(q) {
      const label = id => (q.drop_zones.find(z => z.id === id) || {}).label || id;
      return `<ul class="pairs">${q.draggable_items.map(it => `<li>${esc(it.text)} → ${esc(label(q.correct_matches[it.id]))}</li>`).join('')}</ul>`;
    },
    answer(q, a) {
      const label = id => (q.drop_zones.find(z => z.id === id) || {}).label || id;
      return `<ul class="pairs">${q.draggable_items.map(it => `<li>${esc(it.text)} → ${esc(label(a[it.id]))}</li>`).join('')}</ul>`;
    }
  };

  /* Schéma cliquable : coordonnées des zones exprimées dans image_dimensions. */
  kinds.hotspot = {
    html: q => `<p class="q-help">${t('Touchez l’élément demandé sur le schéma.', 'Tap the requested part of the diagram.')}</p>
      <div class="hs-stage"><img src="${esc(q.image_url)}" alt="${esc(q.image_alt || '')}" draggable="false"><span class="hs-pick" hidden></span></div>
      <p class="hs-status" aria-live="polite"></p>`,
    setup(root, q, ctl) {
      const stage = root.querySelector('.hs-stage');
      const { width: W, height: H } = q.image_dimensions;
      stage.addEventListener('click', e => {
        if (root.dataset.locked) return;
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
        let best = null, bestD = Infinity;
        for (const h of q.hotspots) {
          const d = Math.hypot(x - h.x, y - h.y) / h.radius;
          if (d < bestD) { bestD = d; best = h; }
        }
        const mark = root.querySelector('.hs-pick');
        mark.hidden = false;
        mark.style.left = (100 * x / W) + '%'; mark.style.top = (100 * y / H) + '%';
        const hit = bestD <= 1.25 ? best : null;
        root.dataset.pick = hit ? hit.id : '';
        root.querySelector('.hs-status').textContent = hit ? t('Zone sélectionnée.', 'Area selected.') : t('Aucun élément ici : visez une partie du schéma.', 'Nothing here: aim at a part of the diagram.');
        ctl.changed();
      });
    },
    read: root => root.dataset.pick || null,
    grade: (q, a) => a === q.correct_hotspot,
    lock(root, q, a) {
      root.dataset.locked = '1';
      const stage = root.querySelector('.hs-stage');
      const { width: W, height: H } = q.image_dimensions;
      const ring = (h, cls) => stage.insertAdjacentHTML('beforeend',
        `<span class="hs-ring ${cls}" style="left:${100 * h.x / W}%;top:${100 * h.y / H}%;width:${200 * h.radius / W}%"></span>`);
      q.hotspots.forEach(h => {
        if (h.id === q.correct_hotspot) ring(h, 'is-right');
        else if (h.id === a) ring(h, 'is-wrong');
      });
    },
    correct: q => esc((q.hotspots.find(h => h.id === q.correct_hotspot) || {}).label || q.correct_hotspot),
    answer: (q, a) => esc((q.hotspots.find(h => h.id === a) || {}).label || a)
  };

  /* Formats auto-évalués : l'étudiant compare lui-même avec la réponse. */
  const selfButtons = (yes, no) => `<div class="self-eval" hidden>
      <button type="button" class="btn ok-btn" data-self="1">${yes}</button>
      <button type="button" class="btn ghost" data-self="0">${no}</button></div>`;

  kinds.flashcard = {
    self: true,
    html: q => `<div class="card-face"><p class="card-front">${esc(q.front)}</p>
      ${q.hint ? `<details class="hint"><summary>${t('Indice', 'Hint')}</summary><p>${esc(q.hint)}</p></details>` : ''}
      <div class="card-back" hidden><span class="box-title">${t('Verso', 'Back')}</span><p>${esc(q.back)}</p></div></div>
      <button type="button" class="btn ghost wide" data-flip>${t('Retourner la fiche', 'Turn the card over')}</button>
      ${selfButtons(t('Je savais', 'I knew it'), t('À revoir', 'To review'))}`,
    setup(root, q, ctl) {
      root.querySelector('[data-flip]').addEventListener('click', e => {
        e.currentTarget.hidden = true;
        root.querySelector('.card-back').hidden = false;
        root.querySelector('.self-eval').hidden = false;
        window.Q.typeset(root);
      });
      root.querySelectorAll('[data-self]').forEach(b => b.addEventListener('click', () => ctl.submit(b.dataset.self === '1')));
    },
    read: () => null,
    grade: (q, a) => a === true,
    lock: root => root.querySelectorAll('[data-self]').forEach(b => { b.disabled = true; }),
    correct: q => esc(q.back),
    answer: (q, a) => a ? t('Je savais', 'I knew it') : t('À revoir', 'To review')
  };

  kinds.interpretation = {
    self: true,
    html: (q, id) => `<label for="${id}" class="q-help">${t('Rédigez votre réponse en quelques lignes, puis comparez.', 'Write your answer in a few lines, then compare.')}</label>
      <textarea id="${id}" rows="5" class="long-answer"></textarea>
      <button type="button" class="btn ghost wide" data-reveal>${t('Comparer avec la réponse type', 'Compare with the model answer')}</button>
      <div class="sample" hidden><span class="box-title">${t('Réponse type', 'Model answer')}</span><p>${esc(q.sample_answer)}</p></div>
      ${selfButtons(t('Ma réponse contenait l’essentiel', 'My answer covered the key points'), t('Il me manquait l’essentiel', 'I missed the key points'))}`,
    setup(root, q, ctl) {
      root.querySelector('[data-reveal]').addEventListener('click', e => {
        e.currentTarget.hidden = true;
        root.querySelector('.sample').hidden = false;
        root.querySelector('.self-eval').hidden = false;
        window.Q.typeset(root);
      });
      root.querySelectorAll('[data-self]').forEach(b => b.addEventListener('click', () => ctl.submit(b.dataset.self === '1')));
    },
    read: () => null,
    grade: (q, a) => a === true,
    lock: root => { root.querySelector('textarea').readOnly = true; root.querySelectorAll('[data-self]').forEach(b => { b.disabled = true; }); },
    correct: q => esc(q.sample_answer),
    answer: (q, a) => a ? t('Réponse jugée complète', 'Answer judged complete') : t('Réponse jugée incomplète', 'Answer judged incomplete')
  };

  /* ---------- API ---------- */
  function render(q, root, ctl = {}) {
    const k = kinds[q.kind];
    const id = 'q' + (++uidSeq);
    const changed = ctl.changed || (() => {});
    const lab = q.type === 'animation'
      ? `<p class="lab-note">${t('Simulation associée :', 'Related simulation:')} <a href="${carnetLink(q).href}" target="_blank" rel="noopener">${carnetLink(q).label}</a>. ${t('Manipulez-la, puis répondez.', 'Try it, then answer.')}</p>` : '';
    root.innerHTML = `${lab}<div class="q-text">${esc(q.question || '')}</div>${figure(q)}<div class="q-input">${k.html(q, id)}</div>`;
    const input = root.querySelector('.q-input');
    input.addEventListener('input', changed);
    input.addEventListener('change', changed);
    if (k.setup) k.setup(input, q, { changed, submit: ctl.submit || (() => {}) });
    window.Q.typeset(root);
    return {
      self: !!k.self,
      read: () => k.read(input, q),
      lock: a => k.lock(input, q, a)
    };
  }

  const grade = (q, a) => a !== null && a !== undefined && kinds[q.kind].grade(q, a);
  const correctText = q => kinds[q.kind].correct(q);
  const answerText = (q, a) => (a === null || a === undefined) ? `<span class="muted">${t('Sans réponse', 'No answer')}</span>` : kinds[q.kind].answer(q, a);

  /** Bloc de correction : verdict, réponse attendue, explication, références. */
  function feedbackHTML(q, ok, { verdict = true } = {}) {
    const link = carnetLink(q);
    const showAnswer = !ok && !kinds[q.kind].self;
    return `${verdict ? `<p class="verdict ${ok ? 'ok' : 'ko'}">${ok ? t('Juste', 'Correct') : (kinds[q.kind].self ? t('À revoir', 'To review') : t('Faux', 'Wrong'))}</p>` : ''}
      ${showAnswer ? `<div class="expected"><b>${t('Réponse attendue :', 'Expected answer:')}</b> ${correctText(q)}</div>` : ''}
      ${q.explanation ? `<p class="explain">${esc(q.explanation)}</p>` : ''}
      ${q.formula ? `<p class="formula">${esc(q.formula)}</p>` : ''}
      <p class="refs"><span>${t('Cours', 'Lecture notes')}, § ${esc(q.section_ref || '—')}</span>
        <a href="${link.href}" target="_blank" rel="noopener">${link.label} →</a>
        <a class="report" href="${reportLink(q)}" target="_blank" rel="noopener">${t('Signaler une erreur', 'Report an error')}</a></p>`;
  }

  const metaLine = q => `<span>${t('Chapitre', 'Chapter')} ${q.chapter}</span><span>${TYPES[q.kind]}</span><span>${LEVELS[q.difficulty] || ''}</span>`;

  window.Questions = { render, grade, correctText, answerText, feedbackHTML, metaLine, parseNumber };
})();
