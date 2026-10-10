/* Quiz PHY321 — page de résultats : score, bilan par format, corrigé détaillé. */
(() => {
  'use strict';
  const { loadBank, session, readConfig, configQuery, CHAPTERS, chapterURL, TYPES, CH_PARAM, esc, pctText, plural, typeset, t } = window.Q;
  const { answerText, feedbackHTML, metaLine } = window.Questions;
  const $ = id => document.getElementById(id);
  const SELF = ['flashcard', 'interpretation'];

  async function init() {
    const last = session.get('phy321.quiz.last');
    if (!last) {
      $('results').innerHTML = `<div class="panel empty"><p>${t('Aucune série terminée dans cet onglet.', 'No completed set in this tab.')}</p><a class="btn" href="index.html">${t('Lancer un quiz', 'Start a quiz')}</a></div>`;
      return;
    }
    let bank;
    try { bank = await loadBank(); } catch (err) {
      $('results').innerHTML = `<div class="panel empty"><p>${t('Impossible de charger les questions', 'The questions could not be loaded')} (${esc(err.message)}).</p></div>`;
      return;
    }
    const rows = last.answers.map(x => ({ ...x, q: bank.find(q => q.id === x.id) })).filter(x => x.q);
    const ok = rows.filter(r => r.ok).length;
    const minutes = Math.round((last.ended - last.started) / 60000);
    const scope = last.review ? t('Révision ciblée', 'Targeted review') : last.chapter ? `${t('Chapitre', 'Chapter')} ${last.chapter} · ${CHAPTERS[last.chapter].title}` : t('Tous les chapitres', 'All chapters');

    $('r-scope').textContent = `${scope} · ${last.exam ? t('Examen', 'Exam') : t('Entraînement', 'Practice')}`;
    $('r-score').innerHTML = `${ok}<span>/${rows.length}</span>`;
    $('r-line').textContent = `${pctText(ok, rows.length)} ${t('de réponses justes', 'correct')} · ${minutes < 1 ? t('moins d’une minute', 'under a minute') : plural(minutes, 'minute', 'minutes')}`;

    // bilan par format
    const byType = {};
    rows.forEach(r => { const t = (byType[r.q.kind] = byType[r.q.kind] || [0, 0]); t[0] += r.ok ? 1 : 0; t[1] += 1; });
    $('r-types').innerHTML = Object.entries(byType).map(([k, [g, n]]) =>
      `<tr><th scope="row">${TYPES[k]}</th><td>${g} / ${n}</td><td><span class="mini-bar" style="--p:${(g / n).toFixed(2)}"></span></td></tr>`).join('');

    // actions
    const wrong = rows.filter(r => !r.ok).map(r => r.id);
    const cfg = readConfig(last.query);
    $('r-again').href = 'quiz.html' + last.query;
    $('r-settings').href = 'index.html' + (cfg.chapter ? `?${CH_PARAM}=` + cfg.chapter : '');
    const retry = $('r-retry');
    if (wrong.length) {
      retry.href = 'quiz.html' + configQuery({ ...cfg, ids: wrong, n: wrong.length, exam: false });
      retry.textContent = wrong.length > 1 ? t(`Refaire les ${wrong.length} questions manquées`, `Retry the ${wrong.length} missed questions`) : t('Refaire la question manquée', 'Retry the missed question');
    } else retry.hidden = true;

    // chapitres du Carnet à revoir
    const weak = [...new Set(rows.filter(r => !r.ok).map(r => r.q.chapter))].sort();
    $('r-carnet').innerHTML = weak.length
      ? `${t('À relire dans le Carnet :', 'To reread in the Notebook:')} ${weak.map(c => `<a href="${chapterURL(c)}">${t('chapitre', 'chapter')} ${c}, ${esc(CHAPTERS[c].title)}</a>`).join(' · ')}.`
      : t('Aucune erreur sur cette série.', 'No mistakes in this set.');

    // corrigé
    $('r-review').innerHTML = rows.map((r, i) => `
      <details class="review ${r.ok ? 'ok' : 'ko'}"${r.ok ? '' : ' open'}>
        <summary><span class="badge">${r.ok ? t('Juste', 'Correct') : (SELF.includes(r.q.kind) ? t('À revoir', 'To review') : t('Faux', 'Wrong'))}</span><span class="r-num">${i + 1}</span>
          <span class="r-q">${esc(r.q.question || r.q.front)}</span></summary>
        <div class="review-body">
          <p class="q-meta">${metaLine(r.q)}</p>
          <div class="your"><b>${t('Votre réponse :', 'Your answer:')}</b> ${answerText(r.q, r.a)}</div>
          ${feedbackHTML(r.q, r.ok, { verdict: false })}
        </div>
      </details>`).join('');
    typeset($('results'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
