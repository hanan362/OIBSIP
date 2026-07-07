(function () {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const memoryFlag = document.getElementById('memoryFlag');
  const pad = document.getElementById('pad');
  const copyBtn = document.getElementById('copyBtn');
  const themeToggle = document.getElementById('themeToggle');
  const historyToggle = document.getElementById('historyToggle');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const clearHistoryBtn = document.getElementById('clearHistory');

  const OP_MAP = { '÷': '/', '×': '*', '−': '-', '+': '+' };
  const HISTORY_KEY = 'slab.calc.history.v1';
  const THEME_KEY = 'slab.calc.theme.v1';

  let state = {
    tokens: [],
    current: '0',
    justEvaluated: false,
    error: false,
  };
  let memory = 0;
  let history = [];

  function render() {
    expressionEl.textContent = state.tokens.join(' ');
    resultEl.textContent = state.error ? 'Error' : state.current;
    memoryFlag.classList.toggle('is-active', memory !== 0);
  }

  function resetAll() {
    state = { tokens: [], current: '0', justEvaluated: false, error: false };
    render();
  }

  function flashKey(btn) {
    if (!btn) return;
    btn.classList.remove('is-flash');
    // Force reflow so the animation can restart on repeated presses.
    void btn.offsetWidth;
    btn.classList.add('is-flash');
  }

  function inputDigit(d) {
    if (state.error) resetAll();
    if (state.justEvaluated) {
      state.tokens = [];
      state.justEvaluated = false;
    }
    if (d === '.' && state.current.includes('.')) return;
    if (state.current === '0' && d !== '.') {
      state.current = d;
    } else {
      state.current += d;
    }
    render();
  }

  function inputOperator(op) {
    if (state.error) return;
    if (state.justEvaluated) state.justEvaluated = false;
    state.tokens.push(state.current);
    state.tokens.push(op);
    state.current = '0';
    render();
  }

  function backspace() {
    if (state.error) { resetAll(); return; }
    state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
    render();
  }

  function percent() {
    if (state.error) return;
    state.current = String(parseFloat(state.current || '0') / 100);
    render();
  }

  function toggleSign() {
    if (state.error) return;
    const val = parseFloat(state.current || '0');
    state.current = String(val * -1);
    render();
  }

  function applyUnary(fn, label) {
    if (state.error) return;
    const val = parseFloat(state.current || '0');
    try {
      const out = fn(val);
      if (out === null || !isFinite(out)) throw new Error('math error');
      const rounded = Math.round(out * 1e10) / 1e10;
      pushHistory(`${label}(${val})`, rounded);
      state.current = String(rounded);
      state.justEvaluated = true;
    } catch (e) {
      state.error = true;
      state.current = 'Error';
    }
    render();
  }

  // ---------- Memory ----------
  function memoryClear() { memory = 0; render(); }
  function memoryRecall() {
    state.current = String(memory);
    state.justEvaluated = true;
    render();
  }
  function memoryAdd() { memory += parseFloat(state.current || '0'); render(); }
  function memorySubtract() { memory -= parseFloat(state.current || '0'); render(); }

  // ---------- Evaluation ----------
  function evaluateExpression(tokens) {
    const pass1 = [];
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t === '×' || t === '÷') {
        const left = parseFloat(pass1.pop());
        const right = parseFloat(tokens[i + 1]);
        let val;
        if (t === '×') val = left * right;
        else {
          if (right === 0) throw new Error('div by zero');
          val = left / right;
        }
        pass1.push(String(val));
        i += 2;
      } else {
        pass1.push(t);
        i += 1;
      }
    }
    let acc = parseFloat(pass1[0]);
    for (let j = 1; j < pass1.length; j += 2) {
      const op = pass1[j];
      const right = parseFloat(pass1[j + 1]);
      if (op === '+') acc += right;
      else if (op === '−') acc -= right;
    }
    return acc;
  }

  function evaluate() {
    if (state.error) return;
    const finalTokens = [...state.tokens, state.current];
    const exprLabel = finalTokens.join(' ');
    try {
      const value = finalTokens.length === 1
        ? parseFloat(finalTokens[0])
        : evaluateExpression(finalTokens);
      if (!isFinite(value)) throw new Error('Division by zero');
      const rounded = Math.round(value * 1e10) / 1e10;
      if (state.tokens.length > 0) pushHistory(exprLabel, rounded);
      state.tokens = [];
      state.current = String(rounded);
      state.justEvaluated = true;
      state.error = false;
    } catch (e) {
      state.error = true;
      state.tokens = [];
      state.current = 'Error';
    }
    render();
  }

  // ---------- History ----------
  function loadHistory() {
    try { history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { history = []; }
  }
  function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  }
  function pushHistory(expr, result) {
    history.unshift({ expr, result, at: Date.now() });
    history = history.slice(0, 50);
    saveHistory();
    renderHistory();
  }
  function renderHistory() {
    historyList.innerHTML = '';
    historyEmpty.style.display = history.length ? 'none' : 'block';
    history.forEach((h) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="h-expr">${h.expr} =</span><span class="h-result">${h.result}</span>`;
      li.addEventListener('click', () => {
        state.tokens = [];
        state.current = String(h.result);
        state.justEvaluated = true;
        render();
      });
      historyList.appendChild(li);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    saveHistory();
    renderHistory();
  });

  historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('is-hidden');
  });

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, theme);
  }
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ---------- Copy ----------
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.current);
      copyBtn.textContent = '✓';
      setTimeout(() => { copyBtn.textContent = '⧉'; }, 1000);
    } catch (e) {
      // Clipboard API may be unavailable (e.g. non-HTTPS); fail silently.
    }
  });

  // ---------- Input wiring ----------
  pad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    flashKey(btn);

    if (btn.dataset.num !== undefined) { inputDigit(btn.dataset.num); return; }
    if (btn.dataset.op !== undefined) { inputOperator(btn.dataset.op); return; }

    switch (btn.dataset.action) {
      case 'clear': resetAll(); break;
      case 'backspace': backspace(); break;
      case 'percent': percent(); break;
      case 'sign': toggleSign(); break;
      case 'equals': evaluate(); break;
      case 'sqrt': applyUnary((v) => (v < 0 ? null : Math.sqrt(v)), '√'); break;
      case 'square': applyUnary((v) => v * v, 'sqr'); break;
      case 'inverse': applyUnary((v) => (v === 0 ? null : 1 / v), '1/'); break;
      case 'mc': memoryClear(); break;
      case 'mr': memoryRecall(); break;
      case 'mplus': memoryAdd(); break;
      case 'mminus': memorySubtract(); break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
    else if (e.key === '.') inputDigit('.');
    else if (e.key === '+') inputOperator('+');
    else if (e.key === '-') inputOperator('−');
    else if (e.key === '*') inputOperator('×');
    else if (e.key === '/') { e.preventDefault(); inputOperator('÷'); }
    else if (e.key === 'Enter' || e.key === '=') evaluate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') resetAll();
    else if (e.key === '%') percent();
  });

  // ---------- Init ----------
  loadHistory();
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  renderHistory();
  render();
})();
