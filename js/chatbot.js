/**
 * ============================================================================
 * SENTINEL AI - ASISTENTE VIRTUAL DE ATENCIÓN Y ORIENTACIÓN EMPRESARIAL
 * Propósito: Chatbot inteligente para atención al cliente, información sobre
 *            servicios contables, facturación DGII, cotizaciones, seguridad
 *            y aclaración sobre la infraestructura de la empresa.
 * ============================================================================
 */

// Objeto Singleton que gestiona la interfaz y lógica de respuestas de Sentinel AI
const SentinelAI = {
  // Referencias a los nodos clave del DOM
  chatHistoryEl: null,
  inputEl: null,
  modalEl: null,
  isOpen: false,

  /**
   * Inicializa las referencias del DOM y vincula los eventos de usuario.
   */
  init() {
    this.modalEl = document.getElementById('sentinelModal');
    this.chatHistoryEl = document.getElementById('sentinelChatHistory');
    this.inputEl = document.getElementById('sentinelInput');

    const floatingBtn = document.getElementById('sentinelFloatingBtn');
    const closeBtn = document.getElementById('sentinelCloseBtn');
    const chatForm = document.getElementById('sentinelForm');
    const clearBtn = document.getElementById('sentinelClearBtn');

    // Botón flotante para abrir/cerrar la ventana de chat
    if (floatingBtn) {
      floatingBtn.addEventListener('click', () => this.toggleModal());
    }

    // Botón de cerrar (cruz en la cabecera del chat)
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleModal(false));
    }

    // Envío del formulario de texto mediante Enter o botón Enviar
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    // Botón para reiniciar la conversación
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearChat());
    }

    // Botones de preguntas predefinidas (Quick Pills)
    this.attachQuickPillEvents();
  },

  /**
   * Vincula las píldoras de preguntas rápidas sugeridas al visitante.
   */
  attachQuickPillEvents() {
    document.querySelectorAll('[data-sentinel-prompt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-sentinel-prompt');
        this.openWithPrompt(prompt);
      });
    });
  },

  /**
   * Alterna la visibilidad del modal del asistente virtual.
   * @param {boolean} [forceState] - Fuerza el estado true (abierto) o false (cerrado).
   */
  toggleModal(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.modalEl) {
      if (this.isOpen) {
        this.modalEl.classList.add('active');
        if (this.inputEl) this.inputEl.focus();
        if (window.CyberAudio) CyberAudio.playBeep(650, 'sine', 0.05);
      } else {
        this.modalEl.classList.remove('active');
        if (window.CyberAudio) CyberAudio.playBeep(450, 'sine', 0.05);
      }
    }
  },

  /**
   * Abre el chat y despacha automáticamente una pregunta preseleccionada.
   * @param {string} promptText - Texto de la consulta rápida.
   */
  openWithPrompt(promptText) {
    this.toggleModal(true);
    this.sendMessage(promptText, true);
    setTimeout(() => {
      this.generateBotResponse(promptText);
    }, 450);
  },

  /**
   * Procesa la entrada escrita por el usuario desde el campo de texto.
   */
  handleUserSubmit() {
    if (!this.inputEl) return;
    const text = this.inputEl.value.trim();
    if (!text) return;

    // Limpia el campo de entrada inmediatamente
    this.inputEl.value = '';
    // Muestra el mensaje del usuario
    this.sendMessage(text, true);

    // Simula una breve latencia de razonamiento natural
    setTimeout(() => {
      this.generateBotResponse(text);
    }, 500);
  },

  /**
   * Renderiza un mensaje dentro del contenedor de conversación.
   * @param {string} text - Contenido del mensaje (permite HTML seguro).
   * @param {boolean} isUser - true si el emisor es el usuario, false si es el bot.
   */
  sendMessage(text, isUser = false) {
    if (!this.chatHistoryEl) return;

    // Contenedor del mensaje
    const msgWrapper = document.createElement('div');
    msgWrapper.className = `sentinel-message ${isUser ? 'user' : 'bot'}`;

    // Ícono del avatar
    const avatar = document.createElement('div');
    avatar.className = 'sentinel-msg-avatar';
    avatar.innerHTML = `<span class="material-symbols-outlined text-[16px]">${isUser ? 'person' : 'smart_toy'}</span>`;

    // Burbuja de texto
    const bubble = document.createElement('div');
    bubble.className = 'sentinel-msg-bubble';
    bubble.innerHTML = text;

    msgWrapper.appendChild(avatar);
    msgWrapper.appendChild(bubble);

    this.chatHistoryEl.appendChild(msgWrapper);
    // Desplazamiento automático al final de la conversación
    this.chatHistoryEl.scrollTop = this.chatHistoryEl.scrollHeight;

    // Efecto de sonido interactivo
    if (window.CyberAudio) {
      if (isUser) CyberAudio.playBeep(650, 'sine', 0.03);
      else CyberAudio.playBeep(750, 'triangle', 0.04);
    }
  },

  /**
   * Motor de respuestas contextuales de Sentinel AI.
   * Analiza palabras clave para ofrecer información precisa sobre servicios,
   * DGII, cotizaciones, seguridad, ubicación o antecedentes del sistema.
   * @param {string} query - Consulta recibida.
   */
  generateBotResponse(query) {
    const q = query.toLowerCase();
    let reply = "";

    // 1. Consultas sobre servicios y qué hace la empresa
    if (q.includes('servicio') || q.includes('ofrecen') || q.includes('hacen') || q.includes('plataforma') || q.includes('quienes') || q.includes('quiénes')) {
      reply = "Somos <strong>Ledger Digital</strong>, la plataforma tech-fin líder en República Dominicana. Ayudamos a tu PYME con: <strong>1) Facturación electrónica e-CF ante DGII</strong>, <strong>2) Contabilidad moderna en la nube</strong> (reportes 606 y 607 automatizados) y <strong>3) Respaldos automáticos continuos</strong> con soporte local en Santo Domingo.";
    }
    // 2. Facturación electrónica y DGII
    else if (q.includes('dgii') || q.includes('ncf') || q.includes('ecf') || q.includes('factura') || q.includes('facturación') || q.includes('tribut')) {
      reply = "Nuestra plataforma se comunica directamente con la <strong>DGII Dominicana</strong> en tiempo real. Emitimos e-NCF con timbrado digital inmediato, generamos tus declaraciones fiscales y cumplimos al 100% con la Ley de Facturación Electrónica.";
    }
    // 3. Precios y Cotizador
    else if (q.includes('precio') || q.includes('costo') || q.includes('cotiz') || q.includes('cuanto') || q.includes('plan')) {
      reply = "Puedes estimar tu inversión en tiempo real con nuestro <a href='servicios.html#cotizador' style='color:var(--color-primary);text-decoration:underline;font-weight:700;'>Cotizador en Línea</a>. Calcula según el tamaño de tu empresa y módulos deseados, con conversión automática en Pesos Dominicanos (RD$) o Dólares (USD).";
    }
    // 4. Seguridad, garantías y cómo evitamos incidentes
    else if (q.includes('seguridad') || q.includes('garant') || q.includes('confia') || q.includes('respaldo') || q.includes('perder') || q.includes('proteg') || q.includes('evitar')) {
      reply = "Tu tranquilidad es nuestra prioridad absoluta. Protegemos tu información con <strong>cifrado bancario AES-256</strong>, réplicas continuas <strong>Multi-AZ</strong> cada hora y una <strong>disponibilidad del 99.98%</strong> garantizada por contrato. Tus libros contables nunca se perderán.";
    }
    // 5. Mención histórica del incidente o USB de 2023
    else if (q.includes('usb') || q.includes('mensaje') || q.includes('pasó') || q.includes('paso') || q.includes('incidente') || q.includes('crisis') || q.includes('historia')) {
      reply = "En 2023 experimentamos un borrado digital que nos impulsó a reinventar toda nuestra infraestructura desde cero. Las evidencias técnicas y la bitácora del USB están recopiladas en nuestro <a href='#' data-trigger-incident-overlay style='color:var(--color-primary);text-decoration:underline;'>Aviso de Seguridad Oficial</a>. Hoy operamos sobre una arquitectura 100% blindada e invulnerable.";
    }
    // 6. Ubicación y Contacto
    else if (q.includes('donde') || q.includes('dónde') || q.includes('ubicac') || q.includes('direccion') || q.includes('dirección') || q.includes('horario') || q.includes('telefono') || q.includes('teléfono') || q.includes('contacto')) {
      reply = "Nuestras oficinas centrales están ubicadas en <strong>Av. Winston Churchill, Piantini, Santo Domingo</strong>. Atendemos de lunes a viernes de 8:00 AM a 6:00 PM. Puedes llamarnos al <strong>+1 (809) 555-0199</strong> o escribir a <a href='contacto.html' style='color:var(--color-primary);text-decoration:underline;'>contacto@ledgerdigital.do</a>.";
    }
    // 7. Respuesta por defecto
    else {
      reply = "Estoy aquí para apoyarte. Puedes consultarme sobre <strong>nuestros servicios contables</strong>, la <strong>facturación e-CF DGII</strong>, <strong>calcular tu cotización</strong> o conocer nuestras <strong>garantías de seguridad de datos</strong>.";
    }

    this.sendMessage(reply, false);

    // Re-vincula eventos por si la respuesta generó enlaces interactivos con atributos especiales
    if (window.GlitchRecovery) {
      window.GlitchRecovery.attachGlobalTriggers();
    }
  },

  /**
   * Restablece la ventana de conversación a su estado de bienvenida inicial.
   */
  clearChat() {
    if (!this.chatHistoryEl) return;
    this.chatHistoryEl.innerHTML = `
      <div class="sentinel-message bot">
        <div class="sentinel-msg-avatar">
          <span class="material-symbols-outlined text-[16px]">smart_toy</span>
        </div>
        <div class="sentinel-msg-bubble">
          ¡Conversación reiniciada! Soy <strong>Sentinel AI</strong>. ¿En qué te puedo orientar hoy sobre Ledger Digital y nuestros servicios contables?
        </div>
      </div>
    `;
    if (window.CyberAudio) CyberAudio.playBeep(500, 'sine', 0.04);
  }
};

// Inicialización automática tras cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  SentinelAI.init();
});
