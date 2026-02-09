// ==========================================
// PANEL DE ADMINISTRACIÓN
// Interfaz completa para administradores
// ==========================================

/**
 * Abre el panel de administración
 */
function abrirPanelAdmin() {
    if (!tieneRolMinimo(ROLES.ADMIN)) {
        alert('No tienes permisos para acceder al panel de administración');
        return;
    }
    
    const panel = document.getElementById('admin-panel');
    panel.classList.remove('oculto');
    
    // Mostrar gestión de usuarios por defecto
    mostrarGestionUsuarios();
}

/**
 * Cierra el panel de administración
 */
function cerrarPanelAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.classList.add('oculto');
}

/**
 * Mostrar/ocultar botón de admin según el rol
 */
function actualizarBotonAdmin() {
    const btnAdmin = document.getElementById('btn-abrir-admin-panel');
    
    if (btnAdmin) {
        if (tieneRolMinimo(ROLES.ADMIN)) {
            btnAdmin.classList.remove('oculto');
        } else {
            btnAdmin.classList.add('oculto');
        }
    }
}

/**
 * Muestra la lista de todos los usuarios
 */
function mostrarGestionUsuarios() {
    const content = document.getElementById('admin-panel-content');
    const usuarios = obtenerTodosUsuarios();
    
    let usuariosHTML = '';
    
    usuarios.forEach(u => {
        const estadoClass = u.activo ? 'activo' : 'inactivo';
        const estadoTexto = u.activo ? '✅ Activo' : '❌ Inactivo';
        
        usuariosHTML += `
            <div class="usuario-item ${estadoClass}">
                <div class="usuario-info">
                    <h4>${u.nombre}</h4>
                    <p>📧 ${u.email}</p>
                    <p>🎭 Rol: <strong>${u.rol}</strong></p>
                    <p>📅 Creado: ${new Date(u.fechaCreacion).toLocaleDateString('es-ES')}</p>
                    <p class="usuario-estado">${estadoTexto}</p>
                </div>
                <div class="usuario-acciones">
                    <select onchange="cambiarRolUI(${u.id}, this.value)" class="select-rol">
                        <option value="${ROLES.VISITANTE}" ${u.rol === ROLES.VISITANTE ? 'selected' : ''}>Visitante</option>
                        <option value="${ROLES.USUARIO}" ${u.rol === ROLES.USUARIO ? 'selected' : ''}>Usuario</option>
                        <option value="${ROLES.EDITOR}" ${u.rol === ROLES.EDITOR ? 'selected' : ''}>Editor</option>
                        <option value="${ROLES.SUB_ADMIN}" ${u.rol === ROLES.SUB_ADMIN ? 'selected' : ''}>Sub-Admin</option>
                        <option value="${ROLES.ADMIN}" ${u.rol === ROLES.ADMIN ? 'selected' : ''}>Admin</option>
                    </select>
                    <button onclick="toggleUsuarioActivoUI(${u.id})" class="btn-toggle">
                        ${u.activo ? '🔒 Desactivar' : '🔓 Activar'}
                    </button>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = `
        <div class="gestion-usuarios">
            <h3>👥 Gestión de Usuarios (${usuarios.length})</h3>
            <div class="usuarios-lista">
                ${usuariosHTML}
            </div>
        </div>
    `;
}

// ==========================================
// GESTIÓN DE NOTICIAS
// ==========================================

/**
 * Muestra todas las noticias para gestión
 */
function mostrarGestionNoticias() {
    const content = document.getElementById('admin-panel-content');
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    const stats = obtenerEstadisticas();
    
    let noticiasHTML = '';
    
    noticias.forEach(n => {
        const statsN = stats.noticias[n.id] || {vistas: 0, comentarios: 0, reportes: 0};
        
        noticiasHTML += `
            <div class="noticia-admin-item ${statsN.reportes > 0 ? 'tiene-reportes' : ''}">
                <div class="noticia-admin-info">
                    <h4>${n.titulo}</h4>
                    <p>📂 ${n.categoria} ${n.subcategoria ? `→ ${n.subcategoria}` : ''}</p>
                    <p>✍️ ${n.autor || 'Desconocido'}</p>
                    <p>📅 ${n.fecha}</p>
                    
                    <div class="noticia-admin-stats">
                        <span>👁️ ${statsN.vistas}</span>
                        <span>💬 ${statsN.comentarios}</span>
                        <span class="${statsN.reportes > 0 ? 'reportes-activos' : ''}">
                            ⚠️ ${statsN.reportes} ${statsN.reportes > 0 ? 'REPORTES' : ''}
                        </span>
                    </div>
                </div>
                <div class="noticia-admin-acciones">
                    <button onclick="verNoticiaCompleta(${n.id})" class="btn-admin-ver">👁️ Ver</button>
                    <button onclick="eliminarNoticiaAdmin(${n.id})" class="btn-admin-eliminar">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = `
        <div class="gestion-noticias">
            <h3>📰 Gestión de Noticias (${noticias.length})</h3>
            <div class="noticias-admin-lista">
                ${noticiasHTML || '<p>No hay noticias publicadas.</p>'}
            </div>
        </div>
    `;
}

// ==========================================
// REPORTES PENDIENTES
// ==========================================

/**
 * Muestra reportes pendientes de revisión
 */
function mostrarReportesPendientes() {
    const content = document.getElementById('admin-panel-content');
    const reportes = obtenerReportesPendientes();
    
    let reportesHTML = '';
    
    reportes.forEach(r => {
        const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
        const noticia = noticias.find(n => n.id === r.noticiaId);
        
        reportesHTML += `
            <div class="reporte-item">
                <h4>⚠️ Reporte #${r.id}</h4>
                <p><strong>Noticia:</strong> ${noticia ? noticia.titulo : 'Noticia eliminada'}</p>
                <p><strong>Motivo:</strong> ${r.motivo}</p>
                <p><strong>Fecha:</strong> ${new Date(r.fecha).toLocaleString('es-ES')}</p>
                <div class="reporte-acciones">
                    <button onclick="resolverReporteUI(${r.id}, 'aprobado')" class="btn-aprobar">
                        ✅ Aprobar (noticia está bien)
                    </button>
                    <button onclick="resolverReporteUI(${r.id}, 'eliminado')" class="btn-eliminar-reporte">
                        🗑️ Eliminar noticia
                    </button>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = `
        <div class="reportes-pendientes">
            <h3>⚠️ Reportes Pendientes (${reportes.length})</h3>
            <div class="reportes-lista">
                ${reportesHTML || '<p>✅ No hay reportes pendientes</p>'}
            </div>
        </div>
    `;
}



window.abrirPanelAdmin = abrirPanelAdmin;
window.cerrarPanelAdmin = cerrarPanelAdmin;
window.mostrarGestionUsuarios = mostrarGestionUsuarios;
window.mostrarGestionNoticias = mostrarGestionNoticias;
window.mostrarReportesPendientes = mostrarReportesPendientes;