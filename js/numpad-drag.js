/* Pad numérico interactivo con clic instantáneo Y arrastre táctil/mouse (Pointer Events).
 * Permite pulsar 0–9 o arrastrar físicamente cualquier ficha numérica hasta la casilla activa. */
(function (root) {
  'use strict';

  var DRAG_THRESHOLD = 6;
  var MAGNET_PAD = 42;

  function isInsideMagnet(x, y, targetEl) {
    if (!targetEl) return false;
    var r = targetEl.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    return (
      x >= r.left - MAGNET_PAD &&
      x <= r.right + MAGNET_PAD &&
      y >= r.top - MAGNET_PAD &&
      y <= r.bottom + MAGNET_PAD
    );
  }

  function mount(containerEl, options) {
    if (!containerEl) return;
    var getTarget = options.getTarget || function () { return null; };
    var onCommit = options.onCommit || function () {};
    var onPickup = options.onPickup || function () {};

    containerEl.innerHTML = '';

    for (var d = 0; d <= 9; d++) {
      (function (digit) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'num-chip';
        btn.textContent = String(digit);
        btn.setAttribute('data-digit', String(digit));
        btn.setAttribute('aria-label', 'Cifra ' + digit + ' (clic o arrastrar a la casilla)');
        btn.setAttribute('title', 'Clic o arrastra el ' + digit + ' a la casilla activa');

        // Accesibilidad por teclado (Enter / Espacio sobre el botón enfocado)
        btn.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            onCommit(digit);
          }
        });

        btn.addEventListener('pointerdown', function (ev) {
          if (ev.button !== 0 && ev.pointerType === 'mouse') return;
          ev.preventDefault();

          var pointerId = ev.pointerId;
          var startX = ev.clientX;
          var startY = ev.clientY;
          var dragging = false;
          var ghost = null;
          var activeTarget = null;

          try { btn.setPointerCapture(pointerId); } catch (e) {}

          function cleanup() {
            btn.classList.remove('is-dragging-source');
            if (activeTarget) {
              activeTarget.classList.remove('is-drop-ready');
              activeTarget = null;
            }
            if (ghost && ghost.parentNode) {
              ghost.parentNode.removeChild(ghost);
              ghost = null;
            }
            document.body.classList.remove('is-dragging-digit');
            btn.removeEventListener('pointermove', onMove);
            btn.removeEventListener('pointerup', onUp);
            btn.removeEventListener('pointercancel', onCancel);
          }

          function positionGhost(cx, cy, lockedTarget) {
            if (!ghost) return;
            if (lockedTarget) {
              var tr = lockedTarget.getBoundingClientRect();
              var tx = tr.left + tr.width / 2;
              var ty = tr.top + tr.height / 2;
              ghost.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0) translate(-50%, -50%) scale(1.06)';
              ghost.classList.add('is-locked');
            } else {
              ghost.style.transform = 'translate3d(' + cx + 'px, ' + cy + 'px, 0) translate(-50%, -50%) scale(1.08)';
              ghost.classList.remove('is-locked');
            }
          }

          function onMove(mv) {
            if (mv.pointerId !== pointerId) return;
            var dx = mv.clientX - startX;
            var dy = mv.clientY - startY;

            if (!dragging && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
              dragging = true;
              btn.classList.add('is-dragging-source');
              document.body.classList.add('is-dragging-digit');
              ghost = document.createElement('div');
              ghost.className = 'drag-ghost';
              ghost.textContent = String(digit);
              ghost.setAttribute('aria-hidden', 'true');
              document.body.appendChild(ghost);
              onPickup(digit);
            }

            if (dragging) {
              var target = getTarget();
              var over = isInsideMagnet(mv.clientX, mv.clientY, target);
              if (activeTarget && (!over || activeTarget !== target)) {
                activeTarget.classList.remove('is-drop-ready');
                activeTarget = null;
              }
              if (over && target) {
                activeTarget = target;
                activeTarget.classList.add('is-drop-ready');
              }
              positionGhost(mv.clientX, mv.clientY, over ? target : null);
            }
          }

          function onUp(up) {
            if (up.pointerId !== pointerId) return;
            var wasDragging = dragging;
            var target = getTarget();
            var droppedOnTarget = wasDragging && isInsideMagnet(up.clientX, up.clientY, target);
            cleanup();

            if (!wasDragging) {
              // Clic normal instantáneo
              onCommit(digit);
            } else if (droppedOnTarget) {
              // Arrastre soltado sobre la casilla activa
              onCommit(digit);
            }
          }

          function onCancel(cn) {
            if (cn.pointerId !== pointerId) return;
            cleanup();
          }

          btn.addEventListener('pointermove', onMove);
          btn.addEventListener('pointerup', onUp);
          btn.addEventListener('pointercancel', onCancel);
        });

        containerEl.appendChild(btn);
      }(d));
    }
  }

  root.ChronoNumpad = {
    mount: mount
  };
}(typeof window !== 'undefined' ? window : this));
