/* App state: progress, mastery, XP/levels, daily activity and saving (browser storage + local server file). */
(function (root) {
  "use strict";
  const KEY = "academyProgress";
  const MASTERY_WINDOW = 10, MASTERY_NEED = 8;
  const XP = { lessonRead: 20, correct: 10, mastery: 100, solve: 5, placement: 50, pyRun: 2, project: 150, legacyLesson: 120, legacyCorrect: 30, legacyPractice: 20 };

  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  function normalize(s) {
    if (!s || typeof s !== "object" || Array.isArray(s)) s = {};
    const obj = k => { if (!s[k] || typeof s[k] !== "object" || Array.isArray(s[k])) s[k] = {}; };
    ["activity", "skills", "srs", "reviewLog", "lessonNotes", "projects"].forEach(obj);
    ["done", "answered", "practiceAnswered", "badges"].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
    ["correct", "solved", "reviewXP", "reviewSessions", "pyRuns", "practiceCorrect", "practiceTotal"].forEach(k => { s[k] = Number.isFinite(+s[k]) ? +s[k] : 0; });
    if (!["s", "u", "d"].includes(s.goal)) s.goal = s.goal ? "d" : s.goal;
    return s;
  }
  S = normalize(S);

  const dayKey = d => { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const listeners = [];
  let lastXp = null;

  function xpOf(s) {
    const sk = Object.values(s.skills || {});
    return (s.done || []).length * XP.legacyLesson + (s.correct || 0) * XP.legacyCorrect + (s.practiceAnswered || []).length * XP.legacyPractice +
      sk.filter(x => x.read).length * XP.lessonRead + (s.practiceCorrect || 0) * XP.correct + sk.filter(x => x.m && !x.placed).length * XP.mastery +
      Math.min(s.solved || 0, 400) * XP.solve + (s.reviewXP || 0) + (s.placement ? XP.placement : 0) + Math.min(s.pyRuns || 0, 100) * XP.pyRun +
      Object.values(s.projects || {}).filter(p => p && p.done).length * XP.project;
  }
  const levelStart = l => 50 * l * (l - 1);
  const levelOf = xp => { let l = 1; while (levelStart(l + 1) <= xp) l++; return l; };

  function save(opts) {
    S.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
    if (root.location && root.location.protocol !== "file:") {
      try { fetch("api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(S) }).then(r => { STORE.serverOk = r.ok; }).catch(() => { STORE.serverOk = false; }); } catch (e) { }
    }
    const xp = xpOf(S);
    if (lastXp !== null && xp > lastXp && !(opts && opts.quiet)) {
      const lv = levelOf(xp), lvPrev = levelOf(lastXp);
      STORE.emit("xp", { gain: xp - lastXp, levelUp: lv > lvPrev ? lv : 0 });
    }
    lastXp = xp;
    STORE.emit("change");
  }
  function bumpActivity(n) {
    const k = dayKey(); S.activity[k] = (S.activity[k] || 0) + (n || 1);
  }
  function streak() {
    const a = S.activity, d = new Date(); let n = 0;
    if (!a[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (a[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function longestStreak() {
    const days = Object.keys(S.activity).filter(k => S.activity[k]).sort();
    let best = 0, cur = 0, prev = null;
    days.forEach(k => { const d = new Date(k + "T12:00:00"); cur = prev && (d - prev) / 864e5 < 1.5 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; });
    return best;
  }

  /* ---------- skills & mastery ---------- */
  const sk = id => (S.skills[id] = S.skills[id] || { h: [] });
  const status = id => {
    const s = S.skills[id];
    if (s && s.m) return "mastered";
    const C = root.CURRICULUM, info = C && C.byId[id];
    if (info && !info.pre.every(p => S.skills[p] && S.skills[p].m)) return s && (s.h.length || s.read) ? "progress" : "locked";
    return s && (s.h.length || s.read) ? "progress" : "available";
  };
  const recent = id => (S.skills[id] ? S.skills[id].h.slice(-MASTERY_WINDOW) : []);
  const masteryCount = id => recent(id).filter(Boolean).length;
  function recordAnswer(id, correct) {
    const s = sk(id);
    s.h.push(correct ? 1 : 0); if (s.h.length > 40) s.h = s.h.slice(-40);
    S.practiceTotal++; if (correct) S.practiceCorrect++;
    bumpActivity(1);
    let newly = false;
    if (!s.m && masteryCount(id) >= MASTERY_NEED) { s.m = true; s.placed = false; s.mAt = Date.now(); s.box = 1; s.due = dayKey(addDays(1)); newly = true; }
    save();
    if (newly) STORE.emit("mastered", id);
    return newly;
  }
  function markRead(id) { const s = sk(id); if (!s.read) { s.read = true; bumpActivity(1); save(); } }
  function place(ids) { ids.forEach(id => { const s = sk(id); if (!s.m) { s.m = true; s.placed = true; s.box = 2; s.due = dayKey(addDays(3)); } }); save(); }
  const addDays = n => { const d = new Date(); d.setHours(12); d.setDate(d.getDate() + n); return d; };

  /* path: next skills for the chosen goal */
  function path(goal) {
    const C = root.CURRICULUM; goal = goal || S.goal || "d";
    return C.goalSkills(goal);
  }
  function nextSkills(n, goal) {
    const C = root.CURRICULUM, list = path(goal);
    const ready = list.filter(id => status(id) !== "mastered" && C.byId[id].pre.every(p => S.skills[p] && S.skills[p].m));
    ready.sort((a, b) => (status(b) === "progress") - (status(a) === "progress") || list.indexOf(a) - list.indexOf(b));
    return ready.slice(0, n || 1);
  }

  function emit(ev, data) { listeners.filter(l => l.ev === ev).forEach(l => { try { l.fn(data); } catch (e) { console.error(e); } }); }
  function on(ev, fn) { listeners.push({ ev, fn }); }

  /* load the server copy when running through server.py or the desktop app */
  function syncFromServer() {
    if (!root.location || root.location.protocol === "file:") return Promise.resolve(false);
    return fetch("api/progress").then(r => (r.ok ? r.json() : null)).then(p => {
      STORE.serverOk = !!p;
      if (p && typeof p === "object" && (p.updatedAt || 0) > (S.updatedAt || 0)) {
        S = normalize(p); STORE.S = S;
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
        lastXp = xpOf(S); emit("change"); return true;
      }
      return false;
    }).catch(() => { STORE.serverOk = false; return false; });
  }
  function replace(next) { S = normalize(next); STORE.S = S; lastXp = xpOf(S); save({ quiet: true }); }

  lastXp = xpOf(S);
  const STORE = {
    S, KEY, XP, MASTERY_WINDOW, MASTERY_NEED, save, bumpActivity, streak, longestStreak, dayKey, addDays,
    xp: () => xpOf(S), levelOf, levelStart, status, recent, masteryCount, recordAnswer, markRead, place, path, nextSkills,
    on, emit, syncFromServer, replace, serverOk: null,
  };
  Object.defineProperty(STORE, "S", { get: () => S, set: v => { S = v; } });
  root.STORE = STORE;
})(typeof globalThis !== "undefined" ? globalThis : this);
