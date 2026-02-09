import { inicializarSistemaRoles } from './authentication/Permisos.js';

/**
 * ========================================
 * MAIN.JS - INICIALIZACIÓN PRINCIPAL
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Inicializar la aplicación al cargar
 * - Configurar event listeners globales
 * - Cargar vista inicial
 */

// ==========================================
// 1. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando aplicación...');

    limpiarUsuariosDuplicados();

    // Inicializar sistema de roles
    if (typeof inicializarSistemaRoles === 'function') {
        inicializarSistemaRoles();
    }

    // Renderizar noticias iniciales
    if (typeof renderizarNoticias === 'function') {
        renderizarNoticias('inicio');
    }

    // Mostrar/ocultar botón de admin según rol
    mostrarBotonAdminSiCorresponde();

    console.log('✅ Aplicación iniciada');
});

// ==========================================
// 2. EVENT LISTENERS GLOBALES
// ==========================================

document.addEventListener('click', (e) => {
    // Logo - volver al inicio
    if (e.target.id === 'logo-inicio' || e.target.closest('#logo-inicio')) {
        e.preventDefault();
        if (typeof volverInicio === 'function') {
            volverInicio();
        }
    }
    
    // Abrir panel de admin (desde cualquier botón)
    if (e.target.id === 'btn-abrir-admin' || 
        e.target.id === 'btn-abrir-admin-panel' ||
        e.target.classList.contains('btn-admin-access')) {
        e.preventDefault();
        if (typeof abrirPanelAdmin === 'function') {
            abrirPanelAdmin();
        }
    }
});

// ==========================================
// 3. NAVEGACIÓN POR CATEGORÍAS
// ==========================================

const menuCategorias = document.querySelector('.categorias-list');
if (menuCategorias) {
    menuCategorias.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            const categoria = link.dataset.target;
            if (typeof renderizarNoticias === 'function') {
                renderizarNoticias(categoria);
            }
        }
    });
}

// ==========================================
// 4. UTILIDADES
// ==========================================

/**
 * Limpia usuarios duplicados en localStorage
 * Solo se ejecuta una vez al cargar
 */
function limpiarUsuariosDuplicados() {
    let usuarios = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    
    // Filtrar duplicados por email
    usuarios = usuarios.filter((u, index, self) =>
        index === self.findIndex(t => t.email === u.email)
    );
    
    localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
    console.log('✅ Usuarios limpios:', usuarios.length);
}

/**
 * Muestra el botón de admin si el usuario tiene permisos
 */
function mostrarBotonAdminSiCorresponde() {
    // Verificar si existe la función obtenerUsuarioActual
    if (typeof obtenerUsuarioActual !== 'function') {
        console.warn('⚠️ Función obtenerUsuarioActual no disponible');
        return;
    }
    
    const usuario = obtenerUsuarioActual();
    const btnAdmin = document.getElementById('btn-admin-panel');
    
    if (btnAdmin && usuario && (usuario.rol === 'admin' || usuario.rol === 'sub-admin')) {
        btnAdmin.style.display = 'inline-block';
    }
}

console.log('✅ Main.js cargado');






// En tu archivo main.js o similar

function obtenerUsuarioActual() {
    const usuarioJSON = localStorage.getItem('usuario_actual');
    return usuarioJSON ? JSON.parse(usuarioJSON) : null;
}

function tienePermiso(permiso) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;
    
    // 🔧 MODIFICA AQUÍ según tus permisos
    const permisos = {
        'admin': ['todo'], // Admin tiene acceso a todo
        'sub-admin': ['gestion-usuarios', 'ver-reportes', 'ver-metricas', 'moderar'],
        'editor': ['crear-post', 'editar-propio', 'comentar'],
        'sub-editor': ['crear-borrador', 'comentar'],
        'usuario': ['comentar', 'dar-like']
    };
    
    const permisosRol = permisos[usuario.rol] || [];
    
    return permisosRol.includes('todo') || permisosRol.includes(permiso);
}

// Función para abrir el panel de administración
function abrirPanelAdmin() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('Debes iniciar sesión');
        return;
    }
    
    // 🔧 MODIFICA AQUÍ los roles que pueden acceder
    if (usuario.rol !== 'admin' && usuario.rol !== 'sub-admin') {
        alert('No tienes permisos para acceder al panel de administración');
        return;
    }
    
    document.getElementById('admin-panel').classList.remove('oculto');
    AdminNavegacion.inicializar();
}