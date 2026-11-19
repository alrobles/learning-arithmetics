/* Motor aritmético puro para división directa (algoritmo saltando pasos, sin cero inicial).
 * Compatible con navegador (window.DivisionEngine) y Node (module.exports). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DivisionEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var FATHERS_NOTEBOOK = [
    {
      id: 'pap-6418',
      dividend: 6418,
      divisor: 8,
      title: 'Anatomía del cuaderno',
      tag: 'Cero al cociente · resto 2',
      note: 'El ejemplo etiquetado con divisor, dividendo, cociente y resto rodeado: 0 1 8 en una sola fila.'
    },
    {
      id: 'pap-3749',
      dividend: 3749,
      divisor: 4,
      title: 'Salto continuo de restas',
      tag: '4 cifras · resto 1',
      note: 'Subrayado amarillo en 37 y tres restas mentales encadenadas (14, 29, 1) sin cero inicial.'
    },
    {
      id: 'pap-45639',
      dividend: 45639,
      divisor: 9,
      title: 'Desafío de 5 cifras exacto',
      tag: '5 cifras · 0 6 3 en una fila',
      note: 'Cinco cifras entre 9 con salto en cero al cociente (6 < 9) y cierre exacto en 0.'
    }
  ];

  var LEVELS = [
    {
      id: 1,
      slug: 'primeras-casitas',
      name: 'Primeras Casitas Exactas',
      short: '2 cifras · exactas',
      targetCount: 4,
      divisors: [2, 3, 4, 5],
      allowXrayDefault: true,
      description: 'Dos cifras que se reparten sin sobrante y arrancan desde la primera cifra.'
    },
    {
      id: 2,
      slug: 'primer-resto',
      name: 'El Primer Resto',
      short: '2 cifras · con resto',
      targetCount: 4,
      divisors: [2, 3, 4, 5, 6, 7],
      allowXrayDefault: true,
      description: 'Resta mental con sobrante distinto de cero; el resto final se rodea.'
    },
    {
      id: 3,
      slug: 'subrayado-amarillo',
      name: 'Subrayado Amarillo',
      short: '2–3 cifras · d₀ < divisor',
      targetCount: 5,
      divisors: [3, 4, 5, 6, 7, 8, 9],
      allowXrayDefault: true,
      description: 'Cuando la primera cifra no alcanza, se subrayan las dos primeras sin escribir cero inicial.'
    },
    {
      id: 4,
      slug: 'salto-de-resta',
      name: 'Salto de Resta (3 Cifras)',
      short: '3 cifras · cálculo mental',
      targetCount: 5,
      divisors: [3, 4, 5, 6, 7, 8, 9],
      allowXrayDefault: false,
      description: 'Tres cifras completas saltando todas las restas escritas en tablas del 3 al 9.'
    },
    {
      id: 5,
      slug: 'cero-al-cociente',
      name: 'Cero al Cociente',
      short: '4 cifras · salto en la misma fila',
      targetCount: 5,
      divisors: [4, 5, 6, 7, 8, 9],
      allowXrayDefault: false,
      description: 'Al bajar una cifra y quedar menor que el divisor, escribe 0 arriba y baja la siguiente en la misma fila.'
    },
    {
      id: 6,
      slug: 'cuatro-cifras',
      name: 'Cuatro Cifras a Ritmo',
      short: '4 cifras · tablas 4–9',
      targetCount: 5,
      divisors: [4, 5, 6, 7, 8, 9],
      allowXrayDefault: false,
      description: 'Fluidez en divisiones largas de cuatro cifras con tablas exigentes (7, 8 y 9).'
    },
    {
      id: 7,
      slug: 'trampas-de-ceros',
      name: 'Trampas de Ceros',
      short: '4–5 cifras · dobles y finales',
      targetCount: 5,
      divisors: [3, 4, 6, 7, 8, 9],
      allowXrayDefault: false,
      description: 'Ceros consecutivos (como 8005 ÷ 4) y ceros finales (como 6401 ÷ 8) sin caer en la trampa.'
    },
    {
      id: 8,
      slug: 'maestro-cinco-cifras',
      name: 'Maestro de 5 Cifras',
      short: '5 cifras · nivel cuaderno',
      targetCount: 5,
      divisors: [6, 7, 8, 9],
      allowXrayDefault: false,
      description: 'Dividendos hasta 99 999 entre 6, 7, 8 y 9: velocidad, precisión y cero pistas.'
    }
  ];

  function createRng(seed) {
    if (seed == null) return Math.random;
    var s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  /**
   * Resuelve dividend ÷ divisor con el algoritmo directo saltando pasos (sin cero inicial).
   * Pensado para divisores de 1 cifra (1..9), con soporte seguro para cualquier entero positivo.
   */
  function solveDirect(dividend, divisor) {
    if (!Number.isInteger(dividend) || dividend < 0) {
      throw new Error('El dividendo debe ser un entero no negativo.');
    }
    if (!Number.isInteger(divisor) || divisor < 1) {
      throw new Error('El divisor debe ser un entero positivo.');
    }

    var str = String(dividend);
    var digits = str.split('').map(Number);
    var L = digits.length;
    var quotient = Math.floor(dividend / divisor);
    var remainder = dividend % divisor;

    // Caso borde: dividendo menor que el divisor (p. ej. 5 ÷ 8)
    if (dividend < divisor) {
      var edgeCol = L - 1;
      var edgeSteps = [
        {
          index: 0,
          type: 'quotient',
          col: edgeCol,
          row: -1,
          expected: 0,
          working: dividend,
          qForStep: 0,
          product: 0,
          remainderAfter: dividend,
          zeroSkip: false,
          trailingZero: true,
          sameRowDrop: false,
          isFinalRemainder: false,
          placeValue: 1,
          explanation: dividend + ' es menor que ' + divisor + ': cabe 0 veces y sobran ' + dividend + '.'
        },
        {
          index: 1,
          type: 'remainder',
          col: edgeCol,
          row: 0,
          expected: dividend,
          working: dividend,
          qForStep: 0,
          product: 0,
          remainderAfter: dividend,
          zeroSkip: false,
          trailingZero: false,
          sameRowDrop: false,
          isFinalRemainder: true,
          placeValue: 1,
          explanation: 'El resto final es ' + dividend + '.'
        }
      ];
      return {
        dividend: dividend,
        divisor: divisor,
        digits: digits,
        length: L,
        quotient: 0,
        remainder: dividend,
        startCol: edgeCol,
        highlightSpan: [0, edgeCol],
        needsTwoDigits: edgeCol > 0,
        quotientCells: [{ col: edgeCol, digit: 0 }],
        gridRows: [[{ col: edgeCol, digit: dividend, kind: 'final', stepIndex: 1 }]],
        finalRemCell: { row: 0, col: edgeCol, digit: dividend },
        steps: edgeSteps,
        hasInternalZero: false,
        hasTrailingZero: false,
        zeroCount: 1,
        directLinesSaved: 1,
        classicLongRows: buildClassicLong(dividend, divisor)
      };
    }

    // Encontrar el prefijo mínimo >= divisor (sin cero inicial)
    var startCol = 0;
    var working = digits[0];
    while (working < divisor && startCol + 1 < L) {
      startCol++;
      working = working * 10 + digits[startCol];
    }

    var highlightSpan = [0, startCol];
    var quotientCells = [];
    var gridRows = [];
    var steps = [];
    var currentRow = 0;
    var zeroCount = 0;
    var hasInternalZero = false;
    var hasTrailingZero = false;
    var finalRemCell = null;

    function pushRowCell(rowIdx, cell) {
      while (gridRows.length <= rowIdx) gridRows.push([]);
      gridRows[rowIdx].push(cell);
    }

    for (var col = startCol; col < L; col++) {
      var q = Math.floor(working / divisor);
      var prod = q * divisor;
      var rem = working - prod;
      var isFirst = (col === startCol);
      var isLast = (col === L - 1);
      var placeValue = Math.pow(10, L - 1 - col);

      var isZeroSkip = (q === 0 && !isLast);
      var isTrailingZero = (q === 0 && isLast);
      if (q === 0) {
        zeroCount++;
        if (isLast) hasTrailingZero = true;
        else hasInternalZero = true;
      }

      var qExplanation;
      if (isZeroSkip) {
        qExplanation = working + ' es menor que ' + divisor + ': escribe 0 en el cociente y baja el ' + digits[col + 1] + ' en la misma fila.';
      } else if (isTrailingZero) {
        qExplanation = working + ' es menor que ' + divisor + ': escribe 0 en el cociente; ' + rem + ' queda como resto final.';
      } else {
        qExplanation = '¿Cuántas veces cabe ' + divisor + ' en ' + working + '? Cabe ' + q + ' (' + divisor + ' × ' + q + ' = ' + prod + ').';
      }

      var qStepIndex = steps.length;
      steps.push({
        index: qStepIndex,
        type: 'quotient',
        col: col,
        row: -1,
        expected: q,
        working: working,
        qForStep: q,
        product: prod,
        remainderAfter: rem,
        zeroSkip: isZeroSkip,
        trailingZero: isTrailingZero,
        sameRowDrop: false,
        isFinalRemainder: false,
        placeValue: placeValue,
        explanation: qExplanation
      });
      quotientCells.push({ col: col, digit: q, stepIndex: qStepIndex });

      if (q === 0) {
        if (!isLast) {
          // Salto en cero al cociente: NO se escribe fila de resta ni nuevo resto;
          // se baja la siguiente cifra en la MISMA fila horizontal (p. ej. 0 6 3 ó 0 1 8).
          var nextDigitSame = digits[col + 1];
          var dropIdxSame = steps.length;
          var nextWorkingSame = working * 10 + nextDigitSame;
          steps.push({
            index: dropIdxSame,
            type: 'drop',
            col: col + 1,
            row: currentRow,
            expected: nextDigitSame,
            working: nextWorkingSame,
            qForStep: null,
            product: null,
            remainderAfter: null,
            zeroSkip: false,
            trailingZero: false,
            sameRowDrop: true,
            isFinalRemainder: false,
            placeValue: Math.pow(10, L - 2 - col),
            explanation: 'Baja el ' + nextDigitSame + ' en la misma fila para formar ' + nextWorkingSame + '.'
          });
          pushRowCell(currentRow, {
            col: col + 1,
            digit: nextDigitSame,
            kind: 'drop',
            sameRowAfterZero: true,
            stepIndex: dropIdxSame
          });
          working = nextWorkingSame;
        } else {
          // Cero al cociente en la última cifra: el dígito ya bajado en (currentRow, col) es el resto final
          var lastRow = gridRows[currentRow];
          if (lastRow && lastRow.length > 0) {
            lastRow[lastRow.length - 1].kind = 'final';
          }
          finalRemCell = { row: currentRow, col: col, digit: rem };
        }
      } else {
        // Salto de resta mental: escribir directamente el resto parcial
        if (!isFirst) {
          currentRow++;
        }
        var remStepIndex = steps.length;
        var remDigits = String(rem).split('').map(Number);
        steps.push({
          index: remStepIndex,
          type: 'remainder',
          col: col,
          row: currentRow,
          expected: rem,
          working: working,
          qForStep: q,
          product: prod,
          remainderAfter: rem,
          zeroSkip: false,
          trailingZero: false,
          sameRowDrop: false,
          isFinalRemainder: isLast,
          placeValue: placeValue,
          explanation: 'Resta mental: ' + working + ' − ' + prod + ' = ' + rem + (isLast ? ' (resto final).' : '.')
        });

        // Colocar cada dígito del resto alineado por unidades en col (para divisor 1 cifra es 1 dígito)
        for (var rd = 0; rd < remDigits.length; rd++) {
          var rCol = col - (remDigits.length - 1 - rd);
          pushRowCell(currentRow, {
            col: rCol,
            digit: remDigits[rd],
            kind: isLast ? 'final' : 'rem',
            stepIndex: remStepIndex
          });
        }

        if (isLast) {
          finalRemCell = { row: currentRow, col: col, digit: rem };
        } else {
          var nextDigit = digits[col + 1];
          var dropIdx = steps.length;
          var nextWorking = rem * 10 + nextDigit;
          steps.push({
            index: dropIdx,
            type: 'drop',
            col: col + 1,
            row: currentRow,
            expected: nextDigit,
            working: nextWorking,
            qForStep: null,
            product: null,
            remainderAfter: null,
            zeroSkip: false,
            trailingZero: false,
            sameRowDrop: false,
            isFinalRemainder: false,
            placeValue: Math.pow(10, L - 2 - col),
            explanation: 'Baja el ' + nextDigit + ' junto al ' + rem + ' para formar ' + nextWorking + '.'
          });
          pushRowCell(currentRow, {
            col: col + 1,
            digit: nextDigit,
            kind: 'drop',
            sameRowAfterZero: false,
            stepIndex: dropIdx
          });
          working = nextWorking;
        }
      }
    }

    var classicLongRows = buildClassicLong(dividend, divisor);
    var directLinesSaved = Math.max(0, classicLongRows.length - gridRows.length);

    return {
      dividend: dividend,
      divisor: divisor,
      digits: digits,
      length: L,
      quotient: quotient,
      remainder: remainder,
      startCol: startCol,
      highlightSpan: highlightSpan,
      needsTwoDigits: startCol > 0,
      quotientCells: quotientCells,
      gridRows: gridRows,
      finalRemCell: finalRemCell,
      steps: steps,
      hasInternalZero: hasInternalZero,
      hasTrailingZero: hasTrailingZero,
      zeroCount: zeroCount,
      directLinesSaved: directLinesSaved,
      classicLongRows: classicLongRows
    };
  }

  /**
   * Construye la traza del algoritmo largo tradicional (escribiendo cada resta −producto)
   * para la vista comparativa en guia.html y el visor Rayos-X.
   */
  function buildClassicLong(dividend, divisor) {
    var digits = String(dividend).split('').map(Number);
    var L = digits.length;
    var rows = [];
    if (dividend < divisor) {
      rows.push({ kind: 'sub', colEnd: L - 1, text: '−0', value: 0 });
      rows.push({ kind: 'rem', colEnd: L - 1, text: String(dividend), value: dividend, isFinal: true });
      return rows;
    }
    var startCol = 0;
    var working = digits[0];
    while (working < divisor && startCol + 1 < L) {
      startCol++;
      working = working * 10 + digits[startCol];
    }
    for (var col = startCol; col < L; col++) {
      var q = Math.floor(working / divisor);
      var prod = q * divisor;
      var rem = working - prod;
      var isLast = (col === L - 1);
      rows.push({ kind: 'sub', colEnd: col, text: '−' + prod, value: prod, q: q, working: working });
      if (isLast) {
        rows.push({ kind: 'rem', colEnd: col, text: String(rem), value: rem, isFinal: true });
      } else {
        var nextD = digits[col + 1];
        rows.push({ kind: 'rem', colEnd: col + 1, text: String(rem) + String(nextD), value: rem * 10 + nextD, isFinal: false });
        working = rem * 10 + nextD;
      }
    }
    return rows;
  }

  /**
   * Diagnóstico pedagógico ante una cifra incorrecta durante la práctica.
   */
  function diagnoseError(step, enteredDigit, divisor) {
    var n = Number(enteredDigit);
    if (!Number.isInteger(n) || n < 0 || n > 9) {
      return { code: 'invalid', message: 'Escribe una cifra del 0 al 9.' };
    }
    if (n === step.expected) {
      return { code: 'ok', message: 'Exacto.' };
    }

    if (step.type === 'quotient') {
      if (step.working < divisor && n > 0) {
        return {
          code: 'forgot-zero',
          message: 'Alerta de cero: ' + step.working + ' es menor que ' + divisor + '. Escribe 0 arriba para bajar la siguiente cifra en la misma fila.'
        };
      }
      var guessProd = n * divisor;
      if (guessProd > step.working) {
        return {
          code: 'too-big',
          message: 'Te pasaste: ' + divisor + ' × ' + n + ' = ' + guessProd + ', que supera a ' + step.working + '. Prueba una cifra menor.'
        };
      }
      var leftover = step.working - guessProd;
      if (leftover >= divisor) {
        return {
          code: 'too-small',
          message: 'Cabe más veces: ' + divisor + ' × ' + n + ' = ' + guessProd + ' y sobran ' + leftover + ' (≥ ' + divisor + '). Sube el cociente.'
        };
      }
      return {
        code: 'quotient-mismatch',
        message: 'Revisa cuántas veces cabe ' + divisor + ' en ' + step.working + '.'
      };
    }

    if (step.type === 'remainder') {
      if (n >= divisor) {
        return {
          code: 'rem-ge-divisor',
          message: 'El resto (' + n + ') nunca puede ser mayor o igual que el divisor (' + divisor + '). Revisa ' + step.working + ' − ' + step.product + '.'
        };
      }
      return {
        code: 'sub-slip',
        message: 'Revisa la resta mental: ' + divisor + ' × ' + step.qForStep + ' = ' + step.product + '. ¿Cuánto falta para llegar a ' + step.working + '?'
      };
    }

    if (step.type === 'drop') {
      return {
        code: 'wrong-drop',
        message: 'La cifra que toca bajar del dividendo es ' + step.expected + '.'
      };
    }

    return { code: 'mismatch', message: 'Intenta de nuevo.' };
  }

  /**
   * Genera un ejercicio calibrado para el nivel 1..8 (con semilla opcional para pruebas deterministas).
   */
  function generateProblem(levelId, options) {
    options = options || {};
    var rng = createRng(options.seed);
    var preferredDivisors = options.preferredDivisors;
    var level = LEVELS.find(function (l) { return l.id === levelId; }) || LEVELS[0];
    var pool = (preferredDivisors && preferredDivisors.length)
      ? preferredDivisors.filter(function (d) { return level.divisors.indexOf(d) !== -1; })
      : level.divisors;
    if (!pool.length) pool = level.divisors;

    for (var attempt = 0; attempt < 300; attempt++) {
      var d = pick(rng, pool);
      var D = 0;

      if (level.id === 1) {
        // 2 cifras, exacto, d0 >= d
        var q1 = randInt(rng, 10, Math.floor(99 / d));
        D = d * q1;
        var d0_1 = Math.floor(D / 10);
        if (D >= 10 && D <= 99 && d0_1 >= d && D % d === 0) {
          return { dividend: D, divisor: d, levelId: 1 };
        }
      } else if (level.id === 2) {
        // 2 cifras, resto > 0, d0 >= d
        var q2 = randInt(rng, 10, Math.floor(98 / d));
        var r2 = randInt(rng, 1, d - 1);
        D = d * q2 + r2;
        if (D >= 10 && D <= 99 && Math.floor(D / 10) >= d && D % d > 0) {
          return { dividend: D, divisor: d, levelId: 2 };
        }
      } else if (level.id === 3) {
        // 2 o 3 cifras con d0 < d (subrayado amarillo obligatorio)
        var digits3 = rng() < 0.45 ? 2 : 3;
        if (digits3 === 2) {
          D = randInt(rng, d + 1, Math.min(99, d * 10 - 1));
          if (Math.floor(D / 10) < d && D >= 10) {
            return { dividend: D, divisor: d, levelId: 3 };
          }
        } else {
          D = randInt(rng, 100, d * 100 - 1);
          var sol3 = solveDirect(D, d);
          if (sol3.needsTwoDigits && sol3.zeroCount === 0) {
            return { dividend: D, divisor: d, levelId: 3 };
          }
        }
      } else if (level.id === 4) {
        // 3 cifras variadas, sin ceros internos aún
        D = randInt(rng, 120, 999);
        var sol4 = solveDirect(D, d);
        if (sol4.quotient >= 20 && sol4.zeroCount === 0) {
          return { dividend: D, divisor: d, levelId: 4 };
        }
      } else if (level.id === 5) {
        // Cero interno obligatorio (estilo 6418 ÷ 8 o 45639 ÷ 9)
        var a5 = randInt(rng, 1, 9);
        var b5 = randInt(rng, 1, 9);
        var q5 = a5 * 100 + b5; // forma X0Y
        var r5 = rng() < 0.35 ? 0 : randInt(rng, 1, d - 1);
        D = d * q5 + r5;
        if (D >= 1000 && D <= 9999) {
          var sol5 = solveDirect(D, d);
          if (sol5.hasInternalZero) {
            return { dividend: D, divisor: d, levelId: 5 };
          }
        }
      } else if (level.id === 6) {
        // 4 cifras a ritmo con tablas 4..9
        D = randInt(rng, 1200, 9999);
        var sol6 = solveDirect(D, d);
        if (sol6.quotient >= 200) {
          return { dividend: D, divisor: d, levelId: 6 };
        }
      } else if (level.id === 7) {
        // Trampas de ceros: dobles ceros (X00Y) o ceros finales (XY0 / X00)
        var pattern = rng() < 0.55 ? 'double' : 'trailing';
        var q7;
        if (pattern === 'double') {
          q7 = randInt(rng, 1, 9) * 1000 + randInt(rng, 1, 9);
        } else {
          q7 = randInt(rng, 1, 9) * 100 + (rng() < 0.5 ? 0 : randInt(rng, 1, 9) * 10);
        }
        var r7 = rng() < 0.3 ? 0 : randInt(rng, 1, d - 1);
        D = d * q7 + r7;
        if (D >= 1000 && D <= 99999) {
          var sol7 = solveDirect(D, d);
          if (sol7.zeroCount >= 2 || sol7.hasTrailingZero) {
            return { dividend: D, divisor: d, levelId: 7 };
          }
        }
      } else {
        // Nivel 8: 5 cifras exigentes con divisores 6..9 (50% incluye algún cero)
        if (rng() < 0.5) {
          var q8z = randInt(rng, 1, 9) * 1000 + randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9);
          D = d * q8z + randInt(rng, 0, d - 1);
        } else {
          D = randInt(rng, 10000, 98999);
        }
        if (D >= 10000 && D <= 99999) {
          return { dividend: D, divisor: d, levelId: 8 };
        }
      }
    }

    // Respaldo determinista garantizado por nivel
    var fallbacks = {
      1: { dividend: 68, divisor: 2, levelId: 1 },
      2: { dividend: 75, divisor: 4, levelId: 2 },
      3: { dividend: 258, divisor: 6, levelId: 3 },
      4: { dividend: 685, divisor: 7, levelId: 4 },
      5: { dividend: 6418, divisor: 8, levelId: 5 },
      6: { dividend: 3749, divisor: 4, levelId: 6 },
      7: { dividend: 8005, divisor: 4, levelId: 7 },
      8: { dividend: 45639, divisor: 9, levelId: 8 }
    };
    return fallbacks[level.id] || fallbacks[1];
  }

  /**
   * Genera micro-retos para tablas.html (las 3 micro-habilidades del algoritmo saltando pasos).
   */
  function generateMicroDrill(mode, options) {
    options = options || {};
    var rng = createRng(options.seed);
    var divisors = (options.divisors && options.divisors.length) ? options.divisors : [2, 3, 4, 5, 6, 7, 8, 9];
    var d = pick(rng, divisors);

    if (mode === 'zero') {
      // Mezcla 55% trampa de cero (< divisor) y 45% sí cabe (>= divisor)
      var isZero = rng() < 0.55;
      var partial = isZero ? randInt(rng, 0, d - 1) : randInt(rng, d, Math.min(89, d * 9 + d - 1));
      var nextDigit = randInt(rng, 0, 9);
      return {
        mode: 'zero',
        divisor: d,
        partial: partial,
        nextDigit: nextDigit,
        isZero: isZero,
        expectedQ: Math.floor(partial / d),
        combinedIfZero: partial * 10 + nextDigit
      };
    }

    // Para 'fit' y 'sub': working entre d y d*10 - 1 (siempre q en 1..9)
    var q = randInt(rng, 1, 9);
    var r = randInt(rng, 0, d - 1);
    var working = d * q + r;
    return {
      mode: mode === 'sub' ? 'sub' : 'fit',
      divisor: d,
      working: working,
      q: q,
      product: d * q,
      expectedQ: q,
      expectedR: r
    };
  }

  /**
   * Descomposición exacta en Base 10 para el simulador de reparto físico (reparto.html y visualizers.js).
   * Garantiza: divisor * sum(perGroup * place) + finalRemainder === dividend.
   */
  function base10Stages(dividend, divisor) {
    var digits = String(dividend).split('').map(Number);
    var L = digits.length;
    var names = ['Unidades', 'Decenas', 'Centenas', 'Millares', 'Decenas de millar'];
    var shortNames = ['1', '10', '100', '1 000', '10 000'];
    var stages = [];
    var carry = 0;

    for (var i = 0; i < L; i++) {
      var power = L - 1 - i;
      var place = Math.pow(10, power);
      var incoming = carry * 10;
      var original = digits[i];
      var available = incoming + original;
      var perGroup = Math.floor(available / divisor);
      var sharedTotal = perGroup * divisor;
      var leftover = available - sharedTotal;

      stages.push({
        col: i,
        power: power,
        place: place,
        label: names[power] || ('10^' + power),
        shortLabel: shortNames[power] || String(place),
        original: original,
        incomingFromRegroup: incoming,
        available: available,
        perGroup: perGroup,
        sharedTotal: sharedTotal,
        leftover: leftover,
        regroupsIntoNext: (i < L - 1) ? leftover * 10 : 0
      });
      carry = leftover;
    }

    return {
      dividend: dividend,
      divisor: divisor,
      quotient: Math.floor(dividend / divisor),
      remainder: carry,
      stages: stages
    };
  }

  return {
    LEVELS: LEVELS,
    FATHERS_NOTEBOOK: FATHERS_NOTEBOOK,
    solveDirect: solveDirect,
    buildClassicLong: buildClassicLong,
    diagnoseError: diagnoseError,
    generateProblem: generateProblem,
    generateMicroDrill: generateMicroDrill,
    base10Stages: base10Stages
  };
}));
