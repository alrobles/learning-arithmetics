/* Sincroniza la barra superior (racha, XP, rango y botón de audio) en todas las vistas. */
(function (root) {
  'use strict';

  var SVG_VOL_ON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.8 5.8a9 9 0 0 1 0 12.4"/></svg>';
  var SVG_VOL_OFF = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';

  function refreshHud(state) {
    if (!root.Gamification) return;
    var st = state || root.Gamification.load();
    var rankInfo = root.Gamification.getRank(st.xp);

    var elStreak = document.getElementById('hudStreak');
    var elXp = document.getElementById('hudXp');
    var elRank = document.getElementById('hudRank');

    if (elStreak) elStreak.textContent = String(st.streak);
    if (elXp) elXp.textContent = st.xp + ' XP';
    if (elRank) elRank.textContent = rankInfo.current.code + ' · ' + rankInfo.current.title.split(' ')[0];

    if (root.ChronoSound) {
      root.ChronoSound.setMuted(!st.prefs.sound);
    }
    var btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.innerHTML = st.prefs.sound ? SVG_VOL_ON : SVG_VOL_OFF;
      btnAudio.setAttribute('aria-pressed', String(st.prefs.sound));
      btnAudio.setAttribute('title', st.prefs.sound ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido');
    }
  }

  function init() {
    if (!root.Gamification) return;
    refreshHud();
    var btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', function () {
        var st = root.Gamification.load();
        st.prefs.sound = !st.prefs.sound;
        root.Gamification.save(st);
        refreshHud(st);
        if (st.prefs.sound && root.ChronoSound) root.ChronoSound.tick();
      });
    }
    window.addEventListener('storage', function () { refreshHud(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  root.ChronoNav = { refreshHud: refreshHud };
}(typeof window !== 'undefined' ? window : this));
