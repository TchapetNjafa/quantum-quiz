/* Quiz PHY321 — déroulement d'une série : entraînement (correction immédiate)
   ou examen (chronomètre, correction à la fin). La série survit à un rechargement. */
(() => {
  'use strict';
  const { loadBank, readConfig, pick, session, store, recordAnswer, CHAPTERS, plural } = window.Q;
  const { render, grade, feedbackHTML, metaLine } = window.Questions;
  const RUN = 'phy321.quiz.run';
  const $ = id => document.getElementById(id);

  let bank, cfg, run, handle;

  async function init() {
    cfg = readConfig(location.search);
    try { bank = await loadBank(); } catch (err) {
      fail('Impossible de charger les questions (' + err.message + '). Vérifiez la connexion puis rechargez la page.');
      return;
    }
    const saved = session.get(RUN);
    if (saved && saved.key === location.search && !saved.done) {
      run = saved;
    } else {
      const set = pick(bank, cfg);
      if (!set.length) { fail('Aucune question ne correspond à ces réglages.'); return; }
      const seconds = set.reduce((s, q) => s + (q.time_estimate || 60), 0);
      run = { key: location.search, ids: set.map(q => q.id), i: 0, answers: [], started: Date.now(),
        deadline: cfg.exam ? Date.now() + seconds * 1000 : null };
    }
    run.set = run.ids.map(id => bank.find(q => q.id === id)).filter(Boolean);
    save();
    const scope = cfg.ids ? 'Révision ciblée' : cfg.chapter ? `Chapitre ${cfg.chapter} · ${CHAPTERS[cfg.chapter].title}` : 'Tous les chapitres';
    $('q-scope').textContent = `${scope} · ${cfg.exam ? 'Examen' : 'Entraînement'}`;
    if (run.deadline) startTimer();
    $('validate').addEventListener('click', () => answer(handle.read()));
    $('skip').addEventListener('click', () => answer(null));
    $('next').addEventListener('click', advance);
    show();
  }

  function fail(msg) {
    $('quiz').innerHTML = `<div class="panel empty"><p>${msg}</p><a class="btn" href="index.html">Retour aux réglages</a></div>`;
  }

  const save = () => session.set(RUN, { ...run, set: undefined });

  function show() {
    const q = run.set[run.i];
    const n = run.set.length;
    $('q-count').textContent = `Question ${run.i + 1} sur ${n}`;
    $('q-bar').style.setProperty('--p', (run.i / n).toFixed(3));
    $('q-meta').innerHTML = metaLine(q);
    $('q-feedback').hidden = true;
    $('q-feedback').innerHTML = '';
    handle = render(q, $('q-body'), {
      changed: () => { $('validate').disabled = handle.read() === null; },
      submit: a => answer(a)
    });
    $('validate').hidden = handle.self;
    $('validate').disabled = true;
    $('skip').hidden = false;
    $('next').hidden = true;
    $('q-card').focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: 'instant' });
  }

  function answer(a) {
    if (run.answers[run.i]) return;              // déjà répondu (double clic)
    const q = run.set[run.i];
    const ok = grade(q, a);
    run.answers[run.i] = { id: q.id, a, ok };
    recordAnswer(q.id, ok);
    save();
    if (cfg.exam) { advance(); return; }
    handle.lock(a);
    const fb = $('q-feedback');
    fb.innerHTML = feedbackHTML(q, ok);
    fb.className = 'q-feedback ' + (ok ? 'ok' : 'ko');
    fb.hidden = false;
    window.Q.typeset(fb);
    $('validate').hidden = true;
    $('skip').hidden = true;
    const last = run.i === run.set.length - 1;
    $('next').textContent = last ? 'Voir les résultats' : 'Question suivante';
    $('next').hidden = false;
    $('next').focus({ preventScroll: true });
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function advance() {
    run.i += 1;
    save();
    if (run.i >= run.set.length) finish(); else show();
  }

  function finish() {
    const answers = run.set.map((q, i) => run.answers[i] || { id: q.id, a: null, ok: false });
    const ok = answers.filter(x => x.ok).length;
    const result = { query: run.key, exam: cfg.exam, chapter: cfg.chapter, review: !!cfg.ids,
      started: run.started, ended: Date.now(), answers };
    session.set('phy321.quiz.last', result);
    session.set(RUN, { ...run, set: undefined, done: true });
    store.update(s => ({ ...s, history: [...(s.history || []),
      { t: result.ended, ch: cfg.chapter, n: answers.length, ok, exam: cfg.exam }].slice(-50) }));
    location.href = 'results.html';
  }

  function startTimer() {
    const el = $('q-timer');
    el.hidden = false;
    const tick = () => {
      const left = Math.max(0, Math.round((run.deadline - Date.now()) / 1000));
      el.textContent = `${Math.floor(left / 60)} min ${String(left % 60).padStart(2, '0')} s`;
      el.classList.toggle('late', left < 60);
      if (left === 0) { clearInterval(timer); finish(); }
    };
    const timer = setInterval(tick, 1000);
    tick();
    el.title = `Temps total : ${plural(Math.round((run.deadline - run.started) / 60000), 'minute', 'minutes')}`;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
