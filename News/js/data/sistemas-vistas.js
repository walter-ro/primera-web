/**
 * ========================================
 * SISTEMA DE NAVEGACIÓN ENTRE VISTAS
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Controlar qué sección de la página se muestra
 * - Ocultar/mostrar: #main-content, #admin-area, #panel-dinamico, #admin-panel
 * - Evitar que las funciones se peleen por el mismo espacio
 * 
 * ESTRUCTURA DE LA PÁGINA:
 * - #admin-area → Editor de noticias (solo EDITOR+)
 * - #main-content → Lista de noticias (siempre visible por defecto)
 * - #panel-dinamico → Estadísticas, métricas, posts pendientes (se renderiza dinámicamente)
 * - #admin-panel → Panel flotante de administración (solo ADMIN)
 * 
 * IMPORTANTE:
 * - Este archivo debe cargarse ANTES que los demás
 * - Todas las funciones de navegación usan este sistema
 */

// ==========================================
// 1. TIPOS DE VISTA
// ==========================================

const VISTAS = {
    NOTICIAS: 'noticias',           // Vista principal (main-content)
    ADMIN_EDITOR: 'admin-editor',   // Editor de noticias (admin-area)
    PANEL_DINAMICO: 'panel-dinamico', // Estadísticas, métricas, etc.
    AUTH: 'auth'                    // Login/Registro (dentro de main-content)
};

// ==========================================
// 2. FUNCIÓN PRINCIPAL DE NAVEGACIÓN
// ==========================================

/**
 * Cambia entre vistas principales de la aplicación
 * 
 * @param {string} vista - Tipo de vista a mostrar (usar constantes VISTAS)
 * @param {Object} opciones - Opciones adicionales { ocultarAdmin: boolean }
 */
let vistaActual = null; // Estado global

function cambiarVista(vista, opciones = {}) {
    if (vistaActual === vista) return; // ⚡ evita logs y cambios redundantes

    vistaActual = vista;

    const mainContent = document.getElementById('main-content');
    const adminArea = document.getElementById('admin-area');
    const panelDinamico = document.getElementById('panel-dinamico');
    const adminPanel = document.getElementById('admin-panel');

    const ocultarTodo = opciones.ocultarAdmin !== false;

    switch(vista) {
        case VISTAS.NOTICIAS:
            if (mainContent) mainContent.classList.remove('oculto');
            if (adminArea && ocultarTodo) adminArea.classList.add('oculto');
            if (panelDinamico) {
                panelDinamico.classList.add('oculto');
                panelDinamico.innerHTML = '';
            }
            break;
        case VISTAS.ADMIN_EDITOR:
            if (mainContent) mainContent.classList.add('oculto');
            if (adminArea) adminArea.classList.remove('oculto');
            if (panelDinamico) {
                panelDinamico.classList.add('oculto');
                panelDinamico.innerHTML = '';
            }
            break;
        case VISTAS.PANEL_DINAMICO:
            if (mainContent) mainContent.classList.add('oculto');
            if (adminArea && ocultarTodo) adminArea.classList.add('oculto');
            if (panelDinamico) panelDinamico.classList.remove('oculto');
            break;
        case VISTAS.AUTH:
            if (mainContent) mainContent.classList.remove('oculto');
            if (adminArea && ocultarTodo) adminArea.classList.add('oculto');
            if (panelDinamico) {
                panelDinamico.classList.add('oculto');
                panelDinamico.innerHTML = '';
            }
            break;
    }

    console.log(`🔄 Vista cambiada a: ${vista}`);
}
// ==========================================
// 3. FUNCIÓN DE VOLVER AL INICIO
// ==========================================

/**
 * Vuelve a la vista principal de noticias
 * Limpia paneles dinámicos y muestra noticias
 */
function volverInicio() {
    // Cambiar a vista de noticias
    cambiarVista(VISTAS.NOTICIAS);
    
    // Recargar noticias si la función existe
    if (typeof renderizarNoticias === 'function') {
        renderizarNoticias('inicio');
    }
    
    // Aplicar control de acceso (mostrar/ocultar admin-area según permisos)
    if (typeof aplicarControlDeAcceso === 'function') {
        aplicarControlDeAcceso();
    }
}

