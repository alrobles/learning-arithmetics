// Pruebas del motor aritmético y gamificación sin navegador ni dependencias: npm test
'use strict';

const E = require('../js/division-engine.js');
const G = require('../js/gamification.js');

let pass = 0;
let fail = 0;

function ok(cond, msg) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error('✗ ' + msg);
  }
}

function eq(a, b, msg) {
  const ja = JSON.stringify(a);
  const jb = JSON.stringify(b);
  ok(ja === jb, `${msg} (obtenido: ${ja}, esperado: ${jb})`);
}

console.log('── 1. Fidelidad exacta a las 3 divisiones del cuaderno ──');

// 1A. 45639 ÷ 9 = 5071, resto 0 (sin cero inicial, 0 6 3 en fila 0, 0 9 en fila 1, 0 en fila 2)
{
  const s = E.solveDirect(45639, 9);
  eq(s.quotient, 5071, '45639 ÷ 9 cociente');
  eq(s.remainder, 0, '45639 ÷ 9 resto');
  eq(s.highlightSpan, [0, 1], '45639 ÷ 9 subrayado amarillo en 45');
  eq(s.quotientCells.map((c) => [c.col, c.digit]), [[1, 5], [2, 0], [3, 7], [4, 1]], '45639 ÷ 9 columnas del cociente sin 0 inicial');
  eq(s.gridRows.length, 3, '45639 ÷ 9 tiene exactamente 3 filas bajo el dividendo');
  eq(s.gridRows[0].map((c) => [c.col, c.digit]), [[1, 0], [2, 6], [3, 3]], '45639 ÷ 9 fila 0 es "0 6 3" en la misma línea');
  eq(s.gridRows[1].map((c) => [c.col, c.digit]), [[3, 0], [4, 9]], '45639 ÷ 9 fila 1 es "0 9"');
  eq(s.gridRows[2].map((c) => [c.col, c.digit]), [[4, 0]], '45639 ÷ 9 fila 2 es "0"');
  eq(s.finalRemCell, { row: 2, col: 4, digit: 0 }, '45639 ÷ 9 resto final rodeado en (2,4)');
  ok(s.hasInternalZero === true, '45639 ÷ 9 detecta cero interno al cociente');
}

// 1B. 6418 ÷ 8 = 802, resto 2 (0 1 8 en fila 0, 2 en fila 1)
{
  const s = E.solveDirect(6418, 8);
  eq(s.quotient, 802, '6418 ÷ 8 cociente');
  eq(s.remainder, 2, '6418 ÷ 8 resto');
  eq(s.highlightSpan, [0, 1], '6418 ÷ 8 subrayado amarillo en 64');
  eq(s.quotientCells.map((c) => [c.col, c.digit]), [[1, 8], [2, 0], [3, 2]], '6418 ÷ 8 columnas del cociente');
  eq(s.gridRows.length, 2, '6418 ÷ 8 tiene exactamente 2 filas bajo el dividendo');
  eq(s.gridRows[0].map((c) => [c.col, c.digit]), [[1, 0], [2, 1], [3, 8]], '6418 ÷ 8 fila 0 es "0 1 8" en la misma línea');
  eq(s.gridRows[1].map((c) => [c.col, c.digit]), [[3, 2]], '6418 ÷ 8 fila 1 es "2"');
  eq(s.finalRemCell, { row: 1, col: 3, digit: 2 }, '6418 ÷ 8 resto final rodeado en (1,3)');
}

// 1C. 3749 ÷ 4 = 937, resto 1 (sin cero inicial: 1 4, 2 9, 1)
{
  const s = E.solveDirect(3749, 4);
  eq(s.quotient, 937, '3749 ÷ 4 cociente');
  eq(s.remainder, 1, '3749 ÷ 4 resto');
  eq(s.highlightSpan, [0, 1], '3749 ÷ 4 subrayado amarillo en 37');
  eq(s.quotientCells.map((c) => [c.col, c.digit]), [[1, 9], [2, 3], [3, 7]], '3749 ÷ 4 columnas del cociente sin 0 inicial');
  eq(s.gridRows.length, 3, '3749 ÷ 4 tiene 3 filas');
  eq(s.gridRows[0].map((c) => [c.col, c.digit]), [[1, 1], [2, 4]], '3749 ÷ 4 fila 0 es "1 4"');
  eq(s.gridRows[1].map((c) => [c.col, c.digit]), [[2, 2], [3, 9]], '3749 ÷ 4 fila 1 es "2 9"');
  eq(s.gridRows[2].map((c) => [c.col, c.digit]), [[3, 1]], '3749 ÷ 4 fila 2 es "1"');
  eq(s.finalRemCell, { row: 2, col: 3, digit: 1 }, '3749 ÷ 4 resto final rodeado en (2,3)');
}

console.log('── 2. Casos borde difíciles (dobles ceros, ceros finales, D < d) ──');

// Doble cero consecutivo: 8005 ÷ 4 = 2001, resto 1
{
  const s = E.solveDirect(8005, 4);
  eq(s.quotient, 2001, '8005 ÷ 4 cociente');
  eq(s.remainder, 1, '8005 ÷ 4 resto');
  eq(s.highlightSpan, [0, 0], '8005 ÷ 4 arranca en 1 cifra (8 >= 4)');
  eq(s.gridRows[0].map((c) => [c.col, c.digit]), [[0, 0], [1, 0], [2, 0], [3, 5]], '8005 ÷ 4 fila 0 encadena "0 0 0 5"');
  eq(s.gridRows[1].map((c) => [c.col, c.digit]), [[3, 1]], '8005 ÷ 4 fila 1 es resto 1');
  eq(s.zeroCount, 2, '8005 ÷ 4 cuenta 2 ceros al cociente');
}

