/* Quiz PHY321 — socle commun : thème, hors connexion, stockage local,
   chargement de la banque, liens vers le Carnet. Aucune dépendance. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  // Langue de la page : <html lang="fr"> ou <html lang="en">. t(fr, en) choisit le bon texte.
  const LANG = (document.documentElement.lang || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
  const t = (fr, en) => (LANG === 'en' ? en : fr);
  const LOCALE = t('fr-FR', 'en-GB');
  const ROOT = t('', '../');               // les pages anglaises sont dans en/
  const CH_PARAM = t('chapitre', 'chapter'); // ?chapitre=N est accepté dans les deux langues

  const CARNET = 'https://tchapetnjafa.github.io/quantum-workbook/' + t('', 'en/');
  const CHAPTERS = {
    1: { title: t('États quantiques', 'Quantum states'), page: t('1-etats-quantiques', '1-quantum-states') },
    2: { title: t('Mesure et opérateurs', 'Measurement and operators'), page: t('2-mesure-operateurs', '2-measurement-operators') },
    3: { title: t('Dynamique quantique', 'Quantum dynamics'), page: t('3-dynamique', '3-quantum-dynamics') },
    4: { title: t('Systèmes multi-qubits et intrication', 'Multi-qubit systems and entanglement'), page: t('4-intrication', '4-entanglement') },
    5: { title: t('Fonction d’état et espace continu', 'Wave function and continuous space'), page: t('5-fonction-etat', '5-wave-function') },
    6: { title: t('Oscillateur harmonique quantique', 'Quantum harmonic oscillator'), page: t('6-oscillateur', '6-harmonic-oscillator') }
  };
  /** Page d'un chapitre du Carnet. */
  const chapterURL = ch => CARNET + t('chapitres/', 'chapters/') + CHAPTERS[ch].page + '.html';
  const TYPES = LANG === 'en' ? {
    qcm: 'Multiple choice', vrai_faux: 'True or false', numerical: 'Calculation', matching: 'Matching',
    drag_drop: 'Sorting', hotspot: 'Diagram', flashcard: 'Flashcard', interpretation: 'Interpretation'
  } : {
    qcm: 'QCM', vrai_faux: 'Vrai ou faux', numerical: 'Calcul', matching: 'Associations',
    drag_drop: 'Classement', hotspot: 'Schéma', flashcard: 'Fiche', interpretation: 'Interprétation'
  };
  // Types corrigés automatiquement (seuls admis en mode examen)
  const AUTO_TYPES = ['qcm', 'vrai_faux', 'numerical', 'matching', 'drag_drop', 'hotspot'];
  const LEVELS = { easy: t('Facile', 'Easy'), medium: t('Moyen', 'Medium'), hard: t('Difficile', 'Hard') };

  /* ---------- hors connexion ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    addEventListener('load', () => {
      navigator.serviceWorker.register(ROOT + 'service-worker.js')
        .catch(err => console.warn(t('Mode hors connexion indisponible :', 'Offline mode unavailable:'), err.message));
    });
  }

  /* ---------- stockage (peut être bloqué : navigation privée) ---------- */
  const KEY = 'phy321.quiz.v1';
  const store = {
    read() {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
    },
    write(data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* stockage indisponible */ }
    },
    update(fn) { const next = fn(this.read()); this.write(next); return next; }
  };
  const session = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* ignoré */ } }
  };

  /** Mémorise une réponse : seen[id] = [vues, justes, dernière réponse juste (0/1)] */
  function recordAnswer(id, ok) {
    store.update(s => {
      const seen = { ...(s.seen || {}) };
      const [n, k] = seen[id] || [0, 0];
      seen[id] = [n + 1, k + (ok ? 1 : 0), ok ? 1 : 0];
      return { ...s, seen };
    });
  }

  /* ---------- thème : système → clair → sombre (clé partagée avec le Carnet) ---------- */
  const THEMES = ['auto', 'light', 'dark'];
  const themeLabel = LANG === 'en'
    ? { auto: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' }
    : { auto: 'Thème : système', light: 'Thème : clair', dark: 'Thème : sombre' };
  function applyTheme(t) {
    if (t === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    document.querySelectorAll('[data-theme-toggle]').forEach(b => {
      b.setAttribute('aria-label', themeLabel[t]); b.title = themeLabel[t];
    });
  }
  let theme = (() => { try { return localStorage.getItem('phy321.theme') || 'auto'; } catch { return 'auto'; } })();
  applyTheme(theme);
  document.addEventListener('DOMContentLoaded', () => applyTheme(theme));
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-theme-toggle]')) return;
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    try { localStorage.setItem('phy321.theme', theme); } catch { /* ignoré */ }
    applyTheme(theme);
  });

  /* ---------- bascule de langue : lit <link rel="alternate" hreflang="…"> de la page (même principe que le Carnet) ---------- */
  function initLangSwitch() {
    const other = LANG === 'en' ? 'fr' : 'en';
    const alt = document.querySelector(`link[rel="alternate"][hreflang="${other}"]`);
    const bar = document.querySelector('.topbar');
    if (!alt || !bar) return;
    const a = document.createElement('a');
    a.className = 'lang-switch';
    a.hreflang = other;
    a.lang = other;
    a.textContent = other.toUpperCase();
    a.title = other === 'en' ? 'Read in English' : 'Lire en français';
    a.setAttribute('aria-label', a.title);
    // la série en cours (?chapitre=…) suit dans l'autre langue
    const go = () => { a.href = alt.getAttribute('href') + location.search + location.hash; };
    go();
    addEventListener('hashchange', go);
    a.addEventListener('pointerdown', go);
    bar.insertBefore(a, bar.querySelector('[data-theme-toggle]'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLangSwitch); else initLangSwitch();

  /* ---------- banque de questions ---------- */
  let bankPromise = null;
  function loadBank() {
    if (!bankPromise) {
      bankPromise = fetch(ROOT + t('data/questions.json', 'data/questions.en.json'))
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(data => data.chapters.flatMap(c => c.questions.map(q => ({
          ...q,
          chapter: Number(c.chapter_id),
          // les anciennes questions « animation » sont des QCM : la simulation est dans le Carnet
          kind: q.type === 'animation' ? 'qcm' : q.type,
          // chemins d'images relatifs à la racine du site : à corriger depuis en/
          ...(ROOT && q.image_url && !/^(?:[a-z]+:|\/)/i.test(q.image_url) ? { image_url: ROOT + q.image_url } : {})
        }))));
    }
    return bankPromise;
  }

  /** Section du cours (« 1.2.3 » ou « 1.1-1.2 ») → page et ancre du Carnet. */
  /** Lien « signaler une erreur » : formulaire d'issue GitHub prérempli avec l'identifiant de la question. */
  function reportLink(q) {
    const params = new URLSearchParams({
      template: t('erreur.yml', 'error.yml'),
      title: `[${q.id}] `,
      question: q.id,
      page: location.href.split('#')[0]
    });
    return 'https://github.com/TchapetNjafa/quantum-quiz/issues/new?' + params;
  }

  function carnetLink(q) {
    const m = /([1-6])\.(\d+)/.exec(q.section_ref || '');
    const ch = m ? Number(m[1]) : q.chapter;
    const sec = m ? m[2] : null;
    const href = chapterURL(ch) + (sec ? '#s' + sec : '');
    return { href, label: sec ? t(`Carnet, section ${ch}.${sec}`, `Notebook, section ${ch}.${sec}`) : t(`Carnet, chapitre ${ch}`, `Notebook, chapter ${ch}`) };
  }

  /* ---------- configuration d'un quiz : tout passe par l'URL ----------
     ?chapitre=3&n=10&niveau=easy,medium&types=qcm,hotspot&mode=examen&ids=ch1-q001,… */
  function readConfig(search) {
    const p = new URLSearchParams(search);
    const list = (key, all) => {
      const l = (p.get(key) || '').split(',').filter(x => all.includes(x));
      return l.length ? l : all;
    };
    const ch = Number(p.get('chapitre') || p.get('chapter'));
    const n = Number(p.get('n'));
    return {
      chapter: ch >= 1 && ch <= 6 ? ch : null,
      n: n >= 1 && n <= 50 ? Math.round(n) : 10,
      levels: list('niveau', Object.keys(LEVELS)),
      types: list('types', Object.keys(TYPES)),
      exam: p.get('mode') === 'examen',
      ids: p.get('ids') ? p.get('ids').split(',').filter(Boolean) : null
    };
  }
  function configQuery(cfg) {
    const p = new URLSearchParams();
    if (cfg.ids) p.set('ids', cfg.ids.join(','));
    if (cfg.chapter) p.set(CH_PARAM, cfg.chapter);
    p.set('n', cfg.n);
    if (cfg.levels.length < 3) p.set('niveau', cfg.levels.join(','));
    if (cfg.types.length < Object.keys(TYPES).length) p.set('types', cfg.types.join(','));
    if (cfg.exam) p.set('mode', 'examen');
    return '?' + p.toString().replace(/%2C/g, ',');
  }
  /** Questions compatibles avec la configuration (sans tirage). */
  function pool(bank, cfg) {
    if (cfg.ids) return bank.filter(q => cfg.ids.includes(q.id));
    const types = cfg.exam ? cfg.types.filter(t => AUTO_TYPES.includes(t)) : cfg.types;
    return bank.filter(q => (!cfg.chapter || q.chapter === cfg.chapter) &&
      cfg.levels.includes(q.difficulty) && types.includes(q.kind));
  }
  /** Tirage équilibré : on alterne les formats pour en voir le plus possible. */
  function pick(bank, cfg) {
    const groups = {};
    shuffle(pool(bank, cfg)).forEach(q => (groups[q.kind] = groups[q.kind] || []).push(q));
    const queues = shuffle(Object.values(groups));
    const out = [];
    while (out.length < cfg.n && queues.some(g => g.length)) {
      for (const g of queues) if (g.length && out.length < cfg.n) out.push(g.shift());
    }
    return shuffle(out);
  }

  /* ---------- utilitaires ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function typeset(el) {
    const mj = window.MathJax;
    if (!el || !mj) return;
    if (mj.typesetPromise) { mj.typesetPromise([el]).catch(() => {}); return; }
    // MathJax pas encore chargé (script différé) : on attend son démarrage.
    const later = () => {
      const m = window.MathJax;
      if (m && m.startup && m.startup.promise) m.startup.promise.then(() => m.typesetPromise([el])).catch(() => {});
    };
    if (document.readyState === 'complete') setTimeout(later, 0); else addEventListener('load', later, { once: true });
  }
  const pct = (k, n) => n ? Math.round(100 * k / n) : 0;
  const plural = (n, one, many) => `${n} ${(LANG === 'en' ? n !== 1 : n > 1) ? many : one}`;
  const pctText = (k, n) => pct(k, n) + t(' %', '%');

  window.Q = {
    LANG, t, LOCALE, CH_PARAM, CARNET, CHAPTERS, chapterURL, TYPES, AUTO_TYPES, LEVELS,
    store, session, recordAnswer, loadBank, carnetLink, reportLink, esc, shuffle, typeset, pct, pctText, plural,
    readConfig, configQuery, pool, pick
  };
})();
