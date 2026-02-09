// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

/**
 * Cambiar rol de usuario (UI)
 */
window.cambiarRolUI = function(usuarioId, nuevoRol) {
    if (cambiarRolUsuario(usuarioId, nuevoRol)) {
        alert('✅ Rol actualizado correctamente');
        mostrarGestionUsuarios();
    }
}

/**
 * Activar/Desactivar usuario (UI)
 */
window.toggleUsuarioActivoUI = function(usuarioId) {
    if (toggleUsuarioActivo(usuarioId)) {
        alert('✅ Estado del usuario actualizado');
        mostrarGestionUsuarios();
    }
}

/**
 * Eliminar noticia desde panel admin
 */
window.eliminarNoticiaAdmin = function(noticiaId) {
    if (!confirm('⚠️ ¿Eliminar esta noticia permanentemente?')) {
        return;
    }

    const eliminado = eliminarNoticia(noticiaId);

    if (eliminado) {
        alert('✅ Noticia eliminada');
        mostrarGestionNoticias();
    } else {
        alert('❌ No se pudo eliminar la noticia');
    }
}

/**
 * Resolver reporte (UI)
 */
window.resolverReporteUI = function(reporteId, accion) {
    if (resolverReporte(reporteId, accion)) {
        alert(`✅ Reporte resuelto: ${accion}`);
        mostrarReportesPendientes();
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

/**
 * Actualizar visibilidad del botón de admin según el rol del usuario
 */
function inicializarPanelAdmin() {
    // Ejecutar inmediatamente si el DOM ya está listo
    if (typeof actualizarBotonAdmin === 'function') {
        actualizarBotonAdmin();
    }
}

// Ejecutar al cargar el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarPanelAdmin);
} else {
    // Si el DOM ya está cargado, ejecutar inmediatamente
    inicializarPanelAdmin();
}

console.log('✅ Panel Admin cargado');