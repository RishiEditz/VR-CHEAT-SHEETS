(function () {
  'use strict';

  var KEY_THEME = 'gitcheat-theme';
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/git/';
  var root = document.documentElement;
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function store(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (err) { /* storage blocked: ignore */ }
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }

  // ---- theme ------------------------------------------------------------
  var themeBtn = document.getElementById('theme');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
  }
  applyTheme(store(KEY_THEME) === 'light' ? 'light' : 'dark');
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    save(KEY_THEME, next);
  });

  // ---- tap to copy ------------------------------------------------------
  Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
    var label = card.querySelector('.tap');
    var timer = null;
    card.addEventListener('click', function () {
      var cmd = card.getAttribute('data-cmd');
      copyText(cmd).then(function () {
        card.classList.add('copied');
        label.textContent = 'Copied';
        showToast('Copied: ' + cmd);
        clearTimeout(timer);
        timer = setTimeout(function () {
          card.classList.remove('copied');
          label.textContent = 'Tap to copy';
        }, 1600);
      }, function () {
        showToast('Could not copy. Select the text and copy it by hand.');
      });
    });
  });

  // ---- quiz -------------------------------------------------------------
  // The first option of every question is the correct one; options are shuffled on every attempt.
  var BANK = [
    { q: 'Which command turns the current folder into a Git project?', a: ['git init', 'git start', 'git new', 'git make'],
      why: 'git init creates the hidden .git folder that tracks the project.' },
    { q: 'Which command stages all changes in the current folder?', a: ['git add .', 'git commit .', 'git push .', 'git save .'],
      why: 'git add . stages everything in this folder for the next commit.' },
    { q: 'Which command creates a new branch and switches to it?', a: ['git switch -c <name>', 'git branch -s <name>', 'git merge -c <name>', 'git new <name>'],
      why: 'The -c flag of git switch creates the branch and moves you onto it.' },
    { q: 'Which command sets unfinished changes aside so you can switch branches?', a: ['git stash', 'git tag', 'git pull', 'git clean'],
      why: 'git stash saves your changes. git stash pop brings them back.' },
    { q: 'Which command downloads remote changes without merging them?', a: ['git fetch', 'git pull', 'git push', 'git clone'],
      why: 'git fetch updates your copy of the remote. Your files stay as they are.' },
    { q: 'Which command undoes an old commit by adding a NEW commit?', a: ['git revert <commit>', 'git reset --hard', 'git clean -fd', 'git amend'],
      why: 'git revert is safe for shared history because it never rewrites past commits.' },
    { q: 'Which command lists recent positions of HEAD, so you can recover lost commits?', a: ['git reflog', 'git blame <file>', 'git bisect start', 'git remote -v'],
      why: 'The reflog remembers where HEAD has been, even after a reset.' },
    { q: 'Which command shows who last changed each line of a file?', a: ['git blame <file>', 'git tag', 'git diff --staged', 'git stash'],
      why: 'git blame shows the author and commit for every line.' },
    { q: 'What is a .gitignore file for?', a: ['Listing files Git should not track', 'Hiding your commit messages', 'Speeding up git push', 'Storing your password'],
      why: 'Files listed in .gitignore, like node_modules/, stay out of your commits.' },
    { q: 'Which command makes "git st" run "git status"?', a: ['git config --global alias.st status', 'git alias st', 'git shortcut st', 'git init --alias'],
      why: 'Aliases are set with git config, here under the alias.st key.' },
    { q: 'What does git clone <repo> do?', a: ['Copies an existing project, with its full history, to your computer', 'Creates an empty project in the current folder', 'Uploads your commits to the remote', 'Merges two branches'],
      why: 'Clone downloads the whole project and its history, so you can start working.' },
    { q: 'What happens with git reset --soft HEAD~1?', a: ['The last commit is undone and its changes stay staged', 'The last commit and all its changes are deleted', 'The last commit is uploaded again', 'A new branch is created'],
      why: '--soft keeps your changes. --hard is the one that would delete them.' },
    { q: 'In git push -u origin <branch>, what does the -u flag do?', a: ['Links the branch, so next time git push is enough', 'Undoes the push', 'Uploads your tags as well', 'Deletes the remote branch'],
      why: '-u sets the remote branch to track, so plain git push works afterwards.' },
    { q: 'What is git commit --amend used for?', a: ['Changing the last commit, for example to fix its message', 'Deleting all untracked files', 'Downloading new changes from the remote', 'Creating a release tag'],
      why: 'Amend rewrites the last commit: fix the message or add a file you forgot.' },
    { q: 'What does git bisect help you find?', a: ['The commit that broke something', 'The person who wrote a line', 'The newest remote branch', 'The files Git ignores'],
      why: 'You mark steps good or bad, and bisect narrows history down to the culprit.' }
  ];
  var TOTAL = BANK.length;
  var box = document.getElementById('quiz-box');
  var run = null;
  var lastOrder = '';

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function newRun() {
    var order, key, tries = 0;
    do {
      order = shuffle(BANK.map(function (_, i) { return i; }));
      key = order.join(',');
      tries++;
    } while (key === lastOrder && tries < 10);
    lastOrder = key;
    run = {
      idx: 0,
      score: 0,
      questions: order.map(function (n) {
        var item = BANK[n];
        return {
          q: item.q,
          why: item.why,
          opts: shuffle(item.a.map(function (text, k) { return { text: text, ok: k === 0 }; }))
        };
      })
    };
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function showStart() {
    box.textContent = '';
    var wrap = el('div', 'quiz-intro');
    wrap.appendChild(el('p', 'intro', TOTAL + ' questions on the five pages above. The order and the answers are shuffled every time you play.'));
    var go = el('button', 'primary', 'Start the quiz');
    go.type = 'button';
    go.addEventListener('click', function () { newRun(); showQuestion(); });
    wrap.appendChild(go);
    box.appendChild(wrap);
  }

  function showQuestion() {
    var item = run.questions[run.idx];
    var answered = false;
    box.textContent = '';

    var row = el('div', 'progress-row');
    row.appendChild(el('span', '', 'Question ' + (run.idx + 1) + ' of ' + TOTAL));
    row.appendChild(el('span', '', 'Score ' + run.score));
    box.appendChild(row);
    var bar = el('div', 'bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(TOTAL));
    bar.setAttribute('aria-valuenow', String(run.idx));
    var fill = el('i');
    fill.style.width = Math.round(run.idx / TOTAL * 100) + '%';
    bar.appendChild(fill);
    box.appendChild(bar);

    var qt = el('h3', 'q-text', item.q);
    qt.id = 'q-text';
    qt.tabIndex = -1;
    box.appendChild(qt);

    var opts = el('div', 'opts');
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-labelledby', 'q-text');
    var why = el('p', 'why');
    why.hidden = true;
    var actions = el('div', 'q-actions');
    actions.hidden = true;
    var next = el('button', 'primary', run.idx === TOTAL - 1 ? 'See my score' : 'Next question');
    next.type = 'button';
    next.addEventListener('click', function () {
      run.idx++;
      if (run.idx >= TOTAL) showResult(); else showQuestion();
    });
    actions.appendChild(next);

    var buttons = item.opts.map(function (o, k) {
      var b = el('button', 'opt');
      b.type = 'button';
      b.appendChild(el('span', 'letter', 'ABCD'.charAt(k)));
      b.appendChild(el('span', 'otext', o.text));
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        if (o.ok) run.score++;
        buttons.forEach(function (bb, kk) {
          bb.disabled = true;
          if (item.opts[kk].ok) bb.classList.add('right');
          else if (bb === b) bb.classList.add('wrong');
          else bb.classList.add('dim');
        });
        var strong = el('strong', '', o.ok ? 'Correct. ' : 'Not quite. ');
        why.textContent = '';
        why.appendChild(strong);
        why.appendChild(document.createTextNode(item.why));
        why.hidden = false;
        actions.hidden = false;
        next.focus();
      });
      opts.appendChild(b);
      return b;
    });
    box.appendChild(opts);
    box.appendChild(why);
    box.appendChild(actions);
    if (run.idx > 0 && box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: 'start' });
  }

  function resultMessage(s) {
    if (s === TOTAL) return 'Perfect score! You know your Git.';
    if (s >= 12) return 'Great job! Almost perfect.';
    if (s >= 8) return 'Good effort. Look over the pages above and try again.';
    return 'A solid start. Scroll back up, read the pages, then try again.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/' + TOTAL + ' on the Git Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
  }

  function doShare(s) {
    var text = shareText(s);
    var fallback = function () {
      copyText(text).then(function () { showToast('Copied! Now paste it anywhere to share.'); },
        function () { showToast('Could not copy. Use the WhatsApp link instead.'); });
    };
    if (navigator.share) {
      navigator.share({ title: 'Git Cheat Sheet quiz', text: text }).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        fallback();
      });
    } else {
      fallback();
    }
  }

  function showResult() {
    var s = run.score;
    box.textContent = '';
    var res = el('div', 'result');
    var scoreEl = el('p', 'score', s + ' out of ' + TOTAL);
    scoreEl.id = 'final-score';
    scoreEl.tabIndex = -1;
    res.appendChild(scoreEl);
    res.appendChild(el('p', 'msg', resultMessage(s)));

    var acts = el('div', 'res-actions');
    var again = el('button', 'ghost', 'Try again');
    again.type = 'button';
    again.id = 'retry';
    again.addEventListener('click', function () { newRun(); showQuestion(); box.scrollIntoView({ block: 'start' }); });
    acts.appendChild(again);
    res.appendChild(acts);

    var share = el('div', 'share');
    var sb = el('button', 'primary', 'Share my result');
    sb.type = 'button';
    sb.id = 'share';
    sb.addEventListener('click', function () { doShare(s); });
    var row = el('div', 'share-row');
    row.appendChild(sb);
    var wa = el('a', 'wa', 'Share on WhatsApp');
    wa.id = 'wa-share';
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText(s));
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    row.appendChild(wa);
    share.appendChild(row);
    share.appendChild(el('p', 'share-note', 'Quiz by VR Developments'));
    res.appendChild(share);
    box.appendChild(res);
    scoreEl.focus({ preventScroll: true });
  }

  showStart();
})();
