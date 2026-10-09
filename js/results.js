/* Quiz PHY321 — page de résultats : score, bilan par format, corrigé détaillé. */
(() => {
  'use strict';
  const { loadBank, session, readConfig, configQuery, CHAPTERS, TYPES, CARNET, esc, pct, plural, typeset } = window.Q;
  const { answerText, feedbackHTML, metaLine } = window.Questions;
  const $ = id => document.getElementById(id);
  const SELF = ['flashcard', 'interpretation'];

  async function init() {
    const last = session.get('phy321.quiz.last');
    if (!last) {
      $('results').innerHTML = `<div class="panel empty"><p>Aucune série terminée dans cet onglet.</p><a class="btn" href="index.html">Lancer un quiz</a></div>`;
      return;
    }
    let bank;
    try { bank = await loadBank(); } catch (err) {
      $('results').innerHTML = `<div class="panel empty"><p>Impossible de charger les questions (${esc(err.message)}).</p></div>`;
      return;
    }
    const rows = last.answers.map(x => ({ ...x, q: bank.find(q => q.id === x.id) })).filter(x => x.q);
    const ok = rows.filter(r => r.ok).length;
    const minutes = Math.round((last.ended - last.started) / 60000);
    const scope = last.review ? 'Révision ciblée' : last.chapter ? `Chapitre ${last.chapter} · ${CHAPTERS[last.chapter].title}` : 'Tous les chapitres';

    $('r-scope').textContent = `${scope} · ${last.exam ? 'Examen' : 'Entraînement'}`;
    $('r-score').innerHTML = `${ok}<span>/${rows.length}</span>`;
    $('r-line').textContent = `${pct(ok, rows.length)} % de réponses justes · ${minutes < 1 ? 'moins d’une minute' : plural(minutes, 'minute', 'minutes')}`;

    // bilan par format
    const byType = {};
    rows.forEach(r => { const t = (byType[r.q.kind] = byType[r.q.kind] || [0, 0]); t[0] += r.ok ? 1 : 0; t[1] += 1; });
    $('r-types').innerHTML = Object.entries(byType).map(([k, [g, n]]) =>
      `<tr><th scope="row">${TYPES[k]}</th><td>${g} / ${n}</td><td><span class="mini-bar" style="--p:${(g / n).toFixed(2)}"></span></td></tr>`).join('');

    // actions
    const wrong = rows.filter(r => !r.ok).map(r => r.id);
    const cfg = readConfig(last.query);
    $('r-again').href = 'quiz.html' + last.query;
    $('r-settings').href = 'index.html' + (cfg.chapter ? '?chapitre=' + cfg.chapter : '');
    const retry = $('r-retry');
    if (wrong.length) {
      retry.href = 'quiz.html' + configQuery({ ...cfg, ids: wrong, n: wrong.length, exam: false });
      retry.textContent = wrong.length > 1 ? `Refaire les ${wrong.length} questions manquées` : 'Refaire la question manquée';
    } else retry.hidden = true;

    // chapitres du Carnet à revoir
    const weak = [...new Set(rows.filter(r => !r.ok).map(r => r.q.chapter))].sort();
    $('r-carnet').innerHTML = weak.length
      ? `À relire dans le Carnet : ${weak.map(c => `<a href="${CARNET}chapitres/${CHAPTERS[c].page}.html">chapitre ${c}, ${esc(CHAPTERS[c].title)}</a>`).join(' · ')}.`
      : 'Aucune erreur sur cette série.';

    // corrigé
    $('r-review').innerHTML = rows.map((r, i) => `
      <details class="review ${r.ok ? 'ok' : 'ko'}"${r.ok ? '' : ' open'}>
        <summary><span class="badge">${r.ok ? 'Juste' : (SELF.includes(r.q.kind) ? 'À revoir' : 'Faux')}</span><span class="r-num">${i + 1}</span>
          <span class="r-q">${esc(r.q.question || r.q.front)}</span></summary>
        <div class="review-body">
          <p class="q-meta">${metaLine(r.q)}</p>
          <div class="your"><b>Votre réponse :</b> ${answerText(r.q, r.a)}</div>
          ${feedbackHTML(r.q, r.ok, { verdict: false })}
        </div>
      </details>`).join('');
    typeset($('results'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
