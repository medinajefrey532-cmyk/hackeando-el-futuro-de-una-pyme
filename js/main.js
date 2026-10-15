/**
 * ============================================================================
 * MOTOR PRINCIPAL DEL CLIENTE - LEDGER DIGITAL DOMINICANA (js/main.js)
 * Propósito: Gestiona los subsistemas globales de la interfaz web:
 *   1. Motor de audio interactivo sintetizado (Web Audio API).
 *   2. Controlador de temas visuales (Ciberpunk Oscuro, Ejecutivo Claro, Matrix).
 *   3. Menú de navegación móvil responsivo.
 * ============================================================================
 */

/**
 * ----------------------------------------------------------------------------
 * 1. SUBSISTEMA DE AUDIO CIBERNÉTICO (CyberAudio)
 * Genera efectos sonoros sintéticos en tiempo real sin requerir archivos MP3/WAV,
 * utilizando osciladores y nodos de ganancia nativos del navegador.
 * ----------------------------------------------------------------------------
 */
const CyberAudio = {
  ctx: null,      // Contexto de audio Web Audio API
  enabled: true,  // Bandera de activación global de efectos de sonido

  /**
   * Inicializa el contexto de audio con compatibilidad para navegadores modernos
   * y navegadores basados en WebKit antiguo.
   */
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },

  /**
   * Emite un beep o tono sintetizado configurable.
   * @param {number} freq - Frecuencia en Hertz (Hz) de la nota.
   * @param {OscillatorType} type - Tipo de onda ('sine', 'square', 'sawtooth', 'triangle').
   * @param {number} duration - Duración del tono en segundos.
   * @param {number} gainVal - Nivel de volumen inicial suave para no saturar al usuario.
   */
  playBeep(freq = 600, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      // Reactiva el contexto si el navegador lo suspendió por directiva de autoplay
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Crea el nodo oscilador y el nodo de ganancia (volumen)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Aplica una curva exponencial decreciente para evitar chasquidos en el corte de audio
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      // Conecta la cadena: Oscilador -> Ganancia -> Altavoces del sistema
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Manejo silencioso en caso de bloqueo de políticas del navegador
    }
  },

  /**
   * Tono armónico ascendente de confirmación / éxito.
   */
  playSuccess() {
    this.playBeep(520, 'triangle', 0.08, 0.05);
    setTimeout(() => this.playBeep(880, 'triangle', 0.12, 0.05), 80);
  },

  /**
   * Tono de interferencia / glitch para eventos de advertencia o contingencia.
   */
  playGlitch() {
    this.playBeep(220, 'sawtooth', 0.12, 0.08);
    setTimeout(() => this.playBeep(140, 'square', 0.15, 0.06), 50);
  }
};

/**
 * ----------------------------------------------------------------------------
 * 2. CONTROLADOR DE TEMAS VISUALES (ThemeController)
 * Permite conmutar fluidamente entre tres estéticas:
 *   - 'dark': Ciberpunk Oscuro (por defecto, alto contraste y neón cian/esmeralda).
 *   - 'theme-light': Modo Ejecutivo Profesional (fondos blancos y grises suaves).
 *   - 'theme-matrix': Modo Consola / Hacker (monocromático verde terminal).
 * Persiste la elección del usuario en localStorage para futuras visitas.
 * ----------------------------------------------------------------------------
 */
const ThemeController = {
  themes: ['dark', 'theme-light', 'theme-matrix'],
  current: 'dark',

  /**
   * Inicializa el tema leyendo el valor guardado en el almacenamiento local.
   */
  init() {
    const saved = localStorage.getItem('ledger_theme') || 'dark';
    this.setTheme(saved);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        CyberAudio.playBeep(750, 'sine', 0.06);
        this.cycleTheme();
      });
    }
  },

  /**
   * Aplica la clase correspondiente al body y guarda en memoria.
   * @param {string} themeName - Nombre del tema a establecer.
   */
  setTheme(themeName) {
    document.body.classList.remove('theme-light', 'theme-matrix');
    if (themeName !== 'dark') {
      document.body.classList.add(themeName);
    }
    this.current = themeName;
    localStorage.setItem('ledger_theme', themeName);
    this.updateThemeIcon();
  },

  /**
   * Cicla en orden secuencial: Oscuro -> Claro -> Matrix -> Oscuro.
   */
  cycleTheme() {
    if (this.current === 'dark') {
      this.setTheme('theme-light');
    } else if (this.current === 'theme-light') {
      this.setTheme('theme-matrix');
    } else {
      this.setTheme('dark');
    }
  },

  /**
   * Actualiza el glifo y el tooltip descriptivo del botón de cambio de tema.
   */
  updateThemeIcon() {
    const icon = document.getElementById('themeToggleIcon');
    if (!icon) return;

    if (this.current === 'theme-light') {
      icon.textContent = 'light_mode';
      icon.title = 'Modo Ejecutivo (Luz) - Clic para Modo Matrix';
    } else if (this.current === 'theme-matrix') {
      icon.textContent = 'terminal';
      icon.title = 'Modo Matrix Terminal - Clic para Modo Ciber Oscuro';
    } else {
      icon.textContent = 'dark_mode';
      icon.title = 'Modo Ciber Oscuro - Clic para Modo Ejecutivo';
    }
  }
};

/**
 * ----------------------------------------------------------------------------
 * 3. MENÚ DE NAVEGACIÓN MÓVIL (MobileNav)
 * Controla la apertura y cierre del menú deslizable en pantallas estrechas.
 * ----------------------------------------------------------------------------
 */
const MobileNav = {
  init() {
    const toggleBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (toggleBtn && navLinks) {
      toggleBtn.addEventListener('click', () => {
        CyberAudio.playBeep(450, 'sine', 0.05);
        navLinks.classList.toggle('mobile-open');
      });
    }
  }
};

/**
 * ----------------------------------------------------------------------------
 * 4. DISPARADOR DE INICIALIZACIÓN GLOBAL TRAS CARGA DEL DOM
 * ----------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
  ThemeController.init();
  MobileNav.init();

  // Vinculación de micro-sonidos auditivos en botones clave
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', () => CyberAudio.playBeep(800, 'sine', 0.03, 0.02));
    btn.addEventListener('click', () => CyberAudio.playBeep(650, 'triangle', 0.06, 0.04));
  });
});
