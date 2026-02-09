/**
 * ========================================
 * MÉTRICAS AVANZADAS
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Mostrar métricas de la plataforma (tasa de rebote, retención, etc.)
 * - Control granular según permisos del usuario
 * - Renderizar en panel-dinamico
 * 
 * IMPORTANTE:
 * - USA renderizarEnPanelDinamico() para mostrar contenido
 * - NO toca directamente #main-content
 * - Verifica permisos antes de mostrar cada sección
 */

// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================

/**
 * Muestra panel de métricas avanzadas
 * Control granular según permisos del usuario
 */
function mostrarMetricasAvanzadas() {
    if (!tienePermiso('verTodasLasEstadisticas')) {
        alert('No tienes permisos para ver métricas avanzadas');
        return;
    }
    
    const usuario = obtenerUsuarioActual();
    const metricas = obtenerMetricas();
    
    let contenidoHTML = '';
    
    // ==========================================
    // MÉTRICAS BÁSICAS (SUB_ADMIN+)
    // ==========================================
    if (tienePermiso('verEstadisticasEditores')) {
        const tasaRebote = calcularTasaRebote();
        const retencion = calcularRetencion();
        
        contenidoHTML += `
            <div class="stat-card">
                <h3>📉 Tasa de Rebote</h3>
                <p class="stat-numero">${tasaRebote}%</p>
                <small>Usuarios sin interacción</small>
            </div>
            <div class="stat-card">
                <h3>🔄 Retención</h3>
                <p class="stat-numero">${retencion}%</p>
                <small>Usuarios recurrentes</small>
            </div>
        `;
    }
    
    // ==========================================
    // MÉTRICAS COMPLETAS (SOLO ADMIN)
    // ==========================================
    if (tienePermiso('verTodasLasEstadisticas')) {
        const categoriasPopulares = obtenerCategoriasPopulares();
        const busquedasPopulares = obtenerBusquedasPopulares(5);
        
        contenidoHTML += `
            <div class="stat-card">
                <h3>👥 Total Visitantes</h3>
                <p class="stat-numero">${Object.keys(metricas.visitas).length}</p>
                <small>Únicos registrados</small>
            </div>
        `;
        
        // Categorías populares
        let categoriasHTML = '';
        categoriasPopulares.slice(0, 5).forEach(cat => {
            categoriasHTML += `
                <div class="metrica-item">
                    <span>${cat.nombre}</span>
                    <strong>${cat.vistas} vistas</strong>
                </div>
            `;
        });
        
        // Búsquedas populares
        let busquedasHTML = '';
        busquedasPopulares.forEach(b => {
            busquedasHTML += `
                <div class="metrica-item">
                    <span>"${b.termino}"</span>
                    <strong>${b.cantidad} búsquedas</strong>
                </div>
            `;
        });
        
        contenidoHTML += `
            <div class="metricas-listas" style="grid-column: 1 / -1;">
                <div class="metrica-lista">
                    <h3>🏆 Categorías Populares</h3>
                    ${categoriasHTML || '<p>No hay datos</p>'}
                </div>
                
                <div class="metrica-lista">
                    <h3>🔍 Búsquedas Populares</h3>
                    ${busquedasHTML || '<p>No hay datos</p>'}
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // MÉTRICAS PROPIAS (TODOS CON PERMISO)
    // ==========================================
    if (tienePermiso('verEstadisticasPropias')) {
        const engagement = calcularEngagement(usuario.id);
        
        contenidoHTML += `
            <div class="stat-card">
                <h3>⭐ Tu Engagement</h3>
                <p class="stat-numero">${engagement}/100</p>
                <small>Tu nivel de participación</small>
            </div>
        `;
    }
    
    // ==========================================
    // RENDERIZAR TODO EN PANEL DINÁMICO
    // ==========================================
    const htmlFinal = `
        <div class="panel-metricas-avanzadas">
            <header class="panel-header">
                <h1>📈 Métricas Avanzadas</h1>
                <button onclick="volverInicio()" class="btn-volver">← Volver</button>
            </header>
            
            <div class="stats-grid">
                ${contenidoHTML || '<p>No tienes permisos para ver métricas</p>'}
            </div>
        </div>
    `;
    
    // ✅ Usar sistema de navegación
    renderizarEnPanelDinamico(htmlFinal);
}

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

window.mostrarMetricasAvanzadas = mostrarMetricasAvanzadas;

console.log('✅ Métricas avanzadas cargado');