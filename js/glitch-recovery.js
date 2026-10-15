/**
 * ============================================================================
 * GLITCH RECOVERY SYSTEM - CONTROLADOR DE LA PANTALLA DE ALERTA INICIAL
 * ============================================================================
 */

// Objeto global que encapsula toda la lógica de recuperación del sistema
const GlitchRecovery = {
  // Identificador en el DOM del overlay de pantalla completa
  overlayId: 'crashScreenOverlay',

  // Clave utilizada en sessionStorage para recordar si el usuario ya restauró la web en la sesión actual
  recoveredKey: 'ledger_sys_recovered_v2',

  /**
   * Método de inicialización: Se ejecuta cuando el DOM está completamente cargado.
   * Revisa si el usuario ya vio y superó el aviso durante su sesión de navegación.
   */
  init() {
    // Lectura del valor booleano almacenado en la memoria de la sesión
    const isRecovered = sessionStorage.getItem(this.recoveredKey);
    const overlay = document.getElementById(this.overlayId);

    // Si ya fue recuperado en esta misma sesión y no se fuerza una apertura manual:
    if (isRecovered === 'true' && overlay) {
      overlay.classList.add('recovered');
      // Ocultamos el elemento del árbol visual tras completar la animación
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 600);
      this.attachGlobalTriggers();
      return;
    }

    // Si el usuario entra por primera vez, el overlay permanece activo
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.remove('recovered');
      this.attachEvents(overlay);
    }

    this.attachGlobalTriggers();
  },

  /**
   * Vincula los botones de acción dentro del overlay de advertencia:
   * - Botón de Restauración con simulación de progreso
   * - Botón de Acceso Inmediato (Skip) para evaluación rápida
   */
  attachEvents(overlay) {
    const btnRecover = document.getElementById('btnStartRecovery');
    const btnSkip = document.getElementById('btnSkipRecovery');
    const progressBox = document.getElementById('recoveryProgressBox');
    const progressBar = document.getElementById('recoveryProgressBar');
    const progressStatus = document.getElementById('recoveryStatusText');
    const actionsRow = document.querySelector('.crash-actions-row');

    // 1. Manejo del botón de restauración con simulación paso a paso
    if (btnRecover) {
      btnRecover.addEventListener('click', () => {
        // Reproduce un sonido de advertencia inicial si el motor de audio está disponible
        if (window.CyberAudio) {
          CyberAudio.playGlitch();
        }

        // Oculta la fila de botones e inicia la visualización de la barra de progreso
        if (actionsRow) actionsRow.style.display = 'none';
        if (progressBox) progressBox.style.display = 'flex';

        // Definición de las etapas técnicas de restauración que explican la reinvención
        const steps = [
          { pct: 15, text: "Aislando sockets TCP e inspeccionando partición del USB #LD-889..." },
          { pct: 35, text: "Verificando hashes criptográficos SHA-256 de los respaldos inmutables..." },
          { pct: 60, text: "Desplegando arquitectura cloud multi-zona con cifrado bancario AES-256..." },
          { pct: 85, text: "Sincronizando protocolos de facturación electrónica e-CF con la DGII..." },
          { pct: 100, text: "¡SISTEMA REINVENTADO CON ÉXITO! ACCEDIENDO A LEDGER DIGITAL..." }
        ];

        let currentStep = 0;
        // Intervalo de tiempo para avanzar cada paso de la barra de progreso
        const interval = setInterval(() => {
          if (currentStep < steps.length) {
            const s = steps[currentStep];
            if (progressBar) progressBar.style.width = `${s.pct}%`;
            if (progressStatus) progressStatus.textContent = s.text;
            // Beep auditivo interactivo con frecuencia ascendente
            if (window.CyberAudio) {
              CyberAudio.playBeep(420 + (s.pct * 4), 'sine', 0.05, 0.03);
            }
            currentStep++;
          } else {
            // Detiene el temporizador al alcanzar el 100%
            clearInterval(interval);
            if (window.CyberAudio) CyberAudio.playSuccess();

            // Espera medio segundo y desvanece suavemente la pantalla de contingencia
            setTimeout(() => {
              overlay.classList.add('recovered');
              sessionStorage.setItem(this.recoveredKey, 'true');
              setTimeout(() => {
                overlay.style.display = 'none';
              }, 800);
            }, 600);
          }
        }, 420);
      });
    }

    // 2. Manejo del botón de omitir / entrar directamente
    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        if (window.CyberAudio) CyberAudio.playBeep(600, 'sine', 0.04);
        overlay.classList.add('recovered');
        sessionStorage.setItem(this.recoveredKey, 'true');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 600);
      });
    }
  },

  /**
   * Vincula cualquier enlace o botón de la web que tenga el atributo
   * [data-trigger-incident-overlay] para permitir al usuario
   * volver a ver el aviso de la crisis y las evidencias cuando lo deseen.
   */
  attachGlobalTriggers() {
    document.querySelectorAll('[data-trigger-incident-overlay]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.showOverlay();
      });
    });
  },

  /**
   * Muestra nuevamente el overlay en pantalla completa sin reiniciar la página.
   */
  showOverlay() {
    const overlay = document.getElementById(this.overlayId);
    const actionsRow = document.querySelector('.crash-actions-row');
    const progressBox = document.getElementById('recoveryProgressBox');
    const progressBar = document.getElementById('recoveryProgressBar');

    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.remove('recovered');
      if (actionsRow) actionsRow.style.display = 'flex';
      if (progressBox) progressBox.style.display = 'none';
      if (progressBar) progressBar.style.width = '0%';
      this.attachEvents(overlay);
    }
  },

  /**
   * Reinicia por completo la simulación y recarga la página
   */
  retriggerCrash() {
    sessionStorage.removeItem(this.recoveredKey);
    window.location.reload();
  }
};

// Se ejecuta el punto de entrada una vez que el documento HTML esté completamente interpretado
document.addEventListener('DOMContentLoaded', () => {
  GlitchRecovery.init();
});
