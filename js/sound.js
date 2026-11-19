/* Sintetizador Web Audio API sin dependencias: clics de relojería, marimba cálida y acordes de victoria. */
(function (root) {
  'use strict';

  var ctx = null;
  var muted = false;

  function ensureCtx() {
    if (muted) return null;
    if (!ctx && (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined')) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function tone(freq, duration, type, gainPeak, delay) {
    var ac = ensureCtx();
    if (!ac) return;
    var now = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak || 0.11, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function setMuted(val) {
    muted = !!val;
  }

  function isMuted() {
    return muted;
  }

  // Clic de escape mecánico al bajar cifra o navegar
  function tick() {
    tone(880, 0.045, 'triangle', 0.045, 0);
  }

  // Nota cálida de marimba al acertar un paso (sube en escala pentatónica según racha)
  function stepOk(comboIndex) {
    var pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    var f = pentatonic[(comboIndex || 0) % pentatonic.length];
    tone(f, 0.16, 'triangle', 0.11, 0);
    tone(f * 2, 0.08, 'sine', 0.03, 0.01);
  }

  // Doble timbre característico para el salto de cero al cociente
  function zeroJump() {
    tone(659.25, 0.11, 'sine', 0.09, 0);
    tone(987.77, 0.16, 'triangle', 0.09, 0.075);
  }

  // Golpe suave grave de madera al equivocarse (sin estridencia)
  function errorNudge() {
    tone(195, 0.14, 'sawtooth', 0.055, 0);
    tone(158, 0.18, 'triangle', 0.06, 0.06);
  }

  // Arpegio de reloj de precisión al completar toda la división
  function victory() {
    tone(523.25, 0.22, 'triangle', 0.10, 0.00);
    tone(659.25, 0.24, 'triangle', 0.10, 0.08);
    tone(783.99, 0.28, 'triangle', 0.11, 0.16);
    tone(1046.5, 0.42, 'sine', 0.11, 0.24);
  }

  root.ChronoSound = {
    setMuted: setMuted,
    isMuted: isMuted,
    tick: tick,
    stepOk: stepOk,
    zeroJump: zeroJump,
    errorNudge: errorNudge,
    victory: victory
  };
}(typeof window !== 'undefined' ? window : this));