// Doble cero final con resto: 6401 ÷ 8 = 800, resto 1
{
  const s = E.solveDirect(6401, 8);
  eq(s.quotient, 800, '6401 ÷ 8 cociente');
  eq(s.remainder, 1, '6401 ÷ 8 resto');
  eq(s.gridRows.length, 1, '6401 ÷ 8 resuelve todo en 1 sola fila "0 0 1"');
  eq(s.gridRows[0].map((c) => [c.col, c.digit]), [[1, 0], [2, 0], [3, 1]], '6401 ÷ 8 fila 0 es "0 0 1"');
  eq(s.finalRemCell, { row: 0, col: 3, digit: 1 }, '6401 ÷ 8 rodea el 1 final en (0,3)');
  ok(s.hasTrailingZero === true, '6401 ÷ 8 detecta cero final');
}

// Dividendo menor que divisor: 5 ÷ 8 = 0, resto 5
{
  const s = E.solveDirect(5, 8);
  eq(s.quotient, 0, '5 ÷ 8 cociente 0');
  eq(s.remainder, 5, '5 ÷ 8 resto 5');
  eq(s.finalRemCell, { row: 0, col: 0, digit: 5 }, '5 ÷ 8 resto en (0,0)');
}

console.log('── 3. Invariantes euclídeas y Base 10 en 2 400 divisiones (8 niveles) ──');
{
  let tested = 0;
  for (let lv = 1; lv <= 8; lv++) {
    for (let k = 0; k < 300; k++) {
      const p = E.generateProblem(lv, { seed: lv * 10000 + k + 1 });
      const s = E.solveDirect(p.dividend, p.divisor);
      const qFromCells = Number(s.quotientCells.map((c) => c.digit).join(''));
      const euclidOk = (s.divisor * s.quotient + s.remainder === s.dividend)
        && (s.remainder >= 0 && s.remainder < s.divisor)
        && (qFromCells === s.quotient)
        && (s.finalRemCell && s.finalRemCell.digit === s.remainder)
        && (s.dividend >= s.divisor ? s.quotientCells[0].digit > 0 : true);
      if (!euclidOk) {
        ok(false, `Invariante rota en nivel ${lv}: ${p.dividend} ÷ ${p.divisor}`);
        break;
      }
      // Verificar también la descomposición en base 10 en una muestra
      if (k < 40) {
        const b10 = E.base10Stages(p.dividend, p.divisor);
        const reconstructed = b10.stages.reduce((acc, st) => acc + st.perGroup * st.place * p.divisor, 0) + b10.remainder;
        if (reconstructed !== p.dividend) {
          ok(false, `Base-10 no cuadra para ${p.dividend} ÷ ${p.divisor}: ${reconstructed}`);
          break;
        }
      }
      tested++;
    }
  }
  ok(tested === 2400, `2 400 divisiones generadas y verificadas (euclídea + sin cero inicial + base 10)`);
}

console.log('── 4. Diagnóstico pedagógico de errores ──');
{
  const s = E.solveDirect(45639, 9);
  const qStepZero = s.steps.find((st) => st.zeroSkip); // working = 6, d = 9
  eq(E.diagnoseError(qStepZero, 1, 9).code, 'forgot-zero', 'Detecta olvido de cero al cociente');
  const qStepFirst = s.steps[0]; // working = 45, d = 9, expected 5
  eq(E.diagnoseError(qStepFirst, 6, 9).code, 'too-big', 'Detecta múltiplo pasado (9×6=54 > 45)');
  eq(E.diagnoseError(qStepFirst, 4, 9).code, 'too-small', 'Detecta cociente corto (sobran 9 >= 9)');
  const rStep = s.steps[1]; // working = 45, prod = 45, rem = 0
  eq(E.diagnoseError(rStep, 9, 9).code, 'rem-ge-divisor', 'Detecta resto >= divisor');
  eq(E.diagnoseError(rStep, 2, 9).code, 'sub-slip', 'Detecta desliz de resta mental');
}

console.log('── 5. Micro-retos (Múltiplos Relámpago) y Gamificación ──');
{
  for (let i = 0; i < 60; i++) {
    const f = E.generateMicroDrill('fit', { seed: 100 + i });
    ok(f.divisor * f.expectedQ + f.expectedR === f.working && f.expectedR < f.divisor, 'Micro-drill fit coherente');
    const z = E.generateMicroDrill('zero', { seed: 500 + i });
    ok((z.partial < z.divisor) === z.isZero, 'Micro-drill zero coherente');
  }
  let st = G.createDefaultState();
  ok(G.isLevelUnlocked(st, 1) && !G.isLevelUnlocked(st, 2), 'Inicialmente solo Nivel 1 desbloqueado');
  const res = G.recordDivisionComplete(st, {
    dividend: 6418,
    divisor: 8,
    levelId: 1,
    notebookId: 'pap-6418',
    mistakes: 0,
    usedHint: false,
    usedXray: false,
    elapsedMs: 12000,
    hadZeroInQuotient: true
  });
  st = res.state;
  ok(res.stars === 3 && res.earnedXp > 30, 'Resolución perfecta otorga 3 estrellas y XP');
  ok(G.isLevelUnlocked(st, 2), 'Nivel 2 se desbloquea tras completar Nivel 1');
  ok(res.newBadges.includes('first-win') && res.newBadges.includes('xray-off') && res.newBadges.includes('speed-demon'), 'Desbloquea medallas ganadas');
}

console.log(`\nResultado: ${pass} pruebas superadas, ${fail} fallos.`);
process.exit(fail > 0 ? 1 : 0);
