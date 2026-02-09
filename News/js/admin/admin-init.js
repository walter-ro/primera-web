
// ==========================================
// INICIALIZACIÓN DEL PANEL DE ADMINISTRACIÓN
// ==========================================

/**
 * Abre el panel de administración
 * Verifica permisos antes de abrir
 */
function abrirPanelAdmin() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario || usuario.rol === 'visitante') {
        alert('Debes iniciar sesión para acceder al panel de administración');
        return;
    }
    
    // 🔧 Roles que pueden acceder al panel
    const rolesPermitidos = ['admin', 'sub-admin'];
    
    if (!rolesPermitidos.includes(usuario.rol)) {
        alert('No tienes permisos para acceder al panel de administración');
        return;
    }
    
    document.getElementById('admin-panel').classList.remove('oculto');
    
    // Inicializar navegación del panel
    if (typeof AdminNavegacion !== 'undefined' && typeof AdminNavegacion.inicializar === 'function') {
        AdminNavegacion.inicializar();
    }
}

/**
 * Cierra el panel de administración
 */
function cerrarPanelAdmin() {
    document.getElementById('admin-panel').classList.add('oculto');
}

// Hacer funciones globales
window.abrirPanelAdmin = abrirPanelAdmin;
window.cerrarPanelAdmin = cerrarPanelAdmin;

console.log('✅ Panel de administración inicializado');

