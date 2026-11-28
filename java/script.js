(function () {
  'use strict';

  var QUIZ = [{"q": "Which command compiles Hello.java?", "options": ["javac Hello.java", "java -c Hello.java", "compile Hello.java", "jvm Hello.java"], "why": "javac turns the source file into Hello.class bytecode."}, {"q": "How do you run the compiled class Hello?", "options": ["java Hello", "java Hello.class", "javac Hello", "run Hello"], "why": "Use the class name only, without the .class ending."}, {"q": "How can Java 11 and newer run one source file without a separate compile step?", "options": ["java Hello.java", "javac -run Hello.java", "java --compile Hello", "jar Hello.java"], "why": "The java launcher compiles the file in memory and runs it."}, {"q": "Which method is the entry point of a Java program?", "options": ["public static void main(String[] args)", "public void start()", "static void run()", "public static int init()"], "why": "The JVM looks for exactly this main method."}, {"q": "What does var count = 10; do?", "options": ["Lets Java infer the type int", "Lets the variable hold any type later", "Makes the value a constant", "Creates a global variable"], "why": "var is type inference. The variable still has one fixed type."}, {"q": "Which expression compares the text of two strings?", "options": ["name.equals(\"Java\")", "name == \"Java\"", "name.same(\"Java\")", "name.is(\"Java\")"], "why": "== compares references, so use equals for the characters."}, {"q": "What does String.format(\"%.2f\", 3.14159) give?", "options": ["3.14", "3.1", "3.15", "3.14159"], "why": "%.2f rounds to two decimal places."}, {"q": "What happens with Integer.parseInt(\"abc\")?", "options": ["It throws NumberFormatException", "It returns 0", "It returns null", "It returns -1"], "why": "Bad input is an error, so catch it when the text comes from a user."}, {"q": "Which loop visits every item in a list?", "options": ["for (String s : list) { }", "for (String s in list) { }", "foreach s of list { }", "loop list as s { }"], "why": "The enhanced for loop uses a colon."}, {"q": "In for (int i = 0; i < 5; i++), which values does i take?", "options": ["0, 1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "1, 2, 3, 4"], "why": "It starts at 0 and stops before 5."}, {"q": "What does this.name = name; do inside a constructor?", "options": ["Stores the parameter in the object's field", "Creates a new object", "Deletes the field", "Calls the parent class"], "why": "this points to the current object, so the field gets the parameter value."}, {"q": "What does @Override tell the compiler?", "options": ["This method replaces a parent method", "This method is private", "This method runs faster", "This method is deprecated"], "why": "If the parent has no such method, the compiler reports an error."}, {"q": "Which line creates a resizable list of strings?", "options": ["List<String> list = new ArrayList<>();", "String[] list = new ArrayList<>();", "List<String> list = new List<>();", "ArrayList list = String[];"], "why": "ArrayList grows as you add items."}, {"q": "Which type stores key and value pairs?", "options": ["HashMap", "ArrayList", "Scanner", "StringBuilder"], "why": "put adds a pair and get reads a value by its key."}, {"q": "What does try-with-resources do?", "options": ["Closes the resource automatically, even on errors", "Retries the code until it works", "Ignores every exception", "Runs the code on a new thread"], "why": "Great for files, because you never forget to close them."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/java/';
  var THEME_KEY = 'java-cheat-theme';
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
    if (s >= 13) return 'Sharp work. You know your Java.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the Java Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
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
