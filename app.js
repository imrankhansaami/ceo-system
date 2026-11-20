/*
 * CEO System — a minimal, local-first goals tracker.
 * No build step and no JavaScript dependencies. Your data stays in this browser.
 * Opened with the isti'adhah and the basmalah; closed with alhamdulillah.
 */
(function () {
  'use strict';

  var STORE_KEY = 'ceo-system:goals:v1';

  var el = {
    form: document.getElementById('add-form'),
    title: document.getElementById('new-title'),
    due: document.getElementById('new-due'),
    list: document.getElementById('goals'),
    empty: document.getElementById('empty'),
    summary: document.getElementById('summary'),
    stamp: document.getElementById('stamp'),
    overall: document.getElementById('overall-fill'),
    filters: document.getElementById('filters'),
    count: document.getElementById('count'),
    exportBtn: document.getElementById('export'),
    importBtn: document.getElementById('import'),
    importFile: document.getElementById('import-file'),
    reset: document.getElementById('reset')
  };

  var goals = load();
  var filter = 'all';

  /* ---------------- storage ---------------- */

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function clampPct(value) {
    var n = Math.round(Number(value));
    if (!isFinite(n)) return 0;
    return Math.min(100, Math.max(0, n));
  }

  function normalize(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var title = String(raw.title == null ? '' : raw.title).trim().slice(0, 200);
    if (!title) return null;
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
      title: title,
      progress: clampPct(raw.progress),
      due: /^\d{4}-\d{2}-\d{2}$/.test(raw.due) ? raw.due : '',
      done: !!raw.done,
      createdAt: Number(raw.createdAt) || Date.now()
    };
  }

  function load() {
    var raw;
    try {
      raw = localStorage.getItem(STORE_KEY);
    } catch (e) {
      return [];
    }
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      var list = Array.isArray(parsed) ? parsed : parsed && parsed.goals;
      if (!Array.isArray(list)) return [];
      return list.map(normalize).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(goals));
    } catch (e) {
      /* private mode or full storage: keep working in memory */
    }
  }

  /* ---------------- helpers ---------------- */

  function find(id) {
    for (var i = 0; i < goals.length; i++) {
      if (goals[i].id === id) return goals[i];
    }
    return null;
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function formatDue(iso) {
    var parts = iso.split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var opts = d.getFullYear() === new Date().getFullYear()
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
  }

  function sortGoals(a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.due !== b.due) {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due < b.due ? -1 : 1;
    }
    return a.createdAt - b.createdAt;
  }

  /* ---------------- rendering ---------------- */

  function committed() {
    save();
    updateSummary();
  }

  function updateSummary() {
    var total = goals.length;
    var active = 0;
    var sum = 0;
    for (var i = 0; i < goals.length; i++) {
      if (!goals[i].done) active++;
      sum += goals[i].progress;
    }
    var avg = total ? Math.round(sum / total) : 0;

    el.overall.style.width = avg + '%';

    if (total && active === 0) {
      el.summary.textContent =
        'Masha\u2019Allah \u2014 ' + (total === 1 ? 'the goal is' : 'all goals are') + ' complete.';
      el.summary.classList.add('is-complete');
    } else {
      el.summary.textContent = total
        ? active + ' active of ' + total + ' \u00b7 ' + avg + '% average progress'
        : 'No goals yet.';
      el.summary.classList.remove('is-complete');
    }
    el.count.textContent = total
      ? total + (total === 1 ? ' goal' : ' goals')
      : '';
  }

  function makeCheck(goal) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'check';
    btn.setAttribute('aria-pressed', goal.done ? 'true' : 'false');
    btn.setAttribute('aria-label', goal.done ? 'Mark as active' : 'Mark as done');
    btn.innerHTML =
      '<svg viewBox="0 0 12 12" aria-hidden="true">' +
      '<path d="M2 6.4 4.6 9 10 3.2" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.addEventListener('click', function () {
      goal.done = !goal.done;
      committed();
      render();
    });
    return btn;
  }

  function makeTitle(goal) {
    var span = document.createElement('span');
    span.className = 'title';
    span.textContent = goal.title;
    span.title = 'Click to rename';
    span.tabIndex = 0;
    span.addEventListener('click', function () {
      startRename(goal, span);
    });
    span.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startRename(goal, span);
      }
    });
    return span;
  }

  function startRename(goal, span) {
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'title-edit';
    input.value = goal.title;
    input.setAttribute('aria-label', 'Rename goal');
    input.maxLength = 200;
    span.replaceWith(input);
    input.focus();
    input.select();

    var settled = false;
    function finish(keep) {
      if (settled) return;
      settled = true;
      var next = input.value.trim();
      if (keep && next) goal.title = next.slice(0, 200);
      committed();
      render();
    }

    input.addEventListener('blur', function () {
      finish(true);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        finish(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finish(false);
      }
    });
  }

  function makeDue(goal) {
    if (!goal.due) return null;
    var span = document.createElement('span');
    span.className = 'due';
    span.textContent = formatDue(goal.due);
    var overdue = !goal.done && goal.due < today();
    if (overdue) {
      span.classList.add('is-overdue');
      span.title = 'Past its target date';
    }
    return span;
  }

  function makeBar(goal) {
    var wrap = document.createElement('div');
    wrap.className = 'bar';

    var range = document.createElement('input');
    range.type = 'range';
    range.className = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '5';
    range.value = String(goal.progress);
    range.style.setProperty('--p', goal.progress);
    range.setAttribute('aria-label', 'Progress for ' + goal.title);

    var pct = document.createElement('span');
    pct.className = 'pct';
    pct.textContent = goal.progress + '%';

    range.addEventListener('input', function () {
      goal.progress = clampPct(range.value);
      range.style.setProperty('--p', goal.progress);
      pct.textContent = goal.progress + '%';
      updateSummary();
    });

    range.addEventListener('change', function () {
      if (goal.progress === 100) goal.done = true;
      committed();
      render();
    });

    wrap.appendChild(range);
    wrap.appendChild(pct);
    return wrap;
  }

  function makeDelete(goal) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'del';
    btn.textContent = '\u00d7';
    btn.setAttribute('aria-label', 'Delete ' + goal.title);
    btn.title = 'Delete';
    btn.addEventListener('click', function () {
      goals = goals.filter(function (g) {
        return g.id !== goal.id;
      });
      committed();
      render();
    });
    return btn;
  }

  function goalNode(goal) {
    var li = document.createElement('li');
    li.className = 'goal' + (goal.done ? ' is-done' : '');
    li.dataset.id = goal.id;

    var body = document.createElement('div');
    body.className = 'body';

    var line = document.createElement('div');
    line.className = 'line';
    line.appendChild(makeTitle(goal));
    var due = makeDue(goal);
    if (due) line.appendChild(due);

    body.appendChild(line);
    body.appendChild(makeBar(goal));

    li.appendChild(makeCheck(goal));
    li.appendChild(body);
    li.appendChild(makeDelete(goal));
    return li;
  }

  function visibleGoals() {
    return goals.slice().sort(sortGoals).filter(function (g) {
      if (filter === 'active') return !g.done;
      if (filter === 'done') return g.done;
      return true;
    });
  }

  function render() {
    var shown = visibleGoals();
    el.list.textContent = '';
    shown.forEach(function (goal) {
      el.list.appendChild(goalNode(goal));
    });

    el.empty.hidden = shown.length > 0;
    el.empty.textContent = goals.length
      ? 'Nothing in this view.'
      : 'No goals yet \u2014 add your first one above.';

    updateSummary();
  }

  /* ---------------- events ---------------- */

  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = el.title.value.trim();
    if (!title) return;
    goals.push({
      id: uid(),
      title: title.slice(0, 200),
      progress: 0,
      due: el.due.value || '',
      done: false,
      createdAt: Date.now()
    });
    el.title.value = '';
    el.due.value = '';
    if (filter === 'done') setFilter('all');
    committed();
    render();
    el.title.focus();
  });

  function setFilter(next) {
    filter = next;
    var chips = el.filters.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('is-on', chips[i].dataset.filter === next);
    }
    render();
  }

  el.filters.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (chip) setFilter(chip.dataset.filter);
  });

  el.exportBtn.addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(goals, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ceo-goals-' + today() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });

  el.importBtn.addEventListener('click', function () {
    el.importFile.click();
  });

  el.importFile.addEventListener('change', function () {
    var file = el.importFile.files && el.importFile.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var list;
      try {
        var parsed = JSON.parse(String(reader.result));
        var raw = Array.isArray(parsed) ? parsed : parsed && parsed.goals;
        list = Array.isArray(raw) ? raw.map(normalize).filter(Boolean) : [];
      } catch (e) {
        list = [];
      }
      el.importFile.value = '';
      if (!list.length) {
        window.alert('No goals found in that file.');
        return;
      }
      if (
        goals.length &&
        !window.confirm(
          'Replace your ' + goals.length + ' goal(s) with the ' + list.length + ' from this file?'
        )
      ) {
        return;
      }
      goals = list;
      committed();
      render();
    };
    reader.readAsText(file);
  });

  el.reset.addEventListener('click', function () {
    if (!goals.length) return;
    if (!window.confirm('Delete all ' + goals.length + ' goal(s)? This cannot be undone.')) return;
    goals = [];
    committed();
    render();
  });

  document.addEventListener('keydown', function (e) {
    var tag = e.target.tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault();
      el.title.focus();
    }
  });

  /* ---------------- init ---------------- */

  el.stamp.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  if (goals.length && filter === 'all') setFilter('all');
  else render();
})();
