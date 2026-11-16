(function () {
  'use strict';

  var QUIZ = [{"q": "Which command shows what kind of value you have, such as int or str?", "options": ["type(x)", "len(x)", "input(x)", "print(x)"], "why": "type(x) shows the type of a value, such as int for whole numbers or str for text."}, {"q": "What does input() always give back?", "options": ["Text, even when the user types a number", "A whole number", "True or False", "A list of letters"], "why": "input always gives back text, even if the user types a number."}, {"q": "What does a line starting with # do?", "options": ["Python skips it, so it works as a comment", "It prints the line on the screen", "It starts a new function", "It stops the program"], "why": "Anything after a hash is a comment, and Python skips it."}, {"q": "What does f\"Hi {name}\" do?", "options": ["Puts the value of name inside the text", "Prints the word name in quotes", "Makes the text bold", "Reads name from a file"], "why": "An f-string puts a variable inside the text. The f before the quotes makes it work."}, {"q": "Which expression gets the last item of nums?", "options": ["nums[-1]", "nums[0]", "nums[1]", "nums.last()"], "why": "Python counts from 0 and a negative index counts from the end, so nums[-1] is the last item."}, {"q": "What does person[\"name\"] give you?", "options": ["The value stored under the key name", "The key name is deleted", "A new list of every key", "The number of items in person"], "why": "A dict pairs keys with values, so this gets the value stored under name."}, {"q": "How many times does for i in range(5): run?", "options": ["Five times, with i from 0 to 4", "Five times, with i from 1 to 5", "Six times", "Forever"], "why": "range(5) gives 0, 1, 2, 3 and 4, so the loop runs five times."}, {"q": "What does a while loop do?", "options": ["Keeps running while its condition stays true", "Runs once for each item in a list", "Runs only once, then stops", "Creates a new function"], "why": "A while loop keeps going as long as its condition is true."}, {"q": "What does break do inside a loop?", "options": ["Leaves the loop straight away", "Restarts the loop from the top", "Pauses the program for one second", "Stops Python completely"], "why": "break leaves the loop straight away."}, {"q": "What does return a + b send back?", "options": ["The sum, to whoever called the function", "The text a + b printed on the screen", "Nothing, because return only ends the program", "The letters a and b"], "why": "return sends a value back from the function to the place that called it."}, {"q": "What is the difference between import math and from math import sqrt?", "options": ["The second brings in just sqrt, so you can write sqrt(9)", "The second deletes the math module", "The first is only for text", "There is no difference"], "why": "from ... import brings in one name, so you can call it without math. in front."}, {"q": "What does pip install requests do?", "options": ["Installs a third-party package from PyPI", "Runs a file called requests", "Creates a new virtual environment", "Lists the functions inside requests"], "why": "pip installs third-party packages from the Python Package Index, called PyPI."}, {"q": "What does with open(\"notes.txt\") as f: do for the block under it?", "options": ["Opens the file and closes it for you when the block ends", "Creates a new file called notes.txt", "Deletes notes.txt when the block finishes", "Keeps the file open for ever"], "why": "with opens the file and closes it again when the indented block ends."}, {"q": "When does the except block in try / except run?", "options": ["When the code in try raises an error such as ValueError", "Every time the program starts", "Only when the file is empty", "When the user presses Enter"], "why": "If the code in try raises a ValueError, except runs and the program keeps going."}, {"q": "What does python3 -m venv .venv create?", "options": ["A private environment for one project's packages", "A new Python file called venv", "A copy of your whole computer", "A list of every file in the folder"], "why": "venv creates a private folder of packages for one project, so projects do not clash."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/python/';
  var THEME_KEY = 'python-cheat-theme';
  var root = document.documentElement;
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var body = document.getElementById('quiz-body');
  var state = { items: [], pos: 0, score: 0, lastKey: '' };

  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2200);
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
      var cmd = btn.getAttribute('data-cmd');
      copyText(cmd).then(function (ok) {
        if (ok) {
          btn.classList.add('copied');
          tag.textContent = 'Copied';
          toast('Copied to clipboard');
        } else {
          tag.textContent = 'Select the text above';
          toast('Clipboard is blocked here. Select this line instead: ' + cmd, 5000);
        }
        setTimeout(function () {
          btn.classList.remove('copied');
          tag.textContent = 'Tap to copy';
        }, 1800);
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
    if (s >= 13) return 'Sharp work. You know your Python.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the Python Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
  }

  function showShareText(text) {
    var old = document.getElementById('share-fallback');
    if (old) old.parentNode.removeChild(old);
    var box = el('div', 'share-fallback');
    box.id = 'share-fallback';
    box.appendChild(el('p', 'quiz-lead', 'Copying is blocked here. Select this text and copy it by hand:'));
    var ta = el('textarea', 'share-text');
    ta.readOnly = true;
    ta.rows = 3;
    ta.value = text;
    ta.setAttribute('aria-label', 'Text to share');
    box.appendChild(ta);
    body.appendChild(box);
    try { ta.focus(); ta.select(); ta.setSelectionRange(0, text.length); } catch (e) { /* user can select by hand */ }
  }

  function shareResult(s) {
    var text = shareText(s);
    copyText(text).then(function (ok) {
      if (ok) {
        toast('Copied', 2200);
      } else {
        toast('Copy blocked. Select the text below.', 4000);
        showShareText(text);
      }
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
