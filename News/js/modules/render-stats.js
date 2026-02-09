/**
 * ========================================
 * RENDER-STATS - PANELES DE ESTADÍSTICAS
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Renderizar paneles de estadísticas según rol
 * - Mostrar stats de EDITOR, SUB_ADMIN, ADMIN
 * - Usar el panel-dinamico para no interferir con noticias
 * 
 * IMPORTANTE:
 * - USA renderizarEnPanelDinamico() para mostrar contenido
 * - NO toca directamente #main-content
 * - Incluye botón de "Volver" en todos los paneles
 */

// ==========================================
// 1. FUNCIÓN PRINCIPAL
// ==========================================

/**
 * Muestra el panel de estadísticas según el rol del usuario
 */
function mostrarPanelEstadisticas() {
    const usuario = obtenerUsuarioActual();
    
    // Verificar permisos
    if (!tienePermiso('verEstadisticasPropias')) {
        alert('No tienes permiso para ver estadísticas');
        return;
    }
    
    let html = '';
    
    // Renderizar según permisos
    if (tienePermiso('verTodasLasEstadisticas')) {
        html = renderizarPanelAdmin();
    } else if (tienePermiso('verEstadisticasEditores')) {
        html = renderizarPanelSubAdmin();
    } else if (tienePermiso('verEstadisticasPropias')) {
        html = renderizarPanelEditor(usuario.id);
    }
    
    // ✅ Renderizar en panel-dinamico (NO en main-content)
    renderizarEnPanelDinamico(html);
}

// ==========================================
// 2. PANEL PARA EDITOR
// ==========================================

/**
 * Renderiza panel para EDITOR
 * Muestra solo sus propias estadísticas
 */
function renderizarPanelEditor(editorId) {
    const stats = obtenerEstadisticasEditor(editorId);
    
    return `
        <div class="panel-estadisticas">
            <header class="panel-header">
                <h1>📊 Mis Estadísticas</h1>
                <button onclick="volverInicio()" class="btn-volver">← Volver</button>
            </header>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📝 Publicaciones</h3>
                    <p class="stat-numero">${stats.publicaciones}</p>
                </div>
                
                <div class="stat-card">
                    <h3>👁️ Vistas Totales</h3>
                    <p class="stat-numero">${stats.vistasTotal}</p>
                </div>
                
                <div class="stat-card">
                    <h3>💬 Comentarios</h3>
                    <p class="stat-numero">${stats.comentariosTotal}</p>
                </div>
                
                <div class="stat-card">
                    <h3>⚠️ Reportes</h3>
                    <p class="stat-numero">${stats.reportesTotal}</p>
                </div>
            </div>
            
            <div class="stat-detalle">
                <h3>📈 Rendimiento</h3>
                <p><strong>Promedio de vistas:</strong> ${stats.promedioVistas} por noticia</p>
                <p><strong>Tendencia:</strong> 
                    ${stats.tendencia === 'sube' ? '📈 En ascenso' : 
                      stats.tendencia === 'baja' ? '📉 En descenso' : '➡️ Estable'}
                </p>
                ${stats.noticiaMasLeida ? `
                    <p><strong>Noticia más leída:</strong> "${stats.noticiaMasLeida.titulo}"</p>
                ` : ''}
            </div>
        </div>
    `;
}

// ==========================================
// 3. PANEL PARA SUB-ADMIN
// ==========================================

/**
 * Renderiza panel para SUB-ADMIN
 * Muestra estadísticas de su equipo de editores
 */
function renderizarPanelSubAdmin() {
    const stats = obtenerEstadisticasSubAdmin();
    
    let rankingHTML = '';
    stats.rankingEditores.slice(0, 5).forEach((editor, index) => {
        rankingHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>Editor #${editor.editorId}</td>
                <td>${editor.publicaciones}</td>
                <td>${editor.vistasTotal}</td>
            </tr>
        `;
    });
    
    return `
        <div class="panel-estadisticas">
            <header class="panel-header">
                <h1>📊 Estadísticas del Equipo</h1>
                <button onclick="volverInicio()" class="btn-volver">← Volver</button>
            </header>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📝 Total Publicaciones</h3>
                    <p class="stat-numero">${stats.actividad.publicacionesTotal}</p>
                </div>
                
                <div class="stat-card">
                    <h3>⚠️ Reportes Pendientes</h3>
                    <p class="stat-numero">${stats.reportesPendientes}</p>
                </div>
            </div>
            
            <div class="stat-tabla">
                <h3>🏆 Ranking de Editores</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Editor</th>
                            <th>Publicaciones</th>
                            <th>Vistas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankingHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==========================================
// 4. PANEL PARA ADMIN
// ==========================================

/**
 * Renderiza panel para ADMIN
 * Muestra estadísticas globales de toda la plataforma
 */
function renderizarPanelAdmin() {
    const stats = obtenerEstadisticasAdmin();
    
    let alertasHTML = '';
    stats.alertas.forEach(alerta => {
        alertasHTML += `
            <div class="alerta alerta-${alerta.gravedad}">
                ${alerta.mensaje}
            </div>
        `;
    });
    
    return `
        <div class="panel-estadisticas">
            <header class="panel-header">
                <h1>🎯 Panel de Control</h1>
                <button onclick="volverInicio()" class="btn-volver">← Volver</button>
            </header>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>👁️ Vistas Totales</h3>
                    <p class="stat-numero">${stats.rendimientoGlobal.vistasTotal}</p>
                    <small>${stats.crecimiento.vistas} esta semana</small>
                </div>
                
                <div class="stat-card">
                    <h3>💬 Comentarios</h3>
                    <p class="stat-numero">${stats.rendimientoGlobal.comentariosTotal}</p>
                </div>
                
                <div class="stat-card">
                    <h3>📝 Publicaciones</h3>
                    <p class="stat-numero">${stats.rendimientoGlobal.publicacionesTotal}</p>
                    <small>${stats.crecimiento.publicaciones} esta semana</small>
                </div>
                
                <div class="stat-card">
                    <h3>⚠️ Reportes</h3>
                    <p class="stat-numero">${stats.reportesPendientes}</p>
                </div>
            </div>
            
            ${stats.alertas.length > 0 ? `
                <div class="alertas-section">
                    <h3>🚨 Alertas</h3>
                    ${alertasHTML}
                </div>
            ` : ''}
        </div>
    `;
}

// ==========================================
// 5. EXPORTAR FUNCIONES
// ==========================================

window.mostrarPanelEstadisticas = mostrarPanelEstadisticas;

console.log('✅ Render-stats cargado');