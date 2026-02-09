// ==========================================
// SISTEMA DE ESTADÍSTICAS
// Tracking y análisis de actividad en la plataforma
// ==========================================

// ==========================================
// 1. TRACKING DE EVENTOS
// ==========================================

/**
 * Registra una vista de noticia
 * ⚠️ Se ejecuta cada vez que alguien lee una noticia
 */
function registrarVista(noticiaId) {
    const stats = obtenerEstadisticas();
    
    // Buscar la noticia en stats
    if (!stats.noticias[noticiaId]) {
        stats.noticias[noticiaId] = {
            vistas: 0,
            comentarios: 0,
            reportes: 0,
            compartidos: 0
        };
    }
    
    if (typeof SistemaMetricas !== 'undefined') {
        SistemaMetricas.incrementarVistas(noticiaId);
    }
    
    // Incrementar contador de vistas
    stats.noticias[noticiaId].vistas++;
    stats.globales.vistasTotal++;
    
    // Guardar
    guardarEstadisticas(stats);
}

/**
 * Registra un comentario en una noticia
 */
function registrarComentario(noticiaId, usuarioId) {
    const stats = obtenerEstadisticas();
    
    if (!stats.noticias[noticiaId]) {
        stats.noticias[noticiaId] = {
            vistas: 0,
            comentarios: 0,
            reportes: 0,
            compartidos: 0
        };
    }
    
    stats.noticias[noticiaId].comentarios++;
    stats.globales.comentariosTotal++;
    
    // Registrar actividad del usuario
    if (!stats.usuarios[usuarioId]) {
        stats.usuarios[usuarioId] = {
            comentarios: 0,
            reportes: 0
        };
    }
    stats.usuarios[usuarioId].comentarios++;
    
    guardarEstadisticas(stats);
}

/**
 * Registra un reporte de contenido
 */
function registrarReporte(noticiaId, usuarioId, motivo) {
    const stats = obtenerEstadisticas();
    
    if (!stats.noticias[noticiaId]) {
        stats.noticias[noticiaId] = {
            vistas: 0,
            comentarios: 0,
            reportes: 0,
            compartidos: 0
        };
    }
    
    stats.noticias[noticiaId].reportes++;
    stats.globales.reportesTotal++;
    
    // Guardar detalle del reporte
    if (!stats.reportes) stats.reportes = [];
    stats.reportes.push({
        id: Date.now(),
        noticiaId,
        usuarioId,
        motivo,
        fecha: new Date().toISOString(),
        resuelto: false
    });
    
    guardarEstadisticas(stats);
}

/**
 * Registra una publicación de noticia
 */
function registrarPublicacion(noticiaId, editorId) {
    const stats = obtenerEstadisticas();
    
    // Registrar en estadísticas del editor
    if (!stats.editores[editorId]) {
        stats.editores[editorId] = {
            publicaciones: 0,
            aprobadas: 0,
            rechazadas: 0,
            vistasTotal: 0
        };
    }
    
    stats.editores[editorId].publicaciones++;
    stats.globales.publicacionesTotal++;
    
    guardarEstadisticas(stats);
}

// ==========================================
// 2. GESTIÓN DE ESTADÍSTICAS
// ==========================================

/**
 * Obtiene todas las estadísticas
 * @returns {Object} Objeto con todas las stats
 */
function obtenerEstadisticas() {
    const stats = localStorage.getItem('db_estadisticas');
    
    if (stats) {
        return JSON.parse(stats);
    }
    
    // Estructura inicial de estadísticas
    return {
        globales: {
            vistasTotal: 0,
            comentariosTotal: 0,
            reportesTotal: 0,
            publicacionesTotal: 0,
            usuariosActivos: 0
        },
        noticias: {},        // {noticiaId: {vistas, comentarios, reportes}}
        editores: {},        // {editorId: {publicaciones, aprobadas, rechazadas}}
        usuarios: {},        // {usuarioId: {comentarios, reportes}}
        reportes: []         // Array de reportes pendientes
    };
}

/**
 * Guarda las estadísticas
 */
function guardarEstadisticas(stats) {
    localStorage.setItem('db_estadisticas', JSON.stringify(stats));
}

// ==========================================
// 3. ESTADÍSTICAS POR ROL
// ==========================================

/**
 * Obtiene estadísticas para un EDITOR
 * Muestra su rendimiento personal
 */
function obtenerEstadisticasEditor(editorId) {
    const stats = obtenerEstadisticas();
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    
    // Filtrar noticias del editor
    const noticiasEditor = noticias.filter(n => n.autorId === editorId);
    
    // Calcular totales
    let vistasTotal = 0;
    let comentariosTotal = 0;
    let reportesTotal = 0;
    
    noticiasEditor.forEach(n => {
        const statsNoticia = stats.noticias[n.id] || {vistas: 0, comentarios: 0, reportes: 0};
        vistasTotal += statsNoticia.vistas;
        comentariosTotal += statsNoticia.comentarios;
        reportesTotal += statsNoticia.reportes;
    });
    
    // Encontrar noticia más leída
    let maLeida = null;
    let maxVistas = 0;
    noticiasEditor.forEach(n => {
        const vistas = stats.noticias[n.id]?.vistas || 0;
        if (vistas > maxVistas) {
            maxVistas = vistas;
            maLeida = n;
        }
    });
    
    return {
        publicaciones: noticiasEditor.length,
        vistasTotal,
        comentariosTotal,
        reportesTotal,
        promedioVistas: noticiasEditor.length > 0 ? Math.round(vistasTotal / noticiasEditor.length) : 0,
        noticiaMasLeida: maLeida,
        tendencia: calcularTendencia(editorId)
    };
}

