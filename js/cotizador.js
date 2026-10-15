/**
 * ============================================================================
 * COTIZADOR EN LÍNEA INTERACTIVO CON API DE DIVISAS (js/cotizador.js)
 * Propósito: Proporciona a las PYMES un simulador de presupuesto interactivo
 *            en tiempo real. Permite seleccionar el tamaño de la empresa,
 *            los módulos requeridos, el ciclo de facturación y la moneda
 *            (DOP / USD), consumiendo una API pública de tasas de cambio
 *            y aplicando el 18% de ITBIS oficial de República Dominicana.
 * ============================================================================
 */

// Objeto Singleton que gestiona el cálculo y la interfaz del cotizador
const QuoteCalculator = {
  currency: 'DOP',         // Moneda activa: 'DOP' (Pesos Dominicanos) o 'USD' (Dólares)
  exchangeRate: 59.50,     // Tasa de cambio de respaldo (Fallback oficial BC-RD)
  billingCycle: 'monthly', // Ciclo de facturación: 'monthly' (mensual) o 'annual' (anual con 15% desc.)

  // Estructura de precios base en Pesos Dominicanos (RD$)
  pricing: {
    // Multiplicadores según la escala o volumen de colaboradores de la empresa
    scaleMultiplier: {
      micro: 1.0,    // 1 a 10 colaboradores (Factor base)
      small: 1.5,    // 11 a 50 colaboradores (+50% por volumen de concurrencia)
      medium: 2.2    // 51 a 150 colaboradores (+120% por capacidad ampliada)
    },
    // Costo base mensual por cada módulo independiente
    modules: {
      cloudZeroTrust: 4500, // Contabilidad en la nube, catálogo NIIF y balances
      ecfDgii: 3200,        // Facturación electrónica e-CF homologada DGII
      multiAzBackup: 2500,  // Copias de seguridad automáticas en la nube Multi-AZ
      incident247: 3900     // Soporte telefónico prioritario 24/7 en RD
    }
  },

  /**
   * Método de arranque: Vincula eventos, consulta la API de tasas y ejecuta
   * el primer cálculo de la interfaz.
   */
  async init() {
    this.attachDomEvents();
    await this.fetchLiveExchangeRate();
    this.calculate();
  },

  /**
   * Conexión asíncrona a la API pública de tipo de cambio (open.er-api.com).
   * Obtiene la tasa de conversión actualizada USD -> DOP en tiempo real.
   */
  async fetchLiveExchangeRate() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        // Si la respuesta contiene la cotización del Peso Dominicano (DOP):
        if (data && data.rates && data.rates.DOP) {
          this.exchangeRate = parseFloat(data.rates.DOP.toFixed(2));
          const rateBadge = document.getElementById('apiExchangeRateBadge');
          if (rateBadge) {
            rateBadge.textContent = `Tasa API USD/DOP en Vivo: 1 USD = RD$ ${this.exchangeRate}`;
          }
        }
      }
    } catch (e) {
      // Si el navegador está offline o la API externa no responde, usa la tasa de respaldo
      const rateBadge = document.getElementById('apiExchangeRateBadge');
      if (rateBadge) {
        rateBadge.textContent = `Tasa Referencia BC-RD: 1 USD = RD$ ${this.exchangeRate}`;
      }
    }
  },

  /**
   * Vincula los controladores de eventos en todos los selectores, botones y casillas.
   */
  attachDomEvents() {
    // 1. Selector de tamaño de la empresa
    const scaleSelect = document.getElementById('calcCompanyScale');
    if (scaleSelect) {
      scaleSelect.addEventListener('change', () => this.calculate());
    }

    // 2. Casillas de verificación (Checkboxes) de módulos
    document.querySelectorAll('.calc-module-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const card = e.target.closest('.calc-service-item');
        if (card) {
          if (e.target.checked) card.classList.add('active');
          else card.classList.remove('active');
        }
        if (window.CyberAudio) CyberAudio.playBeep(700, 'sine', 0.04);
        this.calculate();
      });
    });

    // 3. Botones de conmutación de moneda (DOP vs USD)
    document.querySelectorAll('.calc-currency-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.calc-currency-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currency = btn.getAttribute('data-curr');
        if (window.CyberAudio) CyberAudio.playBeep(800, 'triangle', 0.05);
        this.calculate();
      });
    });

    // 4. Radio buttons para el ciclo de facturación (Mensual vs Anual con descuento)
    const cycleMonthly = document.getElementById('billingCycleMonthly');
    const cycleAnnual = document.getElementById('billingCycleAnnual');
    if (cycleMonthly && cycleAnnual) {
      cycleMonthly.addEventListener('change', () => {
        this.billingCycle = 'monthly';
        this.calculate();
      });
      cycleAnnual.addEventListener('change', () => {
        this.billingCycle = 'annual';
        this.calculate();
      });
    }
  },

  /**
   * Algoritmo de cálculo dinámico: Suma los módulos activos, multiplica por
   * la escala, aplica el descuento si corresponde, suma el 18% de ITBIS
   * y formatea el resultado en la moneda seleccionada.
   */
  calculate() {
    // Lectura de la escala seleccionada
    const scaleSelect = document.getElementById('calcCompanyScale');
    const scale = scaleSelect ? scaleSelect.value : 'micro';
    const multiplier = this.pricing.scaleMultiplier[scale] || 1.0;

    let totalDOP = 0;
    let selectedCount = 0;

    // Suma de módulos marcados
    document.querySelectorAll('.calc-module-checkbox').forEach(cb => {
      if (cb.checked) {
        const key = cb.value;
        const baseCost = this.pricing.modules[key] || 0;
        totalDOP += baseCost * multiplier;
        selectedCount++;
      }
    });

    // Aplica 15% de descuento si se contrata ciclo anual
    if (this.billingCycle === 'annual') {
      totalDOP = totalDOP * 0.85;
    }

    // Cálculo del 18% de ITBIS obligatorio según marco tributario de la DGII
    const itbisDOP = totalDOP * 0.18;
    const grandTotalDOP = totalDOP + itbisDOP;

    // Conversión de moneda según la preferencia del usuario
    let displaySubtotal = totalDOP;
    let displayItbis = itbisDOP;
    let displayTotal = grandTotalDOP;
    let prefix = 'RD$ ';

    if (this.currency === 'USD') {
      displaySubtotal = totalDOP / this.exchangeRate;
      displayItbis = itbisDOP / this.exchangeRate;
      displayTotal = grandTotalDOP / this.exchangeRate;
      prefix = '$ ';
    }

    // Actualización de los elementos en el DOM con formato numérico de moneda
    const subtotalEl = document.getElementById('calcDisplaySubtotal');
    const itbisEl = document.getElementById('calcDisplayItbis');
    const totalEl = document.getElementById('calcDisplayTotal');
    const countEl = document.getElementById('calcDisplayCount');

    if (subtotalEl) subtotalEl.textContent = `${prefix}${displaySubtotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (itbisEl) itbisEl.textContent = `${prefix}${displayItbis.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalEl) totalEl.textContent = `${prefix}${displayTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (countEl) countEl.textContent = `${selectedCount} módulos activos`;
  }
};

// Se inicializa el cotizador únicamente si el contenedor existe en la página actual
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quoteCalculatorWrap')) {
    QuoteCalculator.init();
  }
});