// ==========================================
// 4. RENDERIZAR EN PANEL DINÁMICO
// ==========================================

/**
 * Renderiza contenido HTML en el panel dinámico
 * Oculta automáticamente main-content y admin-area
 * 
 * @param {string} contenidoHTML - HTML a renderizar
 */
function renderizarEnPanelDinamico(contenidoHTML) {
    const panelDinamico = document.getElementById('panel-dinamico');
    
    if (!panelDinamico) {
        console.error('❌ #panel-dinamico no existe en el HTML');
        return;
    }
    
    // Cambiar a vista de panel dinámico
    cambiarVista(VISTAS.PANEL_DINAMICO);
    
    // Renderizar contenido
    panelDinamico.innerHTML = contenidoHTML;
}

// ==========================================
// 5. RENDERIZAR EN MAIN CONTENT
// ==========================================

/**
 * Renderiza contenido HTML en main-content
 * Útil para páginas de auth, búsquedas, etc.
 * 
 * @param {string} contenidoHTML - HTML a renderizar
 * @param {Object} opciones - { ocultarAdmin: boolean }
 */
function renderizarEnMain(contenidoHTML, opciones = {}) {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
        console.error('❌ #main-content no existe en el HTML');
        return;
    }
    
    // Cambiar a vista AUTH (mantiene main visible)
    cambiarVista(VISTAS.AUTH, opciones);
    
    // Renderizar contenido
    mainContent.innerHTML = contenidoHTML;
}

// ==========================================
// 6. GESTIÓN DEL ADMIN-PANEL (FLOTANTE)
// ==========================================

/**
 * Abre el panel flotante de administración
 * Solo para ADMIN
 */

function abrirPanelAdmin() {
    const adminPanel = document.getElementById('admin-panel');
    
    if (!adminPanel) {
        console.error('❌ #admin-panel no existe en el HTML');
        return;
    }
    
    // Verificar permisos
    if (typeof esRolExacto === 'function' && typeof ROLES !== 'undefined') {
        if (!esRolExacto(ROLES.ADMIN)) {
            alert('No tienes permisos para acceder al panel de administración');
            return;
        }
    }
    
    adminPanel.classList.remove('oculto');
}

/**
 * Cierra el panel flotante de administración
 */
function cerrarPanelAdmin() {
    const adminPanel = document.getElementById('admin-panel');
    
    if (adminPanel) {
        adminPanel.classList.add('oculto');
    }
}

// ==========================================
// 8. MOSTRAR EDITOR DE NOTICIAS
// ==========================================

/**
 * Muestra el editor de noticias (workboard)
 * Oculta main-content y panel-dinamico
 */
function mostrarEditorNoticias() {
    // Verificar permisos de manera más robusta
    const usuario = obtenerUsuarioActual?.();
    
    if (!usuario) {
        alert('❌ Debes iniciar sesión para crear noticias');
        return;
    }
    
    // Verificar si tiene permiso de crear posts (directo o pendiente)
    const puedeCrear = tienePermiso?.('crearPostDirecto') || tienePermiso?.('crearPostPendiente');
    
    if (!puedeCrear) {
        alert('❌ No tienes permisos para crear noticias');
        return;
    }
    
    // Cambiar a vista de editor
    cambiarVista(VISTAS.ADMIN_EDITOR);
    
    console.log('✍️ Editor de noticias activado');
}

// ==========================================
// 7. EXPORTAR FUNCIONES GLOBALES
// ==========================================

window.VISTAS = VISTAS;
window.cambiarVista = cambiarVista;
window.volverInicio = volverInicio;
window.renderizarEnPanelDinamico = renderizarEnPanelDinamico;
window.renderizarEnMain = renderizarEnMain;
window.abrirPanelAdmin = abrirPanelAdmin;
window.cerrarPanelAdmin = cerrarPanelAdmin;
window.mostrarEditorNoticias = mostrarEditorNoticias;

console.log('✅ Sistema de navegación cargado');