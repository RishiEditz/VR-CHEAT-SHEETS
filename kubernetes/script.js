(function () {
  'use strict';

  var QUIZ = [{"q": "Which command lists the pods in your current namespace?", "options": ["kubectl get pods", "kubectl list pods", "kubectl show pods", "kubectl pods"], "why": "kubectl get pods lists the pods in the current namespace."}, {"q": "What does the -A flag do in kubectl get pods -A?", "options": ["Lists pods from every namespace", "Shows only failed pods", "Sorts pods by age", "Deletes all pods"], "why": "-A stands for all namespaces."}, {"q": "What does -o wide add to kubectl get pods?", "options": ["Extra columns such as node and pod IP", "A wider terminal", "Pod logs", "YAML output"], "why": "-o wide adds columns like the node and the pod IP."}, {"q": "Which command lists the machines in a cluster?", "options": ["kubectl get nodes", "kubectl get machines", "kubectl get hosts", "kubectl cluster list"], "why": "Nodes are the machines that run your pods."}, {"q": "Which command shows details and recent events for one pod?", "options": ["kubectl describe pod NAME", "kubectl details pod NAME", "kubectl info pod NAME", "kubectl view pod NAME"], "why": "describe prints the full details and the events at the bottom."}, {"q": "What does kubectl apply -f app.yaml do?", "options": ["Creates or updates objects from the file", "Runs a shell in the pod", "Prints the file", "Deletes the file"], "why": "apply makes the cluster match what the file describes."}, {"q": "What does kubectl scale deployment web --replicas=3 do?", "options": ["Runs three copies of the pod", "Gives the pod 3 CPUs", "Waits 3 seconds", "Deletes 3 pods"], "why": "Replicas is the number of pod copies the deployment keeps running."}, {"q": "A deployment's pod is deleted by hand. What happens next?", "options": ["The deployment starts a replacement", "Nothing, the pod stays gone", "The whole cluster stops", "The node restarts"], "why": "A deployment keeps the wanted number of pods running."}, {"q": "What does kubectl expose deployment web --port=80 create?", "options": ["A service in front of the deployment", "A new namespace", "A secret", "A node"], "why": "A service gives the pods one steady address."}, {"q": "What does kubectl port-forward pod/NAME 8080:80 do?", "options": ["Sends local port 8080 to port 80 in the pod", "Opens port 80 to the internet", "Moves the pod to port 8080", "Blocks port 80"], "why": "The first number is your local port, the second is the pod's port."}, {"q": "What is a namespace?", "options": ["A group that separates objects in a cluster", "A type of container image", "A kind of secret", "A node label"], "why": "Namespaces keep objects grouped, for example dev and prod."}, {"q": "Which flag runs a command inside the dev namespace?", "options": ["-n dev", "-d dev", "--ns-only", "-x dev"], "why": "-n picks the namespace, as in kubectl -n dev get pods."}, {"q": "How are Secret values stored by default?", "options": ["Base64 encoded, not encrypted", "Fully encrypted", "As plain files on your laptop", "Hashed"], "why": "Base64 is only an encoding. Limit who can read secrets."}, {"q": "Which command shows the log of a container that crashed?", "options": ["kubectl logs NAME --previous", "kubectl logs NAME --crash", "kubectl describe logs", "kubectl events NAME"], "why": "--previous shows the log from the last terminated container."}, {"q": "Which command goes back to the previous deployment revision?", "options": ["kubectl rollout undo deployment/web", "kubectl rollout back web", "kubectl undo deployment web", "kubectl delete rollout"], "why": "rollout undo returns the deployment to its earlier revision."}];
  var TOTAL = QUIZ.length;
  var SHARE_URL = 'https://rishieditz.github.io/VR-CHEAT-SHEETS/kubernetes/';
  var THEME_KEY = 'kubernetes-cheat-theme';
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
    if (s >= 13) return 'Sharp work. You know your Kubernetes.';
    if (s >= 10) return 'Solid. Reread the pages you missed and you will be sharp.';
    if (s >= 6) return 'A good start. Go back to the pages and try again.';
    return 'Keep going. Read the five pages once more, then give it another go.';
  }

  function shareText(s) {
    return 'I scored ' + s + '/15 on the Kubernetes Cheat Sheet quiz by VR Developments! Try it: ' + SHARE_URL;
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
