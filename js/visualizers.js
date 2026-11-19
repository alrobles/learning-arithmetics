/* Visualizadores interactivos en Canvas 2D (DPR-aware, sin librerías):
 *  1. drawMultipleRadar: dial de múltiplos d×1..d×9 con aguja en el dividendo parcial y brecha del resto
 *  2. drawAreaProof: demostración geométrica proporcional de d × c + r = D
 *  3. drawBase10Sharing: cámaras de reparto en Base 10 con bloques (1000, 100, 10, 1) y desagrupación viva
 *  4. drawMasteryDial: cronógrafo circular de dominio por tabla (2..9) para aventura.html y portada */
(function (root) {
  'use strict';

  var C = {
    bg: '#0c0f14',
    chamber: '#161b23',
    ivory: '#f2ede2',
    silver: '#b9c1cd',
    muted: '#8e98a8',
    hair: 'rgba(242, 237, 226, 0.12)',
    brass: '#e5b339',
    brassSoft: 'rgba(229, 179, 57, 0.18)',
    sky: '#56b6f7',
    skySoft: 'rgba(86, 182, 247, 0.22)',
    emerald: '#38d9a9',
    emeraldSoft: 'rgba(56, 217, 169, 0.20)',
    crimson: '#e85d56',
    crimsonSoft: 'rgba(232, 93, 86, 0.24)'
  };

  function setupCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(10, Math.floor(rect.width));
    var h = Math.max(10, Math.floor(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /**
   * 1. RADAR DE MÚLTIPLOS (recta graduada 0..d×10 con aguja en working y salto de resto)
   */
  function drawMultipleRadar(canvas, opts) {
    if (!canvas) return;
    var s = setupCanvas(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    var d = opts.divisor || 9;
    var working = opts.working != null ? opts.working : 0;
    var revealAnswer = !!opts.revealAnswer;
    var chosenQ = opts.chosenQ;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    var padL = 24, padR = 24;
    var axisY = Math.round(h * 0.62);
    var usableW = w - padL - padR;
    var maxVal = d * 10;

    function xOf(val) {
      return padL + (Math.min(Math.max(val, 0), maxVal) / maxVal) * usableW;
    }

    // Carril base
    ctx.strokeStyle = 'rgba(242,237,226,0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, axisY);
    ctx.lineTo(w - padR, axisY);
    ctx.stroke();

    var exactQ = Math.floor(working / d);
    var prod = exactQ * d;
    var wx = xOf(working);

    // Zona válida <= working
    ctx.fillStyle = C.brassSoft;
    ctx.fillRect(padL, axisY - 5, Math.max(0, wx - padL), 10);

    // Si hay respuesta revelada o elegida, marcar producto y brecha de resto
    if (revealAnswer || chosenQ != null) {
      var qShow = chosenQ != null ? chosenQ : exactQ;
      var px = xOf(qShow * d);
      ctx.fillStyle = C.emeraldSoft;
      ctx.fillRect(padL, axisY - 6, Math.max(0, px - padL), 12);
      if (working > qShow * d) {
        ctx.fillStyle = C.crimsonSoft;
        ctx.fillRect(px, axisY - 6, Math.max(2, wx - px), 12);
      }
    }

    // Aguja del dividendo parcial actual (se dibuja antes de las etiquetas ×k para no taparlas)
    ctx.strokeStyle = opts.completed ? C.emerald : C.brass;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, 25);
    ctx.lineTo(wx, axisY + 9);
    ctx.stroke();

    // Marcas de múltiplos d×0 .. d×10
    ctx.textAlign = 'center';
    for (var k = 0; k <= 10; k++) {
      var val = k * d;
      var x = xOf(val);
      var isExactHit = revealAnswer && k === exactQ;
      var isPast = val > working;

      ctx.strokeStyle = isExactHit ? C.emerald : (isPast ? 'rgba(242,237,226,0.18)' : 'rgba(242,237,226,0.45)');
      ctx.lineWidth = isExactHit ? 2.4 : 1.25;
      ctx.beginPath();
      ctx.moveTo(x, axisY - (isExactHit ? 12 : 8));
      ctx.lineTo(x, axisY + (isExactHit ? 12 : 8));
      ctx.stroke();

      // Etiqueta del múltiplo abajo
      ctx.font = (isExactHit ? '700 ' : '500 ') + '11px "JetBrains Mono", monospace';
      ctx.fillStyle = isExactHit ? C.emerald : (isPast ? '#667080' : C.silver);
      ctx.fillText(String(val), x, axisY + 24);

      // Factor ×k arriba con respaldo limpio del fondo para legibilidad sobre la aguja
      if (k <= 9) {
        var tag = '×' + k;
        ctx.font = (isExactHit ? '700 ' : '500 ') + '10.5px "JetBrains Mono", monospace';
        var tagW = ctx.measureText(tag).width + 6;
        ctx.fillStyle = C.bg;
        ctx.fillRect(x - tagW / 2, axisY - 26, tagW, 13);
        ctx.fillStyle = isExactHit ? C.emerald : '#7b8699';
        ctx.fillText(tag, x, axisY - 16);
      }
    }

    // Cabezal de la aguja con el valor working
    var label = opts.completed ? ('resto ' + working) : String(working);
    ctx.font = '700 11.5px "JetBrains Mono", monospace';
    var tw = Math.max(30, ctx.measureText(label).width + 14);
    var bx = Math.min(Math.max(wx - tw / 2, 6), w - tw - 6);
    roundRect(ctx, bx, 5, tw, 20, 5);
    ctx.fillStyle = opts.completed ? C.emerald : (working < d ? C.crimson : C.brass);
    ctx.fill();
    ctx.fillStyle = '#101318';
    ctx.fillText(label, bx + tw / 2, 19);

    // Leyenda inferior izquierda/derecha
    ctx.textAlign = 'left';
    ctx.font = '500 11px "Manrope", sans-serif';
    ctx.fillStyle = C.muted;
    ctx.fillText('Tabla del ' + d, 12, h - 7);

    ctx.textAlign = 'right';
    if (opts.completed) {
      ctx.fillStyle = C.emerald;
      ctx.fillText('División verificada · resto ' + working + ' < ' + d, w - 12, h - 7);
    } else if (working < d) {
      ctx.fillStyle = C.brass;
      ctx.fillText(working + ' < ' + d + ' → cero al cociente', w - 12, h - 7);
    } else if (revealAnswer) {
      ctx.fillStyle = C.emerald;
      ctx.fillText(d + ' × ' + exactQ + ' = ' + prod + ' · sobra ' + (working - prod), w - 12, h - 7);
    } else {
      ctx.fillStyle = C.silver;
      ctx.fillText('Busca el mayor múltiplo ≤ ' + working, w - 12, h - 7);
    }
  }

  /**
   * 2. COMPROBACIÓN GEOMÉTRICA DE ÁREA (d × c + r = D)
   */
  function drawAreaProof(canvas, opts) {
    if (!canvas) return;
    var s = setupCanvas(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    var D = opts.dividend || 1;
    var d = opts.divisor || 1;
    var q = opts.quotient != null ? opts.quotient : Math.floor(D / d);
    var r = opts.remainder != null ? opts.remainder : (D % d);
    var progress = opts.progress != null ? opts.progress : 1; // 0..1

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    var padX = 28, padTop = 34, padBot = 36;
    var boxW = w - padX * 2;
    var boxH = Math.max(44, h - padTop - padBot);

    var mainFrac = D > 0 ? ((d * q) / D) : 1;
    var remW = r > 0 ? Math.max(44, Math.min(86, boxW * (1 - mainFrac) * 8)) : 0;
    var mainW = (boxW - (r > 0 ? remW + 8 : 0)) * progress;

    // Título superior
    ctx.font = '600 11.5px "JetBrains Mono", monospace';
    ctx.fillStyle = C.muted;
    ctx.textAlign = 'left';
    ctx.fillText('COMPROBACIÓN GEOMÉTRICA', padX, 19);
    ctx.textAlign = 'right';
    ctx.fillStyle = progress >= 1 ? C.emerald : C.brass;
    ctx.fillText(d + ' × ' + q + (r > 0 ? ' + ' + r : '') + ' = ' + (d * q + r), w - padX, 19);

    // Rectángulo principal dividido en d filas iguales (cada fila vale c)
    roundRect(ctx, padX, padTop, Math.max(6, mainW), boxH, 8);
    ctx.fillStyle = 'rgba(86, 182, 247, 0.14)';
    ctx.fill();
    ctx.strokeStyle = C.sky;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Líneas horizontales mostrando las d partes iguales
    var rows = Math.min(d, 9);
    ctx.strokeStyle = 'rgba(86, 182, 247, 0.28)';
    ctx.lineWidth = 1;
    for (var i = 1; i < rows; i++) {
      var ry = padTop + (boxH * i) / rows;
      ctx.beginPath();
      ctx.moveTo(padX + 1, ry);
      ctx.lineTo(padX + Math.max(6, mainW) - 1, ry);
      ctx.stroke();
    }

    // Etiqueta del área principal
    if (mainW > 90) {
      ctx.textAlign = 'center';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillStyle = C.ivory;
      ctx.fillText(d + ' × ' + q + ' = ' + (d * q), padX + mainW / 2, padTop + boxH / 2 + 5);
    }

    // Barra lateral del resto (si r > 0)
    if (r > 0 && progress > 0.4) {
      var rx = padX + mainW + 8;
      var remH = Math.max(22, boxH * (r / d));
      var ry0 = padTop + (boxH - remH);
      roundRect(ctx, rx, ry0, remW, remH, 6);
      ctx.fillStyle = C.crimsonSoft;
      ctx.fill();
      ctx.strokeStyle = C.crimson;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffaba6';
      ctx.fillText('+' + r, rx + remW / 2, ry0 + remH / 2 + 4.5);
    }

    // Cota inferior
    ctx.textAlign = 'left';
    ctx.font = '500 11px "Manrope", sans-serif';
    ctx.fillStyle = C.muted;
    ctx.fillText(d + ' grupos iguales de ' + q, padX, h - 12);
    ctx.textAlign = 'right';
    ctx.fillStyle = r === 0 ? C.emerald : C.crimson;
    ctx.fillText(r === 0 ? 'División exacta (resto 0)' : 'Resto ' + r + ' < divisor ' + d, w - padX, h - 12);
  }

  /**
   * 3. REPARTO EN BASE 10 (bloques por orden de magnitud repartidos en d cámaras)
   */
  function drawBase10Sharing(canvas, opts) {
    if (!canvas || !root.DivisionEngine) return;
    var s = setupCanvas(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    var D = opts.dividend || 6418;
    var d = opts.divisor || 8;
    var stageIdx = opts.stageIndex != null ? opts.stageIndex : 0;
    var animT = opts.animT != null ? opts.animT : 1; // 0..1

    var model = root.DivisionEngine.base10Stages(D, d);
    var safeIdx = Math.min(Math.max(0, stageIdx), model.stages.length - 1);
    var stage = model.stages[safeIdx];

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);

    var palette = ['#56b6f7', '#38d9a9', '#e5b339', '#b197fc', '#ff922b'];
    var blockColor = palette[stage.power % palette.length];

    var hideAnswer = !!opts.hideAnswer;

    // Cabecera de fase
    ctx.font = '700 12.5px "JetBrains Mono", monospace';
    ctx.fillStyle = C.ivory;
    ctx.textAlign = 'left';
    ctx.fillText(stage.label.toUpperCase() + ' (×' + stage.shortLabel + ')', 16, 22);

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = C.brass;
    ctx.fillText(
      hideAnswer
        ? (stage.available + ' ÷ ' + d + ' = ? c/u')
        : (stage.available + ' ÷ ' + d + ' = ' + stage.perGroup + ' c/u · sobran ' + stage.leftover),
      w - 16,
      22
    );

    // Zona superior: reserva / desagrupación entrante
    var topY = 34, topH = 44;
    roundRect(ctx, 16, topY, w - 32, topH, 8);
    ctx.fillStyle = 'rgba(242,237,226,0.03)';
    ctx.fill();
    ctx.strokeStyle = C.hair;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '500 11.5px "Manrope", sans-serif';
    ctx.fillStyle = C.silver;
    var originText = stage.incomingFromRegroup > 0
      ? 'Desagrupados del paso anterior (' + stage.incomingFromRegroup + ') + cifra original (' + stage.original + ') = ' + stage.available + ' bloques de ' + stage.shortLabel
      : 'Cifra inicial: ' + stage.original + ' bloques de ' + stage.shortLabel + ' listos para repartir en ' + d + ' cámaras';
    ctx.fillText(originText, 26, topY + 26);

    // Zona central: d cámaras iguales
    var chY = topY + topH + 14;
    var chH = Math.max(76, h - chY - 46);
    var gap = 8;
    var totalW = w - 32;
    var chW = (totalW - gap * (d - 1)) / d;

    for (var g = 0; g < d; g++) {
      var cx = 16 + g * (chW + gap);
      roundRect(ctx, cx, chY, chW, chH, 8);
      ctx.fillStyle = stage.perGroup > 0 ? 'rgba(22, 27, 35, 0.95)' : 'rgba(22, 27, 35, 0.45)';
      ctx.fill();
      ctx.strokeStyle = stage.perGroup > 0 ? 'rgba(242,237,226,0.18)' : 'rgba(242,237,226,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Número de cámara
      ctx.textAlign = 'center';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = C.muted;
      ctx.fillText('G' + (g + 1), cx + chW / 2, chY + 14);

      // Dibujar los bloques asignados a esta cámara (o signo ? si aún no se responde)
      var count = hideAnswer ? 0 : stage.perGroup;
      if (hideAnswer) {
        ctx.font = '700 15px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(229,179,57,0.55)';
        ctx.fillText('?', cx + chW / 2, chY + chH / 2 + 4);
      } else if (count > 0) {
        var cols = count <= 3 ? count : Math.min(3, Math.ceil(Math.sqrt(count)));
        var rows = Math.ceil(count / cols);
        var cellPad = 6;
        var availW = chW - cellPad * 2;
        var availH = chH - 36;
        var sz = Math.max(6, Math.min(18, Math.floor(Math.min(availW / cols, availH / rows) - 3)));
        var startX = cx + (chW - (cols * (sz + 3) - 3)) / 2;
        var startY = chY + 22 + (availH - (rows * (sz + 3) - 3)) / 2;

        for (var b = 0; b < count; b++) {
          var bc = b % cols;
          var br = Math.floor(b / cols);
          var bx = startX + bc * (sz + 3);
          var by = startY + br * (sz + 3) - (1 - animT) * 28;
          ctx.globalAlpha = Math.min(1, animT * 1.25);
          roundRect(ctx, bx, by, sz, sz, 3);
          ctx.fillStyle = blockColor;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else {
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(229,179,57,0.7)';
        ctx.fillText('0', cx + chW / 2, chY + chH / 2 + 4);
      }

      // Contador al fondo de cada cámara
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = hideAnswer ? C.muted : (stage.perGroup > 0 ? C.emerald : C.muted);
      ctx.fillText(hideAnswer ? '—' : String(stage.perGroup), cx + chW / 2, chY + chH - 7);
    }

    // Bandeja inferior de sobrante / desagrupación
    var botY = chY + chH + 10;
    roundRect(ctx, 16, botY, w - 32, 28, 6);
    ctx.fillStyle = hideAnswer ? 'rgba(229, 179, 57, 0.10)' : (stage.leftover > 0 ? 'rgba(232, 93, 86, 0.13)' : 'rgba(56, 217, 169, 0.10)');
    ctx.fill();
    ctx.strokeStyle = hideAnswer ? 'rgba(229, 179, 57, 0.36)' : (stage.leftover > 0 ? 'rgba(232, 93, 86, 0.42)' : 'rgba(56, 217, 169, 0.35)');
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '600 11.5px "JetBrains Mono", monospace';
    ctx.fillStyle = hideAnswer ? C.brass : (stage.leftover > 0 ? '#ffaba6' : C.emerald);
    var botMsg;
    if (hideAnswer) {
      botMsg = 'Escribe el cociente para repartir estos ' + stage.available + ' bloques en ' + d + ' cámaras';
    } else if (stage.leftover === 0) {
      botMsg = 'Reparto exacto en esta posición · resto parcial 0';
    } else if (stage.regroupsIntoNext > 0) {
      botMsg = 'Sobran ' + stage.leftover + ' de ' + stage.shortLabel + ' → se transforman en ' + stage.regroupsIntoNext + ' del siguiente orden';
    } else {
      botMsg = 'Resto final irrepartible: ' + stage.leftover + ' unidades (< ' + d + ')';
    }
    ctx.fillText(botMsg, w / 2, botY + 18);
  }

  /**
   * 4. CRONÓGRAFO DE DOMINIO POR DIVISOR (dial circular de las 8 tablas: 2..9)
   */
  function drawMasteryDial(canvas, divisorStats) {
    if (!canvas) return;
    var s = setupCanvas(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);

    var cx = w / 2, cy = h / 2;
    var R = Math.min(w, h) * 0.41;
    var innerR = R * 0.46;

    // Anillos concéntricos de relojería
    ctx.strokeStyle = C.hair;
    ctx.lineWidth = 1;
    [0.46, 0.72, 1.0].forEach(function (f) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
      ctx.stroke();
    });

    var stats = divisorStats || [];
    var n = stats.length || 8;
    var stepAngle = (Math.PI * 2) / n;

    for (var i = 0; i < n; i++) {
      var st = stats[i] || { divisor: i + 2, attempts: 0, accuracy: null };
      var a0 = -Math.PI / 2 + i * stepAngle + 0.05;
      var a1 = -Math.PI / 2 + (i + 1) * stepAngle - 0.05;
      var mid = (a0 + a1) / 2;
      var acc = st.accuracy != null ? st.accuracy : 0;
      var fillR = innerR + (R - innerR) * (st.attempts > 0 ? Math.max(0.18, acc / 100) : 0.08);

      ctx.beginPath();
      ctx.arc(cx, cy, fillR, a0, a1);
      ctx.arc(cx, cy, innerR, a1, a0, true);
      ctx.closePath();

      if (st.attempts === 0) {
        ctx.fillStyle = 'rgba(242,237,226,0.06)';
      } else if (acc >= 90) {
        ctx.fillStyle = 'rgba(56, 217, 169, 0.46)';
      } else if (acc >= 70) {
        ctx.fillStyle = 'rgba(229, 179, 57, 0.48)';
      } else {
        ctx.fillStyle = 'rgba(232, 93, 86, 0.48)';
      }
      ctx.fill();

      ctx.strokeStyle = st.attempts === 0 ? 'rgba(242,237,226,0.14)' : (acc >= 90 ? C.emerald : acc >= 70 ? C.brass : C.crimson);
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Etiqueta exterior ÷d
      var lx = cx + Math.cos(mid) * (R + 18);
      var ly = cy + Math.sin(mid) * (R + 18);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillStyle = C.ivory;
      ctx.fillText('÷' + st.divisor, lx, ly);

      // Porcentaje dentro si hay datos
      if (st.attempts > 0) {
        var px = cx + Math.cos(mid) * (innerR + (R - innerR) * 0.56);
        var py = cy + Math.sin(mid) * (innerR + (R - innerR) * 0.56);
        ctx.font = '700 10.5px "JetBrains Mono", monospace';
        ctx.fillStyle = C.ivory;
        ctx.fillText(acc + '%', px, py);
      }
    }

    // Centro del cronógrafo
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 4, 0, Math.PI * 2);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(229,179,57,0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    var totalAtt = stats.reduce(function (a, b) { return a + b.attempts; }, 0);
    var totalOk = stats.reduce(function (a, b) { return a + b.correct; }, 0);
    var globalAcc = totalAtt > 0 ? Math.round((totalOk / totalAtt) * 100) + '%' : '—';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.fillStyle = C.brass;
    ctx.fillText(globalAcc, cx, cy - 6);
    ctx.font = '600 10px "Manrope", sans-serif';
    ctx.fillStyle = C.muted;
    ctx.fillText('PRECISIÓN', cx, cy + 14);
  }

  root.ChronoVisuals = {
    drawMultipleRadar: drawMultipleRadar,
    drawAreaProof: drawAreaProof,
    drawBase10Sharing: drawBase10Sharing,
    drawMasteryDial: drawMasteryDial
  };
}(typeof window !== 'undefined' ? window : this));
