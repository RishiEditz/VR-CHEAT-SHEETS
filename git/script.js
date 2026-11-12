(function () {
  'use strict';

  var KEY_TAB = 'gitcheat-tab';
  var KEY_THEME = 'gitcheat-theme';
  var root = document.documentElement;
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var search = document.getElementById('search');
  var themeBtn = document.getElementById('theme');
  var toast = document.getElementById('toast');
  var current = 0;
  var toastTimer = null;

  function store(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (err) { /* storage blocked: ignore */ }
  }

  // ---- tabs -------------------------------------------------------------
  function showTab(i, focus) {
    if (i < 0 || i >= tabs.length) i = 0;
    current = i;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (!search.value.trim()) {
      panels.forEach(function (p, k) { p.hidden = k !== i; });
    }
    save(KEY_TAB, String(i));
    if (focus) tabs[i].focus();
    var bar = tabs[i].parentNode;
    if (bar.scrollWidth > bar.clientWidth) {
      bar.scrollLeft = tabs[i].offsetLeft - (bar.clientWidth - tabs[i].offsetWidth) / 2;
    }
  }

  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () {
      if (search.value) { search.value = ''; applySearch(); }
      showTab(k, false);
    });
    t.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        var next = (k + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        showTab(next, true);
        ev.preventDefault();
      }
    });
  });

  // ---- search -----------------------------------------------------------
  function applySearch() {
    var q = search.value.trim().toLowerCase();
    if (!q) {
      showTab(current, false);
      panels.forEach(function (p) {
        p.querySelectorAll('.card').forEach(function (c) { c.hidden = false; });
        p.querySelector('.none').hidden = true;
      });
      return;
    }
    panels.forEach(function (p) {
      var hits = 0;
      p.querySelectorAll('.card').forEach(function (c) {
        var match = c.getAttribute('data-search').indexOf(q) !== -1;
        c.hidden = !match;
        if (match) hits++;
      });
      p.hidden = hits === 0;
      p.querySelector('.none').hidden = true;
    });
    var any = panels.some(function (p) { return !p.hidden; });
    var notice = document.getElementById('no-results');
    if (!any) {
      if (!notice) {
        notice = document.createElement('p');
        notice.id = 'no-results';
        notice.className = 'none';
        document.getElementById('main').appendChild(notice);
      }
      notice.textContent = 'No commands match "' + search.value.trim() + '".';
      notice.hidden = false;
    } else if (notice) {
      notice.hidden = true;
    }
  }

  search.addEventListener('input', applySearch);

  // ---- copy -------------------------------------------------------------
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 1600);
  }

  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function () {
      var cmd = card.getAttribute('data-cmd');
      copyText(cmd).then(function (ok) {
        showToast(ok ? 'Copied: ' + cmd : 'Copy failed, select the command by hand');
      });
    });
  });

  // ---- theme ------------------------------------------------------------
  function setTheme(name) {
    root.setAttribute('data-theme', name);
    themeBtn.textContent = name === 'light' ? 'Dark mode' : 'Light mode';
    save(KEY_THEME, name);
  }

  themeBtn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  // ---- quiz -------------------------------------------------------------
  var questions = Array.prototype.slice.call(document.querySelectorAll('.q'));
  var scoreEl = document.getElementById('score');
  var resetBtn = document.getElementById('reset');

  function updateScore() {
    var answered = 0, right = 0;
    questions.forEach(function (q) {
      if (q.getAttribute('data-done') === '1') {
        answered++;
        if (q.getAttribute('data-right') === '1') right++;
      }
    });
    if (answered === 0) {
      scoreEl.textContent = '';
      resetBtn.hidden = true;
    } else if (answered < questions.length) {
      scoreEl.textContent = 'Score: ' + right + ' of ' + answered + ' so far';
      resetBtn.hidden = false;
    } else {
      scoreEl.textContent = 'Final score: ' + right + ' of ' + questions.length;
      resetBtn.hidden = false;
    }
  }

  questions.forEach(function (q) {
    var answer = parseInt(q.getAttribute('data-answer'), 10);
    var why = q.querySelector('.why');
    var opts = Array.prototype.slice.call(q.querySelectorAll('.opt'));
    opts.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        if (q.getAttribute('data-done') === '1') return;
        q.setAttribute('data-done', '1');
        var ok = i === answer;
        q.setAttribute('data-right', ok ? '1' : '0');
        opts.forEach(function (b, k) {
          b.disabled = true;
          if (k === answer) b.classList.add('right');
          else if (k === i) b.classList.add('wrong');
        });
        why.hidden = false;
        why.textContent = (ok ? 'Correct. ' : 'Not quite. ') + why.getAttribute('data-text');
        updateScore();
      });
    });
    why.setAttribute('data-text', why.textContent);
  });

  resetBtn.addEventListener('click', function () {
    questions.forEach(function (q) {
      q.removeAttribute('data-done');
      q.removeAttribute('data-right');
      q.querySelectorAll('.opt').forEach(function (b) {
        b.disabled = false;
        b.classList.remove('right', 'wrong');
      });
      var why = q.querySelector('.why');
      why.hidden = true;
      why.textContent = '';
      why.setAttribute('data-text', why.getAttribute('data-text') || '');
    });
    updateScore();
  });

  // ---- start ------------------------------------------------------------
  var savedTheme = store(KEY_THEME);
  setTheme(savedTheme === 'light' ? 'light' : 'dark');

  var savedTab = parseInt(store(KEY_TAB), 10);
  showTab(isNaN(savedTab) ? 0 : savedTab, false);
})();
