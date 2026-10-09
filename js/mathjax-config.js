// MathJax 3 — doit être chargé AVANT le script MathJax.
// Notation de Dirac via le paquet braket : \ket{\psi}, \bra{\phi}, \braket{\phi|\psi}.
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    packages: { '[+]': ['braket'] },
    macros: {
      ketbra: ['\\left|#1\\middle\\rangle\\!\\middle\\langle#2\\right|', 2],
      expval: ['\\left\\langle #1 \\right\\rangle', 1],
      Tr: '\\operatorname{Tr}',
      dd: '\\mathrm{d}'
    }
  },
  loader: { load: ['[tex]/braket'] },
  chtml: { scale: 1, matchFontHeight: false },
  options: { renderActions: { addMenu: [] } }
};
