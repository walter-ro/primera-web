// ==========================================
// SISTEMA DE COMENTARIOS Y REPORTES
// Permite a usuarios comentar y reportar contenido
// ==========================================

// ==========================================
// 1. GESTIÓN DE COMENTARIOS
// ==========================================

/**
 * Guarda un comentario en una noticia
 * ⚠️ Solo usuarios logueados pueden comentar
 */
function guardarComentario(noticiaId, contenido) {
    const usuario = obtenerUsuarioActual();
    
    // Verificar permiso
    if (!tienePermiso('comentar')) {
        alert('Debes iniciar sesión para comentar');
        return false;
    }
    
    // Obtener comentarios existentes
    let comentarios = JSON.parse(localStorage.getItem('db_comentarios')) || {};
    
    // Crear array si no existe para esta noticia
    if (!comentarios[noticiaId]) {
        comentarios[noticiaId] = [];
    }
    
    // Crear comentario
    const comentario = {
        id: Date.now(),
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        contenido: contenido.trim(),
        fecha: new Date().toISOString(),
        fechaLegible: new Date().toLocaleString('es-ES'),
        editado: false
    };
    
    // Agregar al inicio (más reciente primero)
    comentarios[noticiaId].unshift(comentario);
    
    // Guardar
    localStorage.setItem('db_comentarios', JSON.stringify(comentarios));
    
    // ⚠️ IMPORTANTE: Registrar en estadísticas
    registrarComentario(noticiaId, usuario.id);
    
    return true;
}

/**
 * Obtiene comentarios de una noticia
 */
function obtenerComentarios(noticiaId) {
    const comentarios = JSON.parse(localStorage.getItem('db_comentarios')) || {};
    return comentarios[noticiaId] || [];
}

/**
 * Elimina un comentario (solo moderadores)
 */
function eliminarComentario(noticiaId, comentarioId) {
    if (!tienePermiso('moderar')) {
        alert('No tienes permiso para eliminar comentarios');
        return false;
    }
    
    let comentarios = JSON.parse(localStorage.getItem('db_comentarios')) || {};
    
    if (comentarios[noticiaId]) {
        comentarios[noticiaId] = comentarios[noticiaId].filter(c => c.id !== comentarioId);
        localStorage.setItem('db_comentarios', JSON.stringify(comentarios));
        return true;
    }
    
    return false;
}

// ==========================================
// 2. SISTEMA DE REPORTES
// ==========================================

/**
 * Reporta una noticia por contenido inapropiado
 */
function reportarNoticia(noticiaId, motivo) {
    const usuario = obtenerUsuarioActual();
    
    if (usuario.rol === ROLES.VISITANTE) {
        alert('Debes iniciar sesión para reportar contenido');
        return false;
    }
    
    // ⚠️ IMPORTANTE: Registrar en estadísticas
    registrarReporte(noticiaId, usuario.id, motivo);
    
    alert('✅ Reporte enviado. Será revisado por los moderadores.');
    return true;
}

/**
 * Obtiene reportes pendientes (solo moderadores)
 */
function obtenerReportesPendientes() {
    if (!tienePermiso('moderar')) {
        return [];
    }
    
    const stats = obtenerEstadisticas();
    return stats.reportes.filter(r => !r.resuelto);
}

/**
 * Marca un reporte como resuelto
 */
function resolverReporte(reporteId, accion) {
    if (!tienePermiso('moderar')) {
        alert('No tienes permiso para resolver reportes');
        return false;
    }
    
    const stats = obtenerEstadisticas();
    const reporte = stats.reportes.find(r => r.id === reporteId);
    
    if (reporte) {
        reporte.resuelto = true;
        reporte.accion = accion;
        reporte.fechaResolucion = new Date().toISOString();
        guardarEstadisticas(stats);
        return true;
    }
    
    return false;
}

// ==========================================
// 3. RENDERIZADO DE COMENTARIOS
// ==========================================

/**
 * Renderiza la sección de comentarios en una noticia
 */