/**
 * Obtiene estadísticas para SUB-ADMIN
 * Vista general del equipo
 */
function obtenerEstadisticasSubAdmin() {
    const stats = obtenerEstadisticas();
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    
    // Ranking de editores por publicaciones
    const rankingEditores = [];
    for (let editorId in stats.editores) {
        const statsEditor = obtenerEstadisticasEditor(parseInt(editorId));
        rankingEditores.push({
            editorId,
            ...statsEditor
        });
    }
    rankingEditores.sort((a, b) => b.publicaciones - a.publicaciones);
    
    // Noticias más vistas
    const noticiasMasVistas = noticias
        .map(n => ({
            ...n,
            vistas: stats.noticias[n.id]?.vistas || 0
        }))
        .sort((a, b) => b.vistas - a.vistas)
        .slice(0, 10);
    
    // Noticias más reportadas
    const noticiasMasReportadas = noticias
        .map(n => ({
            ...n,
            reportes: stats.noticias[n.id]?.reportes || 0
        }))
        .filter(n => n.reportes > 0)
        .sort((a, b) => b.reportes - a.reportes);
    
    return {
        rankingEditores,
        noticiasMasVistas,
        noticiasMasReportadas,
        reportesPendientes: stats.reportes.filter(r => !r.resuelto).length,
        actividad: stats.globales
    };
}

/**
 * Obtiene estadísticas para ADMIN
 * Visión global completa
 */
function obtenerEstadisticasAdmin() {
    const subAdminStats = obtenerEstadisticasSubAdmin();
    const stats = obtenerEstadisticas();
    
    return {
        ...subAdminStats,
        rendimientoGlobal: {
            vistasTotal: stats.globales.vistasTotal,
            comentariosTotal: stats.globales.comentariosTotal,
            reportesTotal: stats.globales.reportesTotal,
            publicacionesTotal: stats.globales.publicacionesTotal
        },
        alertas: generarAlertas(),
        crecimiento: calcularCrecimiento()
    };
}

/**
 * Calcula la tendencia de un editor
 * @returns {string} 'sube', 'baja' o 'estable'
 */
function calcularTendencia(editorId) {
    // ⚠️ Simplificado: compara últimas 5 vs anteriores 5
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    const noticiasEditor = noticias.filter(n => n.autorId === editorId);
    
    if (noticiasEditor.length < 10) return 'estable';
    
    const ultimas5 = noticiasEditor.slice(0, 5);
    const anteriores5 = noticiasEditor.slice(5, 10);
    
    const stats = obtenerEstadisticas();
    const vistasUltimas = ultimas5.reduce((sum, n) => 
        sum + (stats.noticias[n.id]?.vistas || 0), 0);
    const vistasAnteriores = anteriores5.reduce((sum, n) => 
        sum + (stats.noticias[n.id]?.vistas || 0), 0);
    
    if (vistasUltimas > vistasAnteriores * 1.2) return 'sube';
    if (vistasUltimas < vistasAnteriores * 0.8) return 'baja';
    return 'estable';
}

/**
 * Genera alertas para administradores
 */
function generarAlertas() {
    const stats = obtenerEstadisticas();
    const alertas = [];
    
    // Alertas de reportes altos
    for (let noticiaId in stats.noticias) {
        if (stats.noticias[noticiaId].reportes > 5) {
            alertas.push({
                tipo: 'reporte',
                gravedad: 'alta',
                mensaje: `Noticia #${noticiaId} tiene ${stats.noticias[noticiaId].reportes} reportes`
            });
        }
    }
    
    // Alertas de bajo rendimiento
    for (let editorId in stats.editores) {
        const editor = stats.editores[editorId];
        if (editor.rechazadas > editor.aprobadas * 2) {
            alertas.push({
                tipo: 'rendimiento',
                gravedad: 'media',
                mensaje: `Editor #${editorId} tiene alto índice de rechazos`
            });
        }
    }
    
    return alertas;
}

/**
 * Calcula crecimiento semanal
 */
function calcularCrecimiento() {
    // ⚠️ Simplificado: retorna datos simulados
    return {
        vistas: '+15%',
        usuarios: '+8%',
        publicaciones: '+12%'
    };
}

/**
 * Registra visita a categoría
 */
function registrarVisitaCategoria(categoria) {
    const metricas = obtenerMetricas();
    
    if (!metricas.categorias[categoria]) {
        metricas.categorias[categoria] = {
            vistas: 0,
            noticias: 0,
            ultimaVisita: null
        };
    }
    
    metricas.categorias[categoria].vistas++;
    metricas.categorias[categoria].ultimaVisita = new Date().toISOString();
    
    guardarMetricas(metricas);
}

/**
 * Registra términos de búsqueda
 */
function registrarBusqueda(termino) {
    const metricas = obtenerMetricas();
    
    if (!metricas.busquedas[termino]) {
        metricas.busquedas[termino] = {
            cantidad: 0,
            ultimaBusqueda: null
        };
    }
    
    metricas.busquedas[termino].cantidad++;
    metricas.busquedas[termino].ultimaBusqueda = new Date().toISOString();
    
    guardarMetricas(metricas);
}


// Exportar funciones
window.registrarBusqueda = registrarBusqueda;
window.registrarVista = registrarVista;
window.registrarComentario = registrarComentario;
window.registrarReporte = registrarReporte;
window.registrarPublicacion = registrarPublicacion;
window.registrarVisitaCategoria = registrarVisitaCategoria;