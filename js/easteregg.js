/**
 * ============================================================================
 * EASTER EGG FORENSE - ACCESO HACKER CLASIFICADO (js/easteregg.js)
 * Propósito: Secreto oculto pedagógico que desclasifica los registros
 *            técnicos del incidente, el evaluador del proyecto y genera
 *            una animación de lluvia de caracteres Matrix mediante Canvas HTML5.
 * 
 * Métodos de Activación:
 *   Código Konami en el teclado: ↑ ↑ ↓ ↓ ← → ← → B A
 * ============================================================================
 */

// Objeto Singleton que gestiona el Easter Egg forense
const EasterEgg = {
  modalEl: null,         // Contenedor principal del modal en el DOM
  canvasEl: null,        // Elemento <canvas> para la animación Matrix
  canvasCtx: null,       // Contexto 2D de renderizado en el Canvas
  matrixInterval: null,  // Temporizador para el ciclo de renderizado de la lluvia
  badgeClicks: 0,        // Contador de clics rápidos
  badgeTimer: null,      // Temporizador para reiniciar contador de clics
  // Secuencia oficial del Código Konami
  konamiSequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  konamiIndex: 0,        // Índice de avance en la secuencia ingresada por el usuario

  /**
   * Método de arranque: Construye el DOM del modal y suscribe los detectores de eventos.
   */
  init() {
    this.createModalDOM();
    this.attachTriggers();
  },

  /**
   * Inyecta dinámicamente el modal y el Canvas de Matrix al final del <body>.
   */
  createModalDOM() {
    const modal = document.createElement('div');
    modal.id = 'easterEggModal';
    modal.className = 'easter-egg-modal';
    modal.innerHTML = `
      <div class="easter-egg-box">
        <!-- Lienzo HTML5 para la lluvia digital de código Matrix -->
        <canvas id="matrixCanvas" class="matrix-canvas"></canvas>
        
        <!-- Contenido textual superpuesto sobre la animación -->
        <div style="position:relative; z-index:10; padding:2rem; display:flex; flex-direction:column; gap:1.25rem;">
          
          <!-- Encabezado de la Consola Oculta -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,255,102,0.3); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; color:#00ff66;">
              <span class="material-symbols-outlined text-[24px]">terminal</span>
              <span style="font-weight:700; letter-spacing:0.1em; font-size:0.9rem;">DESCLASIFICACIÓN FORENSE // ACCESO RAÍZ ROOT</span>
            </div>
            <button id="closeEasterEggBtn" style="background:transparent; border:1px solid #00ff66; color:#00ff66; padding:4px 10px; border-radius:4px; cursor:pointer; font-family:var(--font-mono); font-size:0.8rem;">[ESC / SALIR]</button>
          </div>

          <!-- Caja del Mensaje Histórico del USB -->
          <div style="background:rgba(0,0,0,0.82); border:1px solid rgba(0,255,102,0.25); border-radius:6px; padding:1.25rem; font-size:0.85rem; line-height:1.7; color:#d0ffcc;">
            <div style="color:#00ff66; font-weight:bold; margin-bottom:0.5rem;">[ MENSAJE DEL USB ORIGINAL RECUPERADO ]</div>
            <blockquote style="font-style:italic; border-left:3px solid #00ff66; padding-left:1rem; margin-bottom:1rem; color:#fff;">
              "Tu negocio ha sido borrado de la existencia digital. Si quieres recuperarlo, deberás reinventarlo. Usa la tecnología, la creatividad y tu ingenio para traerlo de vuelta."
            </blockquote>

            <!-- Datos Académicos y de Auditoría del Proyecto -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1rem; padding-top:1rem; border-top:1px dashed rgba(0,255,102,0.2);">
              <div>
                <span style="color:#70be6b; font-size:0.75rem; text-transform:uppercase; display:block;">Evaluador Académico:</span>
                <strong style="color:#00ff66; font-size:1rem;">@edianfranklin (GitHub)</strong>
              </div>
              <div>
                <span style="color:#70be6b; font-size:0.75rem; text-transform:uppercase; display:block;">Empresa Dominicana:</span>
                <strong style="color:#fff;">Ledger Digital Dominicana S.R.L.</strong>
              </div>
              <div>
                <span style="color:#70be6b; font-size:0.75rem; text-transform:uppercase; display:block;">Estatus del Desafío:</span>
                <strong style="color:#39ff14;">SUPERADO (RECONSTRUCCIÓN 100%)</strong>
              </div>
            </div>
          </div>

          <!-- Pie del Modal con Hash SHA-256 -->
          <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:0.75rem; font-size:0.8rem; color:#70be6b;">
            <span>SHA-256 MASTER: <code style="color:#00ff66;">e3b0c44298fc1c14...852b855</code></span>
            <button id="copyMasterHashBtn" style="background:rgba(0,255,102,0.15); border:1px solid #00ff66; color:#00ff66; padding:6px 14px; border-radius:6px; cursor:pointer; font-family:var(--font-mono); font-weight:bold;">Copiar Hash de Auditoría</button>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.canvasEl = document.getElementById('matrixCanvas');
    if (this.canvasEl) this.canvasCtx = this.canvasEl.getContext('2d');

    // Botón de cierre
    document.getElementById('closeEasterEggBtn').addEventListener('click', () => this.close());

    // Botón para copiar el hash de verificación al portapapeles
    document.getElementById('copyMasterHashBtn').addEventListener('click', () => {
      navigator.clipboard.writeText('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      alert('Hash maestro copiado al portapapeles para inspección académica.');
    });

    // Cierre al hacer clic en el fondo oscuro exterior
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });
  },

  /**
   * Vincula las secuencias de teclado y detectores interactivos.
   */
  attachTriggers() {
    //  Cierre mediante la tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && this.modalEl.classList.contains('active')) {
        this.close();
      }
    });

    //  Detección paso a paso de la secuencia del Código Konami
    window.addEventListener('keydown', (e) => {
      const expectedKey = this.konamiSequence[this.konamiIndex];
      if (e.key.toLowerCase() === expectedKey.toLowerCase()) {
        this.konamiIndex++;
        // Si completó la secuencia completa:
        if (this.konamiIndex === this.konamiSequence.length) {
          this.konamiIndex = 0;
          this.open();
        }
      } else {
        // Reinicia el índice si se presiona una tecla equivocada
        this.konamiIndex = 0;
      }
    });

    //  Activación mediante botones interactivos con data-trigger-easteregg
    document.querySelectorAll('[data-trigger-easteregg]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });
  },

  /**
   * Despliega el modal en pantalla completa y arranca la lluvia Matrix.
   */
  open() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('active');
    if (window.CyberAudio) CyberAudio.playGlitch();
    this.startMatrixRain();
  },

  /**
   * Cierra el modal y detiene el ciclo de refresco del canvas para ahorrar memoria.
   */
  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('active');
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }
    if (window.CyberAudio) CyberAudio.playBeep(450, 'sine', 0.05);
  },

  /**
   * Algoritmo Canvas 2D: Genera el efecto visual de lluvia de caracteres verdes estilo Matrix.
   */
  startMatrixRain() {
    if (!this.canvasEl || !this.canvasCtx) return;
    const canvas = this.canvasEl;
    const ctx = this.canvasCtx;

    // Ajusta la resolución del lienzo al tamaño de su contenedor padre
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Conjunto de caracteres numéricos, alfanuméricos y símbolos
    const characters = '0123456789ABCDEFΣΩΨLEDGERDIGITALRD';
    const fontSize = 14;
    // Calcula cuántas columnas caben en el ancho de la pantalla
    const columns = Math.floor(canvas.width / fontSize);
    // Vector de coordenadas Y para cada columna
    const drops = Array(columns).fill(1);

    if (this.matrixInterval) clearInterval(this.matrixInterval);

    // Bucle de renderizado cada 45 milisegundos
    this.matrixInterval = setInterval(() => {
      // Dibuja un rectángulo negro translúcido para dejar una estela gradual (trail effect)
      ctx.fillStyle = 'rgba(2, 11, 5, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Color verde neón clásico para los glifos
      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Selecciona un carácter al azar
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Si la gota superó la altura del lienzo, reinicia aleatoriamente
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 45);
  }
};

// Registro del evento al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  EasterEgg.init();
});