function renderizarSeccionComentarios(noticiaId) {
    const comentarios = obtenerComentarios(noticiaId);
    const usuario = obtenerUsuarioActual();
    const puedeComentar = tienePermiso('comentar');
    const puedeModerar = tienePermiso('moderar');
    
    // ⚠️ MODIFICA AQUÍ: Define qué usuarios NO pueden ver el botón de reportar
    const puedeReportar = usuario && usuario.rol !== 'VISITANTE'; // 🔧 Cambia 'VISITANTE' por el nombre exacto
    // Otros ejemplos:
    // const puedeReportar = usuario && usuario.rol !== 'visitantes';
    // const puedeReportar = usuario && !['visitante', 'invitado'].includes(usuario.rol);
    
    let comentariosHTML = '';
    
    if (comentarios.length === 0) {
        comentariosHTML = '<p class="sin-comentarios">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
    } else {
        comentarios.forEach(c => {
            const totalLikes = SistemaLikes.obtenerTotalLikes(c.id);
            const yaLikeado = usuario ? SistemaLikes.usuarioYaLikeo(c.id, usuario.id) : false;
            
            comentariosHTML += `
                <div class="comentario" data-comentario-id="${c.id}">
                    <div class="comentario-header">
                        <span class="comentario-autor">👤 ${c.usuarioNombre}</span>
                        <span class="comentario-fecha">${c.fechaLegible}</span>
                        ${puedeModerar ? `
                            <button onclick="eliminarComentarioUI(${noticiaId}, ${c.id})" 
                                    class="btn-eliminar-comentario">🗑️</button>
                        ` : ''}
                    </div>
                    <p class="comentario-contenido">${c.contenido}</p>

                    <div class="comentario-acciones">
                        <!-- Like (izquierda) -->
                        <div class="acciones-izquierda">
                            <button onclick="darLike(${noticiaId}, ${c.id})" 
                                    class="btn-like ${yaLikeado ? 'liked' : ''}">
                                ${yaLikeado ? '❤️ Te gusta' : '🤍 Like'}
                            </button>
                            <span class="likes-count" id="likes-${c.id}">${totalLikes}</span>
                        </div>
                        
                        <!-- Reportar (derecha) -->
                        ${puedeReportar ? `
                            <div class="acciones-derecha">
                                <button onclick="abrirModalReporte(${noticiaId}, ${c.id})" 
                                        class="btn-reportar"
                                        title="Reportar comentario">
                                    🚩 Reportar
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
    }
    
    return `
        <div class="seccion-comentarios">
            <h3>💬 Comentarios (${comentarios.length})</h3>
            
            ${puedeComentar ? `
                <div class="form-comentario">
                    <textarea id="comentario-input-${noticiaId}" 
                              placeholder="Escribe tu comentario..." 
                              rows="3"></textarea>
                    <button onclick="enviarComentario(${noticiaId})" class="btn-comentar">
                        Comentar
                    </button>
                </div>
            ` : `
                <p class="aviso-login">
                    <a href="#" onclick="mostrarLogin()">Inicia sesión</a> para comentar
                </p>
            `}
            
            <div class="lista-comentarios">
                ${comentariosHTML}
            </div>
        </div>
    `;
}

/**
 * Envía un comentario (llamado desde el botón)
 */
window.enviarComentario = function(noticiaId) {
    const input = document.getElementById(`comentario-input-${noticiaId}`);
    const contenido = input.value.trim();
    
    if (!contenido) {
        alert('El comentario no puede estar vacío');
        return;
    }

        // ✅ NUEVO: Incrementar contador de comentarios en métricas
    if (typeof SistemaMetricas !== 'undefined') {
        SistemaMetricas.incrementarComentarios(noticiaId);
    }
    
    if (contenido.length < 3) {
        alert('El comentario debe tener al menos 3 caracteres');
        return;
    }
    
    if (guardarComentario(noticiaId, contenido)) {
        // Recargar la sección de comentarios
        const seccion = document.querySelector('.seccion-comentarios');
        if (seccion) {
            seccion.outerHTML = renderizarSeccionComentarios(noticiaId);
        }
    }
}

/**
 * Elimina un comentario (interfaz)
 */
window.eliminarComentarioUI = function(noticiaId, comentarioId) {
    if (confirm('¿Seguro que deseas eliminar este comentario?')) {
        if (eliminarComentario(noticiaId, comentarioId)) {
            // Recargar la sección
            const seccion = document.querySelector('.seccion-comentarios');
            if (seccion) {
                seccion.outerHTML = renderizarSeccionComentarios(noticiaId);
            }
        }
    }
}

// ==========================================
// 4. VISTA DETALLADA DE NOTICIA CON COMENTARIOS
// ==========================================

/**
 * Renderiza una noticia completa con comentarios y opciones
 * ⚠️ Esta función reemplaza/mejora la vista de noticia
 */


/**
 * Reportar noticia (interfaz)
 */
window.reportarNoticiaUI = function(noticiaId) {
    const motivo = prompt('¿Por qué reportas esta noticia?\n\n1. Contenido ofensivo\n2. Información falsa\n3. Spam\n4. Otro');
    
    if (motivo) {
        reportarNoticia(noticiaId, motivo);
    }
}


