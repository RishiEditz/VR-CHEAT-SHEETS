(function () {
  'use strict';

  var QUIZ = [{"q": "Which keyword picks the columns you want from a table?", "options": ["SELECT", "GET", "PULL", "SHOW"], "why": "SELECT lists the columns to return."}, {"q": "Which clause keeps only the rows that match a condition?", "options": ["WHERE", "FILTER", "IF", "ONLY"], "why": "WHERE filters single rows before any grouping."}, {"q": "How do you check whether a value is missing?", "options": ["IS NULL", "= NULL", "== NULL", "= ''"], "why": "= NULL never matches, so use IS NULL or IS NOT NULL."}, {"q": "Which clause sorts the result?", "options": ["ORDER BY", "GROUP BY", "ARRANGE BY", "SORT ALL"], "why": "ORDER BY sorts rows. Add DESC for high to low."}, {"q": "Which keyword returns only the first N rows in MySQL, PostgreSQL and SQLite?", "options": ["LIMIT", "TOP", "FIRST", "MAXROWS"], "why": "SQL Server uses TOP N instead of LIMIT."}, {"q": "What does GROUP BY do?", "options": ["Puts rows with the same value together so totals run per group", "Sorts rows alphabetically", "Removes duplicate tables", "Joins two tables together"], "why": "COUNT, SUM and the other totals then work for each group."}, {"q": "Which clause filters groups after totals are calculated?", "options": ["HAVING", "WHERE", "ON", "LIMIT"], "why": "HAVING filters groups after aggregation; WHERE filters rows before it."}, {"q": "Which join keeps every row from the left table even with no match?", "options": ["LEFT JOIN", "INNER JOIN", "UNION", "EXCEPT"], "why": "Unmatched left rows get NULL in the right table's columns."}, {"q": "Which set operator returns rows from the first query that the second query does not return?", "options": ["EXCEPT", "UNION", "INTERSECT", "JOIN"], "why": "EXCEPT subtracts the second result from the first."}, {"q": "Which statement adds new rows to a table?", "options": ["INSERT", "ADD", "APPEND", "CREATE ROW"], "why": "INSERT INTO table (...) VALUES (...) adds a row."}, {"q": "What happens if you run UPDATE or DELETE without a WHERE clause?", "options": ["Every row is changed or deleted", "Only the first row changes", "Nothing happens", "SQL asks you to confirm first"], "why": "Without WHERE, the change applies to the whole table."}, {"q": "Which command undoes changes that were not committed yet?", "options": ["ROLLBACK", "UNDO", "REVERT", "RESET"], "why": "ROLLBACK cancels the changes since the last COMMIT in a transaction."}, {"q": "Which statement deletes a whole table, structure and data included?", "options": ["DROP TABLE", "DELETE TABLE", "REMOVE TABLE", "CLEAR TABLE"], "why": "DROP TABLE removes the table for good."}, {"q": "What does a window function like ROW_NUMBER do?", "options": ["Numbers each row without merging rows", "Merges rows into one", "Deletes duplicate rows", "Creates a new table"], "why": "OVER lets it number or rank rows and keep all of them."}, {"q": "What does EXPLAIN do?", "options": ["Shows the plan the database will use to run a query", "Runs the query and deletes the output", "Creates an index automatically", "Exports the table to a CSV file"], "why": "Use the plan to spot slow full table scans."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/sql/';
  var THEME_KEY = 'sql-cheat-theme';
  var root = document.documentElement;
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var body = document.getElementById('quiz-body');
  var state = { items: [], pos: 0, score: 0, lastKey: '' };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1600);
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  /* Theme */
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
  var toggle = document.getElementById('theme-toggle');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    toggle.textContent = t === 'light' ? 'Dark mode' : 'Light mode';
  }
  setTheme(saved === 'light' ? 'light' : 'dark');
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked: keep going */ }
  });

  /* Tap to copy */
  document.querySelectorAll('.card').forEach(function (btn) {
    var tag = btn.querySelector('.tap');
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-cmd')).then(function (ok) {
        if (ok) {
          btn.classList.add('copied');
          tag.textContent = 'Copied';
          toast('Copied to clipboard');
          setTimeout(function () {
            btn.classList.remove('copied');
            tag.textContent = 'Tap to copy';
          }, 1400);
        } else {
          toast('Copy failed. Select the text instead.');
        }
      });
    });
  });

  /* Quiz */
  function buildRun() {
    var order = [];
    var key = '';
    var tries = 0;
    do {
      order = shuffle(QUIZ.map(function (_, i) { return i; }));
      key = order.join(',');
      tries++;
    } while (key === state.lastKey && tries < 50);
    state.lastKey = key;
    state.items = order.map(function (qi) {
      var q = QUIZ[qi];
      /* the correct answer is listed first in the data; shuffle the options */
      var opts = shuffle(q.options.map(function (text, idx) {
        return { text: text, correct: idx === 0 };
      }));
      return { q: q.q, why: q.why, opts: opts };
    });
    state.pos = 0;
    state.score = 0;
  }

  function renderStart() {
    body.innerHTML = '';
    body.appendChild(el('p', 'quiz-lead', 'Fifteen questions from the five pages. The order of questions and answers changes every time.'));
    var go = el('button', 'btn primary', 'Start the quiz');
    go.type = 'button';
    go.addEventListener('click', function () { buildRun(); renderQuestion(); });
    body.appendChild(go);
  }

  function renderQuestion() {
    var item = state.items[state.pos];
    body.innerHTML = '';
    var top = el('div', 'quiz-top');
    top.appendChild(el('span', 'quiz-count', 'Question ' + (state.pos + 1) + ' of ' + TOTAL));
    var bar = el('div', 'bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(TOTAL));
    bar.setAttribute('aria-valuenow', String(state.pos + 1));
    var fill = el('div', 'bar-fill');
    fill.style.width = ((state.pos + 1) / TOTAL * 100) + '%';
    bar.appendChild(fill);
    top.appendChild(bar);
    body.appendChild(top);
    body.appendChild(el('h3', 'quiz-q', item.q));

    var list = el('div', 'opts');
    var answered = false;
    var why = el('p', 'quiz-why');
    why.hidden = true;
    var next = el('button', 'btn primary', state.pos === TOTAL - 1 ? 'See my score' : 'Next');
    next.type = 'button';
    next.hidden = true;

    item.opts.forEach(function (o) {
      var b = el('button', 'opt', o.text);
      b.type = 'button';
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var all = list.querySelectorAll('.opt');
        for (var i = 0; i < all.length; i++) {
          all[i].disabled = true;
          if (item.opts[i].correct) all[i].classList.add('correct');
        }
        if (o.correct) {
          state.score++;
        } else {
          b.classList.add('wrong');
        }
        why.textContent = (o.correct ? 'Right. ' : 'Not quite. ') + item.why;
        why.hidden = false;
        next.hidden = false;
        next.focus();
      });
      list.appendChild(b);
    });

    next.addEventListener('click', function () {
      state.pos++;
      if (state.pos < TOTAL) renderQuestion(); else renderResult();
    });

    body.appendChild(list);
    body.appendChild(why);
    body.appendChild(next);
  }

  function bandMessage(s) {
    if (s >= 13) return 'Sharp work. You know your SQL.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the SQL Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
  }

  function shareResult(s) {
    var text = shareText(s);
    if (navigator.share) {
      navigator.share({ title: 'SQL Cheat Sheet quiz', text: text }).catch(function () { /* cancelled */ });
      return;
    }
    copyText(text).then(function (ok) {
      toast(ok ? 'Copied' : 'Copy failed. Select the text instead.');
    });
  }

  function renderResult() {
    var s = state.score;
    body.innerHTML = '';
    body.appendChild(el('p', 'score', s + ' out of ' + TOTAL));
    body.appendChild(el('p', 'quiz-lead', bandMessage(s)));
    var row = el('div', 'btn-row');
    var again = el('button', 'btn primary', 'Try again');
    again.type = 'button';
    again.addEventListener('click', function () { buildRun(); renderQuestion(); });
    var share = el('button', 'btn', 'Share my result');
    share.type = 'button';
    share.addEventListener('click', function () { shareResult(s); });
    row.appendChild(again);
    row.appendChild(share);
    body.appendChild(row);
    var wa = el('p', 'wa');
    var a = el('a', null, 'Share on WhatsApp');
    a.href = 'https://wa.me/?text=' + encodeURIComponent(shareText(s));
    a.target = '_blank';
    a.rel = 'noopener';
    wa.appendChild(a);
    body.appendChild(wa);
  }

  renderStart();
})();
