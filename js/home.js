/* Quiz PHY321 — accueil : chiffres réels, réglages d'une série, question du jour,
   statistiques locales. ?chapitre=N présélectionne un chapitre (liens du Carnet). */
(() => {
  'use strict';
  const { loadBank, store, recordAnswer, readConfig, configQuery, pool, CHAPTERS, TYPES, AUTO_TYPES, LEVELS,
    esc, pctText, plural, typeset, t, LOCALE, CH_PARAM } = window.Q;
  const { render, grade, feedbackHTML, metaLine } = window.Questions;
  const $ = id => document.getElementById(id);
  const LANG_EN = window.Q.LANG === 'en';

  let bank = [];

  async function init() {
    try { bank = await loadBank(); } catch (err) {
      $('avail').textContent = t('Impossible de charger les questions (' + err.message + '). Rechargez la page.',
        'The questions could not be loaded (' + err.message + '). Reload the page.');
      $('start').disabled = true;
      return;
    }
    figures();
    setupForm();
    daily();
    stats();
  }

  function figures() {
    const set = (k, v) => { document.querySelector(`[data-fig="${k}"]`).textContent = v; };
    set('questions', bank.length);
    set('chapters', new Set(bank.map(q => q.chapter)).size);
    set('types', new Set(bank.map(q => q.kind)).size);
  }

  /* ---------- réglages ---------- */
  function chips(root, entries, name, checked) {
    root.innerHTML = entries.map(([v, label]) =>
      `<label class="chip-check"><input type="checkbox" name="${name}" value="${v}"${checked.includes(v) ? ' checked' : ''}><span>${label}</span></label>`).join('');
  }
  function seg(root, value, onPick) {
    const btns = [...root.querySelectorAll('button')];
    const pick = v => { btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v)))); onPick(v); };
    btns.forEach(b => b.addEventListener('click', () => pick(b.dataset.v)));
    pick(value);
  }

  function setupForm() {
    const url = readConfig(location.search);
    const prefs = store.read().prefs || {};
    const cfg = {
      chapter: url.chapter || (location.search ? null : prefs.chapter || null),
      n: prefs.n || 10, levels: prefs.levels || Object.keys(LEVELS),
      types: prefs.types || Object.keys(TYPES), exam: !!prefs.exam
    };

    const sel = $('f-chapter');
    sel.insertAdjacentHTML('beforeend', Object.entries(CHAPTERS).map(([n, c]) =>
      `<option value="${n}">${n} · ${esc(c.title)} (${bank.filter(q => q.chapter === Number(n)).length})</option>`).join(''));
    sel.options[0].textContent = `${t('Tous les chapitres', 'All chapters')} (${bank.length})`;
    sel.value = cfg.chapter || '';

    chips($('f-levels'), Object.entries(LEVELS), 'niveau', cfg.levels);
    const present = Object.keys(TYPES).filter(t => bank.some(q => q.kind === t));
    chips($('f-types'), present.map(t => [t, TYPES[t]]), 'types', cfg.types);

    const form = $('config');
    const read = () => ({
      ...cfg,
      chapter: Number(sel.value) || null,
      levels: [...form.querySelectorAll('[name=niveau]:checked')].map(i => i.value),
      types: [...form.querySelectorAll('[name=types]:checked')].map(i => i.value)
    });
    function update() {
      const c = read();
      const n = pool(bank, c).length;
      $('f-types-count').textContent = t(`(${c.types.length} sur ${present.length})`, `(${c.types.length} of ${present.length})`);
      $('f-mode-help').textContent = c.exam
        ? t('Chronomètre, correction à la fin. Fiches et interprétations exclues (non corrigées automatiquement).',
          'Timed, marked at the end. Flashcards and interpretation questions are excluded (not marked automatically).')
        : t('Correction et explication après chaque réponse.', 'Correction and explanation after each answer.');
      const empty = !c.levels.length || !c.types.length || !n;
      $('avail').textContent = empty ? t('Aucune question avec ces réglages.', 'No questions with these settings.')
        : LANG_EN ? `${plural(n, 'question available', 'questions available')}${n < c.n ? `: the set will have ${n}` : ''}.`
        : `${plural(n, 'question disponible', 'questions disponibles')}${n < c.n ? ` : la série en comptera ${n}` : ''}.`;
      $('start').disabled = empty;
    }
    seg($('f-count'), cfg.n, v => { cfg.n = Number(v); update(); });
    seg($('f-mode'), cfg.exam ? 'exam' : 'train', v => { cfg.exam = v === 'exam'; update(); });
    form.addEventListener('change', update);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const c = read();
      store.update(s => ({ ...s, prefs: { chapter: c.chapter, n: c.n, levels: c.levels, types: c.types, exam: c.exam } }));
      location.href = 'quiz.html' + configQuery(c);
    });
  }

  /* ---------- question du jour : même question pour tous, le même jour ---------- */
  function daily() {
    const today = new Date().toISOString().slice(0, 10);
    const candidates = bank.filter(q => ['qcm', 'vrai_faux', 'numerical'].includes(q.kind));
    let h = 0;
    for (const ch of today) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const q = candidates[h % candidates.length];
    const done = (store.read().daily || {});
    $('daily-meta').innerHTML = metaLine(q);
    const btn = $('daily-check');
    const handle = render(q, $('daily-body'), { changed: () => { btn.disabled = handle.read() === null; } });
    const show = (a, ok) => {
      handle.lock(a);
      const fb = $('daily-feedback');
      fb.innerHTML = feedbackHTML(q, ok);
      fb.className = 'q-feedback ' + (ok ? 'ok' : 'ko');
      fb.hidden = false;
      btn.hidden = true;
      typeset(fb);
    };
    if (done.d === today && done.id === q.id) {
      show(done.a, done.ok);
      return;
    }
    btn.addEventListener('click', () => {
      const a = handle.read();
      const ok = grade(q, a);
      recordAnswer(q.id, ok);
      store.update(s => ({ ...s, daily: { d: today, id: q.id, a, ok } }));
      show(a, ok);
      stats();
    });
  }

  /* ---------- statistiques locales ---------- */
  function stats() {
    const s = store.read();
    const seen = s.seen || {};
    const history = s.history || [];
    const ids = Object.keys(seen).filter(id => bank.some(q => q.id === id));
    const lastOk = ids.filter(id => seen[id][2]).length;
    const toReview = ids.filter(id => !seen[id][2]);

    $('stat-grid').innerHTML = [
      [t('séries terminées', 'sets completed'), history.length],
      [t('questions déjà vues', 'questions seen'), `${ids.length}<small> / ${bank.length}</small>`],
      [t('réussies au dernier essai', 'correct at last attempt'), ids.length ? pctText(lastOk, ids.length) : '—'],
      [t('à revoir', 'to review'), toReview.length]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

    $('ch-bars').innerHTML = Object.entries(CHAPTERS).map(([n, c]) => {
      const inCh = bank.filter(q => q.chapter === Number(n));
      const seenCh = inCh.filter(q => seen[q.id]);
      const okCh = seenCh.filter(q => seen[q.id][2]).length;
      return `<li><a href="index.html?${CH_PARAM}=${n}" data-ch="${n}"><span class="cb-name">${n} · ${esc(c.title)}</span>
        <span class="cb-track" aria-hidden="true"><i style="--p:${(okCh / inCh.length).toFixed(3)}"></i></span>
        <span class="cb-val">${okCh} / ${inCh.length}</span></a></li>`;
    }).join('');

    $('history').innerHTML = history.length ? history.slice(-5).reverse().map(h =>
      `<li><span>${new Date(h.t).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}</span>
        <span>${h.ch ? t('Chapitre ', 'Chapter ') + h.ch : t('Tous chapitres', 'All chapters')}${h.exam ? t(' · examen', ' · exam') : ''}</span>
        <b>${h.ok} / ${h.n}</b></li>`).join('')
      : `<li class="muted">${t('Aucune série terminée pour l’instant.', 'No completed sets yet.')}</li>`;

    const review = $('review-btn');
    review.hidden = !toReview.length;
    if (toReview.length) {
      const n = Math.min(toReview.length, 20);
      review.href = 'quiz.html' + configQuery({ ...readConfig(''), ids: toReview, n });
      review.textContent = `${t('Revoir mes erreurs', 'Review my mistakes')} (${toReview.length})`;
    }
  }

  // un clic sur un chapitre des statistiques le présélectionne sans recharger
  document.addEventListener('click', e => {
    const a = e.target.closest('#ch-bars a');
    if (!a) return;
    e.preventDefault();
    $('f-chapter').value = a.dataset.ch;
    $('f-chapter').dispatchEvent(new Event('change', { bubbles: true }));
    $('config').scrollIntoView({ behavior: 'smooth' });
  });
  $('reset-btn').addEventListener('click', () => {
    if (!confirm(t('Effacer toutes vos statistiques et votre historique dans ce navigateur ?', 'Delete all your statistics and history in this browser?'))) return;
    store.update(s => ({ prefs: s.prefs }));
    stats();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
