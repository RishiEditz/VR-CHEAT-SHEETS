(function () {
  'use strict';

  var QUIZ = [{"q": "Which symbol matches the start of the text?", "options": ["^", "$", "#", "~"], "why": "^ anchors the match to the start; $ anchors it to the end."}, {"q": "Which pattern matches one digit?", "options": ["\\d", "\\w", "\\s", "\\b"], "why": "\\d is a digit, \\w a letter, digit or underscore, \\s a space."}, {"q": "What does colou?r match?", "options": ["Both color and colour", "Only colour", "Only color", "Colouur only"], "why": "? means zero or one, so the u is optional."}, {"q": "What does * mean after a character?", "options": ["Zero or more of it", "Exactly one", "One or more", "Start of the line"], "why": "ab*c matches ac, abc and abbbbc."}, {"q": "What does {2,4} mean?", "options": ["Two to four times", "Exactly four times", "Only at position two", "Four or more times"], "why": "{2,} on its own means two or more."}, {"q": "In <b>bold<\/b>, what does the greedy <.+> match?", "options": ["The whole <b>bold<\/b>", "<b> only", "<\/b> only", "bold only"], "why": "Greedy + takes as much as it can. Add ? to stop at the first >."}, {"q": "What does \\b mean in \\bcat\\b?", "options": ["A word boundary, so cat as a whole word", "A bold tag", "A backspace", "Any word that starts with c"], "why": "It matches cat in \"a cat sat\", but not in \"category\"."}, {"q": "In \\d+(?=px), is px part of the match?", "options": ["No, it is only checked", "Yes, px is included", "Px is removed from the text", "It is the flag for pixels"], "why": "The lookahead checks the next text; 12px matches 12."}, {"q": "What does (\\w)\\1 match?", "options": ["A letter repeated right after itself, like ll", "Any two letters", "A backslash and a letter", "The first letter of each word"], "why": "\\1 means the same text as group 1, again."}, {"q": "Which flag lets the dot match a new line?", "options": ["s", "i", "g", "m"], "why": "The s flag is dotAll; in Python it is re.DOTALL."}, {"q": "Which flag makes ^ and $ work on each line?", "options": ["m", "s", "i", "g"], "why": "m is multiline mode."}, {"q": "What does re.findall(r\"\\d+\", \"a1 b22\") return?", "options": ["['1', '22']", "['a1', 'b22']", "['1', '2', '2']", "['22']"], "why": "findall returns every match as a list of strings."}, {"q": "Replacing (\\w+) (\\w+) with $2 $1 in hello world gives what?", "options": ["world hello", "hello world", "worldhello", "hello hello"], "why": "$1 and $2 are the saved groups, here swapped."}, {"q": "Which pattern checks a 10-digit Indian mobile number?", "options": ["^[6-9]\\d{9}$", "^[0-5]\\d{9}$", "^\\d{8}$", "^\\d{12}$"], "why": "Indian mobile numbers have 10 digits and start with 6, 7, 8 or 9."}, {"q": "In the password recipe, what does (?=.*\\d) check?", "options": ["The text has at least one digit", "The text starts with a digit", "The text has exactly one digit", "Digits are removed from the text"], "why": "Each lookahead checks one rule anywhere in the text, without taking any text."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/regex/';
  var THEME_KEY = 'regex-cheat-theme';
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
    if (s >= 13) return 'Sharp work. You know your regex.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the Regex Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
  }

  function shareResult(s) {
    var text = shareText(s);
    if (navigator.share) {
      navigator.share({ title: 'Regex Cheat Sheet quiz', text: text }).catch(function () { /* cancelled */ });
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
