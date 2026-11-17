(function () {
  'use strict';

  var QUIZ = [{"q": "Which keyword makes a variable that cannot be assigned again?", "options": ["const", "let", "var", "typeof"], "why": "const makes a variable that cannot be assigned again. Use let when the value must change."}, {"q": "What does typeof x tell you?", "options": ["The type of the value, such as number or string", "The length of x", "Whether x is true", "The first item of x"], "why": "typeof shows the type of a value, such as number, string or boolean."}, {"q": "Which characters wrap a template string, so you can use ${name} inside it?", "options": ["Backticks", "Double quotes", "Single quotes", "Slashes"], "why": "A template string uses backticks. Inside them, ${name} puts the variable into the text."}, {"q": "What does a line starting with // do?", "options": ["JavaScript skips it, so it works as a comment", "It prints the line on the screen", "It starts a new function", "It stops the program"], "why": "Two slashes start a comment, and JavaScript skips the rest of the line."}, {"q": "Which line adds the value 4 to the end of the array nums?", "options": ["nums.push(4)", "nums.append(4)", "nums.add(4)", "nums[4]"], "why": "push adds a value to the end of an array."}, {"q": "Which expression gets the last item of nums?", "options": ["nums.at(-1)", "nums.at(0)", "nums.last", "nums.length"], "why": "at(-1) counts from the end, so it gives the last item."}, {"q": "How do you read the value stored under the key name in person?", "options": ["person.name", "person(name)", "person->name", "person.get"], "why": "Dot and the key name reads the value. person[\"name\"] works too."}, {"q": "Which operator is strict equal, checking value and type?", "options": ["===", "=", "=>", "&&"], "why": "=== is true only when the value and the type both match. One = assigns a value."}, {"q": "What does && mean in a condition?", "options": ["And: both sides must be true", "Or: one side is enough", "Not: flips the answer", "Equal to"], "why": "&& means and. || means or, and ! means not."}, {"q": "How many times does for (let i = 0; i < 5; i++) { } run?", "options": ["Five times, with i from 0 to 4", "Five times, with i from 1 to 5", "Six times", "Forever"], "why": "i starts at 0 and stops before 5, so the loop runs five times."}, {"q": "What does for (const n of nums) do?", "options": ["Gives you one item of nums at a time", "Counts the items in nums", "Deletes every item", "Sorts nums"], "why": "for...of loops over an array and gives you one item at a time."}, {"q": "What does the arrow in (a, b) => a + b mean?", "options": ["It writes a short function that returns a + b", "It compares a and b", "It makes a comment", "It loops over a and b"], "why": "The arrow writes a short function. The value after it is returned."}, {"q": "What does nums.map(n => n * 2) give you?", "options": ["A new array with every item doubled", "The first item doubled", "Only the even items", "The sum of all items"], "why": "map runs the function on every item and builds a new array."}, {"q": "What does nums.filter(n => n > 2) keep?", "options": ["Only the items bigger than 2", "Only the first two items", "Every item, doubled", "The number of items"], "why": "filter keeps only the items where the function returns true."}, {"q": "When does the catch block run?", "options": ["When the try block throws an error", "Every time, before try", "Only when there is no error", "Never, it is only a label"], "why": "If the try block throws an error, catch handles it instead of the program crashing."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/javascript/';
  var THEME_KEY = 'javascript-cheat-theme';
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
    if (s >= 13) return 'Sharp work. You know your JavaScript.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the JavaScript Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
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
