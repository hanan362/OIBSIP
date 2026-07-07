(function () {
  const STORAGE_KEY = 'ledger.tasks.v2';
  const THEME_KEY = 'ledger.theme.v1';

  const composer = document.getElementById('composer');
  const taskInput = document.getElementById('taskInput');
  const priorityInput = document.getElementById('priorityInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.getElementById('filterButtons');
  const pendingList = document.getElementById('pendingList');
  const completedList = document.getElementById('completedList');
  const pendingCount = document.getElementById('pendingCount');
  const completedCount = document.getElementById('completedCount');
  const pendingEmpty = document.getElementById('pendingEmpty');
  const completedEmpty = document.getElementById('completedEmpty');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const themeToggle = document.getElementById('themeToggle');
  const template = document.getElementById('taskTemplate');

  let tasks = [];
  let searchTerm = '';
  let activeFilter = 'all';
  let dragId = null;

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) { tasks = []; }
  }
  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (e) { console.error('Could not save tasks', e); }
  }

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  function formatDueDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate + 'T00:00:00') < today;
  }
  function makeId() {
    return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function matchesFilters(task) {
    if (searchTerm && !task.text.toLowerCase().includes(searchTerm)) return false;
    if (activeFilter === 'high' && task.priority !== 'high') return false;
    if (activeFilter === 'overdue' && !isOverdue(task)) return false;
    return true;
  }

  function render() {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    const visible = tasks.filter(matchesFilters);
    const pending = visible.filter((t) => !t.completed).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const completed = visible.filter((t) => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    pending.forEach((t) => pendingList.appendChild(buildTaskEl(t)));
    completed.forEach((t) => completedList.appendChild(buildTaskEl(t)));

    const totalAll = tasks.length;
    const completedAll = tasks.filter((t) => t.completed).length;

    pendingCount.textContent = `${pending.length} pending`;
    completedCount.textContent = `${completed.length} completed`;
    pendingEmpty.classList.toggle('is-visible', pending.length === 0);
    completedEmpty.classList.toggle('is-visible', completed.length === 0);

    const pct = totalAll === 0 ? 0 : Math.round((completedAll / totalAll) * 100);
    progressFill.style.width = pct + '%';
    progressLabel.textContent = totalAll === 0
      ? 'No tasks yet — add one above.'
      : `${completedAll} of ${totalAll} tasks complete (${pct}%)`;
  }

  function buildTaskEl(task) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    node.classList.toggle('task--completed', task.completed);

    const checkbox = node.querySelector('.task__checkbox');
    const textEl = node.querySelector('.task__text');
    const editInput = node.querySelector('.task__edit-input');
    const metaEl = node.querySelector('.task__meta');
    const chip = node.querySelector('.priority-chip');
    const editBtn = node.querySelector('.task__btn--edit');
    const deleteBtn = node.querySelector('.task__btn--delete');

    checkbox.checked = task.completed;
    textEl.textContent = task.text;
    editInput.value = task.text;

    chip.textContent = task.priority;
    chip.className = `priority-chip priority-${task.priority}`;

    const overdue = isOverdue(task);
    let metaText = task.completed
      ? `Added ${formatTime(task.createdAt)} · Completed ${formatTime(task.completedAt)}`
      : `Added ${formatTime(task.createdAt)}`;
    if (task.dueDate) metaText += ` · Due ${formatDueDate(task.dueDate)}${overdue ? ' (overdue)' : ''}`;
    metaEl.textContent = metaText;
    metaEl.classList.toggle('is-overdue', overdue);

    checkbox.addEventListener('change', () => toggleComplete(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    editBtn.addEventListener('click', () => enterEditMode(node, editInput));
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commitEdit(task.id, editInput.value, node);
      if (e.key === 'Escape') { node.classList.remove('task--editing'); editInput.value = task.text; }
    });
    editInput.addEventListener('blur', () => commitEdit(task.id, editInput.value, node));

    // ---------- Drag and drop reordering (pending list only) ----------
    if (!task.completed) {
      node.addEventListener('dragstart', () => {
        dragId = task.id;
        node.classList.add('is-dragging');
      });
      node.addEventListener('dragend', () => {
        node.classList.remove('is-dragging');
        pendingList.classList.remove('is-drag-over');
      });
    } else {
      node.removeAttribute('draggable');
    }

    return node;
  }

  pendingList.addEventListener('dragover', (e) => {
    e.preventDefault();
    pendingList.classList.add('is-drag-over');
    const afterEl = getDragAfterElement(pendingList, e.clientY);
    const draggingEl = pendingList.querySelector('.is-dragging');
    if (!draggingEl) return;
    if (afterEl == null) pendingList.appendChild(draggingEl);
    else pendingList.insertBefore(draggingEl, afterEl);
  });
  pendingList.addEventListener('dragleave', () => pendingList.classList.remove('is-drag-over'));
  pendingList.addEventListener('drop', () => {
    pendingList.classList.remove('is-drag-over');
    // Persist the new visual order back into the tasks array.
    const ids = [...pendingList.querySelectorAll('.task')].map((el) => el.dataset.id);
    ids.forEach((id, index) => {
      const t = tasks.find((task) => task.id === id);
      if (t) t.order = index;
    });
    saveTasks();
  });

  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.task:not(.is-dragging)')];
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  function enterEditMode(node, editInput) {
    node.classList.add('task--editing');
    editInput.focus();
    editInput.select();
  }

  function commitEdit(id, newText, node) {
    if (!node.classList.contains('task--editing')) return;
    node.classList.remove('task--editing');
    const trimmed = newText.trim();
    if (!trimmed) { render(); return; }
    const task = tasks.find((t) => t.id === id);
    if (task && task.text !== trimmed) { task.text = trimmed; saveTasks(); }
    render();
  }

  function addTask(text, priority, dueDate) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order ?? 0), 0);
    tasks.push({
      id: makeId(),
      text: trimmed,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
      order: maxOrder + 1,
    });
    saveTasks();
    render();
  }

  function toggleComplete(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value, priorityInput.value, dueDateInput.value);
    taskInput.value = '';
    dueDateInput.value = '';
    taskInput.focus();
  });

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  filterButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    [...filterButtons.children].forEach((b) => b.classList.toggle('is-active', b === btn));
    render();
  });

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, theme);
  }
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  loadTasks();
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  render();
})();
