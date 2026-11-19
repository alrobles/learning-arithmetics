/* Controlador interactivo de la Casita Directa (algoritmo saltando pasos, teclado primero).
 * Soporta práctica interactiva, demostración paso a paso ("Ver cómo lo hace papá"),
 * modo Rayos-X (resta mental fantasmal), bajada automática o manual y diagnóstico inteligente. */
(function (root) {
  'use strict';

  function CasitaController(config) {
    this.gridEl = config.gridEl;
    this.coachEl = config.coachEl;
    this.xrayEl = config.xrayEl;
    this.numpadEl = config.numpadEl;
    this.onStepChange = config.onStepChange || function () {};
    this.onStepAttempt = config.onStepAttempt || function () {};
    this.onComplete = config.onComplete || function () {};

    this.autoDrop = config.autoDrop !== false;
    this.xrayOn = !!config.xrayOn;
    this.compact = !!config.compact;
    this.readOnly = !!config.readOnly;

    this.solution = null;
    this.stepCursor = 0;
    this.completed = false;
    this.mistakes = 0;
    this.usedHint = false;
    this.usedXray = false;
    this.startedAt = 0;
    this.stepStartedAt = 0;
    this.combo = 0;
    this.demoTimer = null;
    this.wrongFlash = false;

    this._bindEvents();
  }

  CasitaController.prototype._bindEvents = function () {
    var self = this;
    if (this.numpadEl && !this.readOnly) {
      if (root.ChronoNumpad) {
        root.ChronoNumpad.mount(this.numpadEl, {
          getTarget: function () {
            return self.gridEl ? self.gridEl.querySelector('.c-active') : null;
          },
          onPickup: function () {
            if (root.ChronoSound) root.ChronoSound.tick();
          },
          onCommit: function (digit) {
            self.inputDigit(digit);
          }
        });
      } else {
        this.numpadEl.innerHTML = '';
        for (var d = 0; d <= 9; d++) {
          (function (digit) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = String(digit);
            btn.setAttribute('aria-label', 'Escribir cifra ' + digit);
            btn.addEventListener('click', function () {
              self.inputDigit(digit);
            });
            self.numpadEl.appendChild(btn);
          }(d));
        }
      }
    }
  };

  CasitaController.prototype.stopDemo = function () {
    if (this.demoTimer) {
      clearTimeout(this.demoTimer);
      this.demoTimer = null;
    }
  };

  CasitaController.prototype.setAutoDrop = function (val) {
    this.autoDrop = !!val;
    if (this.autoDrop && this.solution && !this.completed) {
      this._advanceAutoDrops();
    }
  };

  CasitaController.prototype.setXray = function (val) {
    this.xrayOn = !!val;
    if (this.xrayOn && !this.completed && this.stepCursor > 0) {
      this.usedXray = true;
    }
    this.render();
  };

  CasitaController.prototype.load = function (dividend, divisor, meta) {
    this.stopDemo();
    this.meta = meta || {};
    this.solution = root.DivisionEngine.solveDirect(dividend, divisor);
    this.stepCursor = 0;
    this.completed = false;
    this.mistakes = 0;
    this.usedHint = false;
    this.usedXray = this.xrayOn;
    this.combo = 0;
    this.wrongFlash = false;
    this.startedAt = Date.now();
    this.stepStartedAt = this.startedAt;

    this.render();
    this._emitStep();
    this._setCoach(
      this.solution.needsTwoDigits
        ? 'Como ' + this.solution.digits[0] + ' es menor que ' + divisor + ', tomamos ' + this.solution.steps[0].working + ' (subrayado amarillo). Escribe la primera cifra del cociente.'
        : 'Empieza por ' + this.solution.digits[0] + ' ÷ ' + divisor + '. Escribe la primera cifra del cociente con el teclado.',
      'neutral'
    );
  };

  CasitaController.prototype.currentStep = function () {
    if (!this.solution || this.completed) return null;
    return this.solution.steps[this.stepCursor] || null;
  };

  CasitaController.prototype._advanceAutoDrops = function () {
    var self = this;
    var step = this.currentStep();
    if (!step || step.type !== 'drop' || !this.autoDrop) return;

    this.stopDemo();
    this.demoTimer = setTimeout(function () {
      if (root.ChronoSound) root.ChronoSound.tick();
      self.stepCursor++;
      self.stepStartedAt = Date.now();
      if (self.stepCursor >= self.solution.steps.length) {
        self._finish();
      } else {
        self.render();
        self._emitStep();
        var next = self.currentStep();
        if (next && next.zeroSkip) {
          self._setCoach('Fíjate bien: ' + next.working + ' es menor que ' + self.solution.divisor + '. ¿Qué va arriba?', 'warn');
        } else if (next) {
          self._setCoach('Se bajó el ' + step.expected + ' → ahora trabajas con ' + next.working + ' ÷ ' + self.solution.divisor + '.', 'neutral');
        }
        if (next && next.type === 'drop' && self.autoDrop) {
          self._advanceAutoDrops();
        }
      }
    }, 210);
  };

  CasitaController.prototype.inputDigit = function (digit) {
    if (this.readOnly || !this.solution || this.completed) return;
    var step = this.currentStep();
    if (!step) return;
    // Si hay un drop automático pendiente, completarlo al instante antes de aceptar el dígito siguiente
    if (step.type === 'drop' && this.autoDrop) {
      this.stopDemo();
      this.stepCursor++;
      step = this.currentStep();
      if (!step) { this._finish(); return; }
    }

    var now = Date.now();
    var stepMs = now - this.stepStartedAt;
    var n = Number(digit);

    if (n === step.expected) {
      this.wrongFlash = false;
      this.combo++;
      this.onStepAttempt({
        divisor: this.solution.divisor,
        step: step,
        correct: true,
        durationMs: stepMs
      });

      if (step.zeroSkip && root.ChronoSound) {
        root.ChronoSound.zeroJump();
      } else if (root.ChronoSound) {
        root.ChronoSound.stepOk(this.combo - 1);
      }

      this.stepCursor++;
      this.stepStartedAt = Date.now();

      if (this.stepCursor >= this.solution.steps.length) {
        this._finish();
        return;
      }

      this.render();
      this._emitStep();

      var next = this.currentStep();
      if (step.zeroSkip) {
        this._setCoach('¡Salto de cero exacto! 0 arriba y baja la siguiente cifra en la misma fila.', 'ok');
      } else if (step.type === 'quotient') {
        this._setCoach(
          this.solution.divisor + ' × ' + step.expected + ' = ' + step.product + '. Haz la resta mental y escribe cuánto sobra.',
          'ok'
        );
      } else if (step.type === 'remainder') {
        this._setCoach('Resta mental exacta (' + step.working + ' − ' + step.product + ' = ' + step.expected + ').', 'ok');
      }

      if (next && next.type === 'drop' && this.autoDrop) {
        this._advanceAutoDrops();
      }
    } else {
      this.mistakes++;
      this.combo = 0;
      this.wrongFlash = true;
      if (root.ChronoSound) root.ChronoSound.errorNudge();
      var diag = root.DivisionEngine.diagnoseError(step, n, this.solution.divisor);
      this.onStepAttempt({
        divisor: this.solution.divisor,
        step: step,
        correct: false,
        durationMs: stepMs,
        diagnosis: diag
      });
      this._setCoach(diag.message, 'err');
      this.render();
      var self = this;
      setTimeout(function () {
        self.wrongFlash = false;
        self.render();
      }, 360);
    }
  };

  CasitaController.prototype.giveHint = function () {
    if (!this.solution || this.completed) return;
    var step = this.currentStep();
    if (!step) return;
    this.usedHint = true;
    this._setCoach('Pista: ' + step.explanation, 'warn');
    this.render();
  };

  CasitaController.prototype.revealOneStep = function () {
    if (!this.solution || this.completed) return;
    var step = this.currentStep();
    if (!step) return;
    this.usedHint = true;
    this.inputDigit(step.expected);
  };

  /**
   * Reproduce la solución completa paso a paso (modo "Ver cómo lo hace papá" o portada viva).
   */
  CasitaController.prototype.playDemo = function (intervalMs, loop) {
    var self = this;
    this.stopDemo();
    if (!this.solution) return;
    this.stepCursor = 0;
    this.completed = false;
    this.render();
    this._emitStep();

    function advance() {
      if (!self.solution) return;
      if (self.stepCursor >= self.solution.steps.length) {
        self.completed = true;
        self.render();
        self._emitStep();
        if (loop) {
          self.demoTimer = setTimeout(function () {
            self.stepCursor = 0;
            self.completed = false;
            self.render();
            self._emitStep();
            self.demoTimer = setTimeout(advance, intervalMs || 950);
          }, 2600);
        }
        return;
      }
      var st = self.solution.steps[self.stepCursor];
      self.stepCursor++;
      var isEnd = self.stepCursor >= self.solution.steps.length;
      if (isEnd) self.completed = true;
      self.render();
      self._emitStep();
      if (self.coachEl) {
        self._setCoach(st.explanation, st.zeroSkip ? 'warn' : (isEnd ? 'ok' : 'neutral'));
      }
      self.demoTimer = setTimeout(advance, isEnd ? 1400 : (st.type === 'drop' ? Math.round((intervalMs || 950) * 0.65) : (intervalMs || 950)));
    }

    this.demoTimer = setTimeout(advance, intervalMs || 950);
  };

  CasitaController.prototype._finish = function () {
    this.stopDemo();
    this.completed = true;
    var elapsedMs = Date.now() - this.startedAt;
    if (root.ChronoSound) root.ChronoSound.victory();
    this.render();
    this._emitStep();
    var sol = this.solution;
    this._setCoach(
      '¡División completa! ' + sol.divisor + ' × ' + sol.quotient + (sol.remainder > 0 ? ' + ' + sol.remainder : '') + ' = ' + sol.dividend + ' · Resto ' + sol.remainder + '.',
      'ok'
    );
    this.onComplete({
      dividend: sol.dividend,
      divisor: sol.divisor,
      quotient: sol.quotient,
      remainder: sol.remainder,
      mistakes: this.mistakes,
      usedHint: this.usedHint,
      usedXray: this.usedXray,
      elapsedMs: elapsedMs,
      hadZeroInQuotient: sol.zeroCount > 0,
      levelId: this.meta.levelId || null,
      notebookId: this.meta.notebookId || null
    });
  };

  CasitaController.prototype._emitStep = function () {
    if (!this.solution) return;
    var step = this.currentStep();
    this.onStepChange({
      solution: this.solution,
      step: step,
      stepCursor: this.stepCursor,
      completed: this.completed
    });
  };

  CasitaController.prototype._setCoach = function (msg, state) {
    if (!this.coachEl) return;
    this.coachEl.className = 'coach-bar' + (state === 'ok' ? ' state-ok' : state === 'err' ? ' state-err' : state === 'warn' ? ' state-warn' : '');
    this.coachEl.textContent = msg;
  };

  CasitaController.prototype.render = function () {
    if (!this.gridEl || !this.solution) return;
    var sol = this.solution;
    var active = this.currentStep();
    var L = sol.length;

    this.gridEl.innerHTML = '';
    this.gridEl.className = 'casita-grid' + (this.compact ? ' compact' : '');
    this.gridEl.style.setProperty('--cols', String(L));

    // Fila 1: Cociente (celdas ya reveladas + celda activa si toca cociente)
    for (var qi = 0; qi < sol.quotientCells.length; qi++) {
      var qc = sol.quotientCells[qi];
      var revealed = qc.stepIndex < this.stepCursor;
      var isAct = !this.completed && active && active.index === qc.stepIndex;
      if (revealed || isAct) {
        var qEl = document.createElement('span');
        qEl.className = 'c-cell c-q' + (revealed && qc.digit === 0 ? ' is-zero' : '') + (isAct ? ' c-active' + (this.wrongFlash ? ' is-wrong' : '') : '');
        qEl.style.gridColumn = String(qc.col + 3);
        qEl.style.gridRow = '1';
        qEl.textContent = revealed ? String(qc.digit) : '';
        qEl.setAttribute('aria-label', revealed ? ('Cociente ' + qc.digit) : 'Escribe la siguiente cifra del cociente');
        this.gridEl.appendChild(qEl);
      }
    }

    // Fila 2: Divisor + Techo de la casita + Dígitos del dividendo
    var divEl = document.createElement('span');
    divEl.className = 'c-cell c-divisor';
    divEl.style.gridColumn = '1';
    divEl.style.gridRow = '2';
    divEl.textContent = String(sol.divisor);
    this.gridEl.appendChild(divEl);

    var bracket = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    bracket.setAttribute('class', 'c-bracket');
    bracket.setAttribute('viewBox', '0 0 100 100');
    bracket.setAttribute('preserveAspectRatio', 'none');
    bracket.setAttribute('aria-hidden', 'true');
    var bPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bPath.setAttribute('d', 'M 2 98 L 2 4 L 100 4');
    bPath.setAttribute('vector-effect', 'non-scaling-stroke');
    bracket.appendChild(bPath);
    this.gridEl.appendChild(bracket);

    for (var ci = 0; ci < L; ci++) {
      var dEl = document.createElement('span');
      var cls = 'c-cell c-div-digit';
      if (ci >= sol.highlightSpan[0] && ci <= sol.highlightSpan[1]) {
        cls += ' c-hl';
        if (ci === sol.highlightSpan[0]) cls += ' c-hl-start';
        if (ci === sol.highlightSpan[1]) cls += ' c-hl-end';
      }
      if (active && active.col === ci) {
        cls += ' c-col-focus';
      }
      dEl.className = cls;
      dEl.style.gridColumn = String(ci + 3);
      dEl.style.gridRow = '2';
      dEl.textContent = String(sol.digits[ci]);
      this.gridEl.appendChild(dEl);
    }

    // Filas 3+: Restos parciales y cifras bajadas (incluye 0 6 3 en la misma fila!)
    for (var rIdx = 0; rIdx < sol.gridRows.length; rIdx++) {
      var row = sol.gridRows[rIdx];
      for (var k = 0; k < row.length; k++) {
        var cell = row[k];
        var isRev = cell.stepIndex < this.stepCursor;
        var isCellAct = !this.completed && active && active.index === cell.stepIndex;
        if (!isRev && !isCellAct) continue;

        var cEl = document.createElement('span');
        var cCls = 'c-cell c-rem';
        if (cell.kind === 'drop') {
          cCls += cell.sameRowAfterZero ? ' is-drop is-same-row-drop' : ' is-drop';
          if (cell.stepIndex === this.stepCursor - 1) cCls += ' is-drop-anim';
        }
        if (this.completed && sol.finalRemCell && sol.finalRemCell.row === rIdx && sol.finalRemCell.col === cell.col) {
          cCls += ' is-final-circled' + (sol.remainder === 0 ? ' exact' : '');
        }
        if (isCellAct) {
          cCls += ' c-active' + (this.wrongFlash ? ' is-wrong' : '');
        }
        cEl.className = cCls;
        cEl.style.gridColumn = String(cell.col + 3);
        cEl.style.gridRow = String(rIdx + 3);
        cEl.textContent = isRev ? String(cell.digit) : '';
        this.gridEl.appendChild(cEl);
      }
    }

    // Visor Rayos-X (tira de prueba de la resta mental antes de soltar el paso)
    if (this.xrayEl) {
      if (this.xrayOn && active && !this.completed) {
        this.xrayEl.hidden = false;
        if (active.type === 'quotient') {
          this.xrayEl.innerHTML = '<span>RAYOS-X ·</span> <strong>' + active.working + '</strong> ÷ ' + sol.divisor
            + ' · múltiplo cercano ≤ ' + active.working + ': <strong>' + sol.divisor + ' × ' + active.expected + ' = ' + active.product + '</strong>';
        } else if (active.type === 'remainder') {
          this.xrayEl.innerHTML = '<span>RAYOS-X (resta que te saltas) ·</span> <strong>' + active.working + ' − ' + active.product + '</strong> = ?';
        } else {
          this.xrayEl.innerHTML = '<span>RAYOS-X ·</span> Baja la cifra <strong>' + active.expected + '</strong> a la columna ' + (active.col + 1) + '.';
        }
      } else {
        this.xrayEl.hidden = true;
      }
    }
  };

  root.CasitaController = CasitaController;
}(typeof window !== 'undefined' ? window : this));
