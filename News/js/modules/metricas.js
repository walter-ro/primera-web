// ==========================================
// 1. TIEMPO DE LECTURA
// Mide cuánto tiempo pasa un usuario leyendo
// ==========================================

/**
 * Registra el tiempo que un usuario pasa en una noticia
 */
let tiempoInicio = null;
let noticiaActual = null;

function iniciarMedicionTiempo(noticiaId) {
    tiempoInicio = Date.now();
    noticiaActual = noticiaId;
}

function finalizarMedicionTiempo() {
    if (!tiempoInicio || !noticiaActual) return;
    
    const tiempoLectura = Math.round((Date.now() - tiempoInicio) / 1000); // segundos
    
    // Guardar métrica
    const metricas = obtenerMetricas();
    
    if (!metricas.tiempoLectura[noticiaActual]) {
        metricas.tiempoLectura[noticiaActual] = {
            total: 0,
            promedio: 0,
            lecturas: 0
        };
    }
    
    metricas.tiempoLectura[noticiaActual].total += tiempoLectura;
    metricas.tiempoLectura[noticiaActual].lecturas++;
    metricas.tiempoLectura[noticiaActual].promedio = Math.round(
        metricas.tiempoLectura[noticiaActual].total / 
        metricas.tiempoLectura[noticiaActual].lecturas
    );
    
    guardarMetricas(metricas);
    
    tiempoInicio = null;
    noticiaActual = null;
}

// ==========================================
// 2. TASA DE REBOTE
// Usuarios que entran y salen sin interactuar
// ==========================================

/**
 * Registra si el usuario interactuó con la página
 */
function registrarInteraccion(tipo) {
    const metricas = obtenerMetricas();
    const usuario = obtenerUsuarioActual();
    
    if (!metricas.interacciones[usuario.id]) {
        metricas.interacciones[usuario.id] = {
            clicks: 0,
            scrolls: 0,
            comentarios: 0,
            compartidos: 0
        };
    }
    
    metricas.interacciones[usuario.id][tipo]++;
    guardarMetricas(metricas);
}

/**
 * Calcula la tasa de rebote
 * @returns {number} Porcentaje de usuarios sin interacción
 */
function calcularTasaRebote() {
    const metricas = obtenerMetricas();
    const totalUsuarios = Object.keys(metricas.interacciones).length;
    
    if (totalUsuarios === 0) return 0;
    
    const usuariosSinInteraccion = Object.values(metricas.interacciones)
        .filter(i => i.clicks === 0 && i.scrolls === 0 && i.comentarios === 0)
        .length;
    
    return Math.round((usuariosSinInteraccion / totalUsuarios) * 100);
}

// ==========================================
// 3. PALABRAS CLAVE MÁS BUSCADAS
// Tracking de términos de búsqueda
// ==========================================


/**
 * Obtiene las búsquedas más populares
 */
function obtenerBusquedasPopulares(limite = 10) {
    const metricas = obtenerMetricas();
    
    return Object.entries(metricas.busquedas)
        .sort((a, b) => b[1].cantidad - a[1].cantidad)
        .slice(0, limite)
        .map(([termino, datos]) => ({
            termino,
            cantidad: datos.cantidad
        }));
}

// ==========================================
// 4. RETENCIÓN DE USUARIOS
// Usuarios que regresan vs nuevos
// ==========================================

/**
 * Registra visita de usuario
 */
function registrarVisita() {
    const usuario = obtenerUsuarioActual();
    const metricas = obtenerMetricas();
    
    if (!metricas.visitas[usuario.id]) {
        metricas.visitas[usuario.id] = {
            primeraVisita: new Date().toISOString(),
            ultimaVisita: new Date().toISOString(),
            totalVisitas: 1,
            diasActivos: 1
        };
    } else {
        const ultimaVisita = new Date(metricas.visitas[usuario.id].ultimaVisita);
        const ahora = new Date();
        const diasDiferencia = Math.floor((ahora - ultimaVisita) / (1000 * 60 * 60 * 24));
        
        metricas.visitas[usuario.id].totalVisitas++;
        metricas.visitas[usuario.id].ultimaVisita = ahora.toISOString();
        
        if (diasDiferencia >= 1) {
            metricas.visitas[usuario.id].diasActivos++;
        }
    }
    
    guardarMetricas(metricas);
}

/**
 * Calcula tasa de retención
 */
function calcularRetencion() {
    const metricas = obtenerMetricas();
    const totalUsuarios = Object.keys(metricas.visitas).length;
    
    if (totalUsuarios === 0) return 0;
    
    const usuariosRecurrentes = Object.values(metricas.visitas)
        .filter(v => v.totalVisitas > 1)
        .length;
    
    return Math.round((usuariosRecurrentes / totalUsuarios) * 100);
}

// ==========================================
// 5. ENGAGEMENT SCORE
// Puntuación de compromiso del usuario
// ==========================================

/**
 * Calcula el engagement de un usuario
 * Basado en: visitas, comentarios, tiempo de lectura, compartidos
 */
function calcularEngagement(usuarioId) {
    const metricas = obtenerMetricas();
    let score = 0;
    
    // Visitas (max 30 puntos)
    const visitas = metricas.visitas[usuarioId]?.totalVisitas || 0;
    score += Math.min(visitas * 2, 30);
    
    // Comentarios (max 25 puntos)
    const comentarios = metricas.interacciones[usuarioId]?.comentarios || 0;
    score += Math.min(comentarios * 5, 25);
    
    // Interacciones (max 20 puntos)
    const clicks = metricas.interacciones[usuarioId]?.clicks || 0;
    score += Math.min(clicks, 20);
    
    // Compartidos (max 25 puntos)
    const compartidos = metricas.interacciones[usuarioId]?.compartidos || 0;
    score += Math.min(compartidos * 10, 25);
    
    return Math.min(score, 100); // Max 100
}

// ==========================================
// 6. CATEGORÍAS MÁS POPULARES
// ==========================================


/**
 * Obtiene categorías más populares
 */
function obtenerCategoriasPopulares() {
    const metricas = obtenerMetricas();
    
    return Object.entries(metricas.categorias)
        .sort((a, b) => b[1].vistas - a[1].vistas)
        .map(([nombre, datos]) => ({
            nombre,
            vistas: datos.vistas
        }));
}

// ==========================================
// 7. GESTIÓN DE MÉTRICAS
// ==========================================

/**
 * Obtiene todas las métricas
 */
function obtenerMetricas() {
    const metricas = localStorage.getItem('db_metricas');
    
    if (metricas) {
        return JSON.parse(metricas);
    }
    
    return {
        tiempoLectura: {},      // {noticiaId: {total, promedio, lecturas}}
        interacciones: {},      // {usuarioId: {clicks, scrolls, comentarios}}
        busquedas: {},          // {termino: {cantidad, ultimaBusqueda}}
        visitas: {},            // {usuarioId: {primeraVisita, ultimaVisita, totalVisitas}}
        categorias: {},         // {categoria: {vistas, noticias}}
        compartidos: {},        // {noticiaId: cantidad}
        dispositivosUsados: {}  // {tipo: cantidad}
    };
}

/**
 * Guarda métricas
 */
function guardarMetricas(metricas) {
    localStorage.setItem('db_metricas', JSON.stringify(metricas));
}

// Exportar funciones
window.iniciarMedicionTiempo = iniciarMedicionTiempo;
window.finalizarMedicionTiempo = finalizarMedicionTiempo;
window.registrarInteraccion = registrarInteraccion;
window.calcularEngagement = calcularEngagement;