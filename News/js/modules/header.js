/**
 * ========================================
 * HEADER - NAVEGACIÓN PRINCIPAL
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Event listeners del menú principal
 * - Navegación a inicio, login, registro
 * - Redirección a categorías
 * 
 * IMPORTANTE:
 * - Usa el sistema de navegación global (navegacion.js)
 * - NO modifica directamente innerHTML de main-content
 * - Usa renderizarEnMain() para auth
 * - Usa cambiarVista() para cambiar secciones
 */

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================

const logoInicio = document.querySelector('.logo a');

// ==========================================
// NAVEGACIÓN A INICIO
// ==========================================

/**
 * Click en el logo → Volver a noticias principales
 */
logoInicio?.addEventListener('click', (e) => {
    e.preventDefault();
    volverInicio();
});

// ==========================================
// NAVEGACIÓN POR CATEGORÍAS
// ==========================================

/**
 * Si tienes menú de categorías en el header
 * Ejemplo: <a href="#" data-categoria="deportes">Deportes</a>
 */
document.querySelectorAll('[data-categoria]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const categoria = e.target.getAttribute('data-categoria');
        
        // Renderizar noticias de esa categoría
        if (typeof renderizarNoticias === 'function') {
            renderizarNoticias(categoria);
        }
    });
});

console.log('✅ Header navegación cargado');