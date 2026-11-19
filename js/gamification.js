/* Motor de gamificación, telemetría por divisor y persistencia local.
 * Compatible con navegador (window.Gamification) y Node (module.exports). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Gamification = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STORAGE_KEY = 'learning-arithmetics.v1';

  var RANKS = [
    { id: 'aprendiz', minXp: 0, title: 'Aprendiz de Casita', code: 'I' },
    { id: 'calibrador', minXp: 150, title: 'Calibrador Mental', code: 'II' },
    { id: 'relojero', minXp: 450, title: 'Relojero de Tablas', code: 'III' },
    { id: 'cronometrista', minXp: 950, title: 'Cronometrista del Salto', code: 'IV' },
    { id: 'maestro-cero', minXp: 1700, title: 'Maestro del Cero', code: 'V' },
    { id: 'gran-cronografo', minXp: 2800, title: 'Gran Cronógrafo', code: 'VI' }
  ];

  var BADGES = [
    { id: 'first-win', title: 'Primer Encaje', desc: 'Resuelve tu primera división directa.' },
    { id: 'flawless-5', title: 'Cinco Sin Fallo', desc: 'Alcanza una racha de 5 divisiones perfectas.' },
    { id: 'zero-hunter', title: 'Cazador de Ceros', desc: 'Resuelve 3 divisiones con cero al cociente sin errores.' },
    { id: 'fathers-notebook', title: 'Cuaderno de Papá', desc: 'Completa las 3 divisiones del cuaderno (6418÷8, 3749÷4, 45639÷9).' },
    { id: 'xray-off', title: 'Salto a Ciegas', desc: 'Resuelve una división de 4+ cifras sin usar Rayos-X ni pistas.' },
    { id: 'speed-demon', title: 'Pulso de Precisión', desc: 'Completa una división de 3+ cifras perfecta en menos de 15 segundos.' },
    { id: 'five-digits', title: 'Coloso de 5 Cifras', desc: 'Completa una división de 5 cifras sin ningún error.' },
    { id: 'table-9-ace', title: 'Dominio del 9', desc: 'Logra ≥ 90 % de acierto en al menos 10 pasos con el divisor 9.' },
    { id: 'drill-combo-15', title: 'Relámpago ×15', desc: 'Consigue una racha de 15 aciertos seguidos en Múltiplos Relámpago.' },
    { id: 'all-8-levels', title: 'Escalera Completa', desc: 'Consigue al menos 1 estrella en los 8 niveles de la campaña.' }
  ];

  function createDefaultState() {
    var divisors = {};
    for (var d = 2; d <= 9; d++) {
      divisors[d] = { attempts: 0, correct: 0, totalMs: 0, solvedProblems: 0 };
    }
    var levels = {};
    for (var l = 1; l <= 8; l++) {
      levels[l] = { completed: 0, bestStars: 0, bestMs: null };
    }
    return {
      version: 1,
      xp: 0,
      solved: 0,
      perfectSolved: 0,
      zeroPerfectSolved: 0,
      streak: 0,
      bestStreak: 0,
      drillBestCombo: 0,
      drillTotalCorrect: 0,
      fathersDone: [],
      badges: [],
      levels: levels,
      divisors: divisors,
      recentHistory: [],
      prefs: {
        sound: true,
        autoDrop: true,
        xray: false
      }
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function mergeState(raw) {
    var base = createDefaultState();
    if (!raw || typeof raw !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (raw[k] !== undefined && k !== 'levels' && k !== 'divisors' && k !== 'prefs') {
        base[k] = raw[k];
      }
    });
    if (raw.levels) {
      for (var l = 1; l <= 8; l++) {
        if (raw.levels[l]) {
          base.levels[l] = Object.assign(base.levels[l], raw.levels[l]);
        }
      }
    }
    if (raw.divisors) {
      for (var d = 2; d <= 9; d++) {
        if (raw.divisors[d]) {
          base.divisors[d] = Object.assign(base.divisors[d], raw.divisors[d]);
        }
      }
    }
    if (raw.prefs) {
      base.prefs = Object.assign(base.prefs, raw.prefs);
    }
    return base;
  }

  function getRank(xp) {
    var cur = RANKS[0];
    var next = RANKS[1] || null;
    for (var i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXp) {
        cur = RANKS[i];
        next = RANKS[i + 1] || null;
      }
    }
    var pct = 100;
    if (next) {
      pct = Math.min(100, Math.max(0, Math.round(((xp - cur.minXp) / (next.minXp - cur.minXp)) * 100)));
    }
    return { current: cur, next: next, progressPct: pct };
  }

  function isLevelUnlocked(state, levelId) {
    if (levelId <= 1) return true;
    // Se desbloquea al conseguir al menos 1 estrella en el nivel anterior (o si ya tiene progreso)
    var prev = state.levels[levelId - 1];
    return !!(prev && prev.bestStars >= 1);
  }

  function computeStars(mistakes, usedHint, usedXray, elapsedMs, digitCount) {
    if (mistakes === 0 && !usedHint && !usedXray) {
      var fastBudget = digitCount * 7500;
      return elapsedMs <= fastBudget ? 3 : 3;
    }
    if (mistakes <= 1 && !usedHint) return 2;
    return 1;
  }

  function unlockBadge(state, id, newly) {
    if (state.badges.indexOf(id) === -1) {
      state.badges.push(id);
      newly.push(id);
    }
  }

  function recordStepTelemetry(state, divisor, correct, durationMs) {
    var next = clone(state);
    if (next.divisors[divisor]) {
      next.divisors[divisor].attempts++;
      if (correct) next.divisors[divisor].correct++;
      next.divisors[divisor].totalMs += Math.min(Math.max(durationMs || 0, 100), 30000);
    }
    return next;
  }

  /**
   * Registra la resolución completa de una división y calcula XP, estrellas y medallas nuevas.
   */
  function recordDivisionComplete(state, result) {
    var next = clone(state);
    var mistakes = result.mistakes || 0;
    var usedHint = !!result.usedHint;
    var usedXray = !!result.usedXray;
    var elapsedMs = result.elapsedMs || 0;
    var dividend = result.dividend;
    var divisor = result.divisor;
    var digitsLen = String(dividend).length;
    var perfect = (mistakes === 0 && !usedHint);
    var levelId = result.levelId || null;

    next.solved++;
    if (perfect) {
      next.perfectSolved++;
      next.streak++;
      if (next.streak > next.bestStreak) next.bestStreak = next.streak;
    } else {
      next.streak = 0;
    }

    if (result.hadZeroInQuotient && perfect) {
      next.zeroPerfectSolved++;
    }

    if (next.divisors[divisor]) {
      next.divisors[divisor].solvedProblems++;
    }

    var baseXp = 14 + digitsLen * 6 + (result.hadZeroInQuotient ? 10 : 0);
    var streakBonus = perfect ? Math.min(25, next.streak * 3) : 0;
    var cleanBonus = (perfect && !usedXray) ? 10 : 0;
    var earnedXp = Math.max(8, baseXp + streakBonus + cleanBonus - mistakes * 3);
    next.xp += earnedXp;

    var stars = computeStars(mistakes, usedHint, usedXray, elapsedMs, digitsLen);
    if (levelId && next.levels[levelId]) {
      var lv = next.levels[levelId];
      lv.completed++;
      if (stars > lv.bestStars) lv.bestStars = stars;
      if (perfect && (lv.bestMs === null || elapsedMs < lv.bestMs)) {
        lv.bestMs = elapsedMs;
      }
    }

    if (result.notebookId && next.fathersDone.indexOf(result.notebookId) === -1) {
      next.fathersDone.push(result.notebookId);
    }

    next.recentHistory.unshift({
      dividend: dividend,
      divisor: divisor,
      mistakes: mistakes,
      elapsedMs: elapsedMs,
      stars: stars,
      xp: earnedXp,
      at: Date.now()
    });
    if (next.recentHistory.length > 24) next.recentHistory.length = 24;

    var newBadges = [];
    if (next.solved >= 1) unlockBadge(next, 'first-win', newBadges);
    if (next.bestStreak >= 5) unlockBadge(next, 'flawless-5', newBadges);
    if (next.zeroPerfectSolved >= 3) unlockBadge(next, 'zero-hunter', newBadges);
    if (next.fathersDone.length >= 3) unlockBadge(next, 'fathers-notebook', newBadges);
    if (digitsLen >= 4 && perfect && !usedXray) unlockBadge(next, 'xray-off', newBadges);
    if (digitsLen >= 3 && perfect && elapsedMs > 0 && elapsedMs <= 15000) unlockBadge(next, 'speed-demon', newBadges);
    if (digitsLen >= 5 && perfect) unlockBadge(next, 'five-digits', newBadges);

    var d9 = next.divisors[9];
    if (d9 && d9.attempts >= 10 && (d9.correct / d9.attempts) >= 0.9) {
      unlockBadge(next, 'table-9-ace', newBadges);
    }

    var allDone = true;
    for (var lvIdx = 1; lvIdx <= 8; lvIdx++) {
      if (!next.levels[lvIdx] || next.levels[lvIdx].bestStars < 1) {
        allDone = false;
        break;
      }
    }
    if (allDone) unlockBadge(next, 'all-8-levels', newBadges);

    return {
      state: next,
      earnedXp: earnedXp,
      stars: stars,
      perfect: perfect,
      newBadges: newBadges
    };
  }

  function recordDrillResult(state, divisor, correct, durationMs, currentCombo) {
    var next = recordStepTelemetry(state, divisor, correct, durationMs);
    var newBadges = [];
    if (correct) {
      next.drillTotalCorrect++;
      next.xp += 3 + Math.min(7, Math.floor((currentCombo || 1) / 3));
      if ((currentCombo || 1) > next.drillBestCombo) {
        next.drillBestCombo = currentCombo || 1;
      }
      if (next.drillBestCombo >= 15) {
        unlockBadge(next, 'drill-combo-15', newBadges);
      }
    }
    var d9 = next.divisors[9];
    if (d9 && d9.attempts >= 10 && (d9.correct / d9.attempts) >= 0.9) {
      unlockBadge(next, 'table-9-ace', newBadges);
    }
    return { state: next, newBadges: newBadges };
  }

  function getDivisorStats(state) {
    var out = [];
    for (var d = 2; d <= 9; d++) {
      var st = state.divisors[d] || { attempts: 0, correct: 0, totalMs: 0, solvedProblems: 0 };
      var acc = st.attempts > 0 ? Math.round((st.correct / st.attempts) * 100) : null;
      var avgMs = st.attempts > 0 ? Math.round(st.totalMs / st.attempts) : null;
      out.push({
        divisor: d,
        attempts: st.attempts,
        correct: st.correct,
        accuracy: acc,
        avgMs: avgMs,
        solvedProblems: st.solvedProblems
      });
    }
    return out;
  }

  function getWeakestDivisors(state, count) {
    var stats = getDivisorStats(state).filter(function (s) { return s.attempts >= 3; });
    stats.sort(function (a, b) {
      var scoreA = (a.accuracy != null ? a.accuracy : 100) - (a.avgMs ? a.avgMs / 250 : 0);
      var scoreB = (b.accuracy != null ? b.accuracy : 100) - (b.avgMs ? b.avgMs / 250 : 0);
      return scoreA - scoreB;
    });
    return stats.slice(0, count || 3).map(function (s) { return s.divisor; });
  }

  function load() {
    try {
      if (typeof localStorage === 'undefined') return createDefaultState();
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      return mergeState(JSON.parse(raw));
    } catch (e) {
      return createDefaultState();
    }
  }

  function save(state) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) { /* modo privado o cuota llena */ }
    return state;
  }

  function reset() {
    var fresh = createDefaultState();
    save(fresh);
    return fresh;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    RANKS: RANKS,
    BADGES: BADGES,
    createDefaultState: createDefaultState,
    mergeState: mergeState,
    getRank: getRank,
    isLevelUnlocked: isLevelUnlocked,
    computeStars: computeStars,
    recordStepTelemetry: recordStepTelemetry,
    recordDivisionComplete: recordDivisionComplete,
    recordDrillResult: recordDrillResult,
    getDivisorStats: getDivisorStats,
    getWeakestDivisors: getWeakestDivisors,
    load: load,
    save: save,
    reset: reset
  };
}));
