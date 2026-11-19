(function () {
  'use strict';

  var QUIZ = [{"q": "In let age: number = 25, what does : number do?", "options": ["Gives age the number type", "Converts age to text", "Makes age optional", "Makes age constant"], "why": "A colon followed by a type tells TypeScript what the variable can hold."}, {"q": "Which type holds only true or false?", "options": ["boolean", "number", "string", "unknown"], "why": "boolean has just two values: true and false."}, {"q": "How do you write an array of strings?", "options": ["string[]", "str[]", "string{}", "array(string)"], "why": "Put [] after the type. string[] is an array where every item is a string."}, {"q": "What is [string, number] called?", "options": ["A tuple", "A union", "An enum", "An interface"], "why": "A tuple has a fixed length and a set type at each position."}, {"q": "What must you do before using a value of type unknown?", "options": ["Check its type first", "Nothing, use it freely", "Convert it to a string", "Delete it"], "why": "unknown is the safe version of any. TypeScript makes you check the type before you use it."}, {"q": "What does the ? in function greet(name?: string) do?", "options": ["Makes the parameter optional", "Makes it required", "Makes it a number", "Returns a string"], "why": "A ? after the name means the argument can be left out."}, {"q": "Which return type means a function returns nothing?", "options": ["void", "string", "any", "unknown"], "why": "void is for functions that do not return a value."}, {"q": "What does readonly do on a property?", "options": ["Stops it changing after it is set", "Makes it optional", "Hides it from the object", "Turns it into a string"], "why": "readonly stops a property from being reassigned after it is set."}, {"q": "What does type Both = A & B create?", "options": ["A type with everything from A and B", "A type that is A or B", "A copy of A only", "An array of A and B"], "why": "& makes an intersection. The value must have everything from both types."}, {"q": "What does let id: string | number mean?", "options": ["id can be a string or a number", "id must be both", "id is an array", "id is optional"], "why": "The | symbol makes a union: the value can be either type."}, {"q": "Inside if (typeof x === \"string\"), what does TypeScript know?", "options": ["x is a string", "x is a number", "x is undefined", "x is optional"], "why": "That is narrowing. Inside the block, TypeScript treats x as a string."}, {"q": "What is T in function first<T>(arr: T[]): T?", "options": ["A generic type placeholder", "A tuple", "A string value", "A keyword for return"], "why": "T stands for a type that is filled in when the function is called."}, {"q": "What does Partial<User> do?", "options": ["Makes every property optional", "Removes every property", "Makes every property readonly", "Turns User into an array"], "why": "Partial makes every property of the type optional."}, {"q": "Which type builds an object with string keys and number values?", "options": ["Record<string, number>", "Partial<number>", "Omit<string, number>", "number[string]"], "why": "Record<string, number> describes an object with string keys and number values."}, {"q": "Which command creates a tsconfig.json file?", "options": ["npx tsc --init", "npx tsc app.ts", "npm run tsc", "npx init ts"], "why": "npx tsc --init creates a tsconfig.json. npx tsc app.ts compiles a file."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/typescript/';
  var THEME_KEY = 'typescript-cheat-theme';
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
    if (s >= 13) return 'Sharp work. You know your TypeScript.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the TypeScript Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
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
