import { DESARROLLO } from "./config.js";

/**
 * ========================================
 * SISTEMA DE ROLES Y PERMISOS - VERSIÓN COMPOSICIÓN
 * ========================================
 * 
 * FILOSOFÍA:
 * - Cada rol se construye sumando "bloques de permisos"
 * - Los bloques son reutilizables entre roles
 * - Fácil agregar/quitar permisos sin romper nada
 * 
 * CÓMO AGREGAR UN NUEVO PERMISO:
 * 1. Si es un permiso individual → Agrégalo directamente al rol
 * 2. Si son varios permisos relacionados → Crea un bloque nuevo
 * 3. Agrega el bloque a los roles que lo necesiten
 * 
 * CÓMO QUITAR UN PERMISO:
 * 1. Busca el permiso en el rol
 * 2. Elimínalo o comenta la línea
 * 3. Si era parte de un bloque, considera si otros roles lo necesitan
 */

/**
 * Inicializa el sistema de roles al cargar la página
 */
export function inicializarSistemaRoles() {
    aplicarControlDeAcceso();
    mostrarPanelDesarrollo();
}

// ==========================================
// 1. DEFINICIÓN DE ROLES
// ==========================================

/**
 * Roles disponibles en el sistema
 * ⚠️ NO MODIFICAR estos valores, se usan como claves en toda la app
 */
const ROLES = {
    VISITANTE: 'visitante',
    USUARIO: 'usuario',
    SUB_EDITOR: 'sub-editor',
    EDITOR: 'editor',
    SUB_ADMIN: 'sub-admin',
    ADMIN: 'admin'
};

// ==========================================
// 2. BLOQUES DE PERMISOS (PIEZAS LEGO)
// ==========================================
// 💡 Cada bloque agrupa permisos relacionados
// 💡 Los bloques se reutilizan entre roles
// 💡 AQUÍ ES DONDE AGREGAS NUEVOS GRUPOS DE PERMISOS

/**
 * BLOQUE: Permisos básicos de lectura
 * Todos los usuarios tienen estos permisos mínimos
 */
const PERMISOS_LECTURA_BASE = {
    leerNoticias: true,
    verEncuesta: true
};

/**
 * BLOQUE: Interacción básica del usuario
 * Comentar, dar like, jugar, reportar
 */
const PERMISOS_INTERACCION = {
    comentar: true,
    darLike: true,
    accederGames: true,
    reportarNoticia: true
};

/**
 * BLOQUE: Acceso completo a todas las áreas
 * USUARIO normal debe pagar con puntos
 * SUB_EDITOR+ lo tienen gratis
 */
const PERMISOS_ACCESO_COMPLETO = {
    accesoTodasLasAreas: true  // Sin restricciones de puntos
};

/**
 * BLOQUE: Creación de contenido PENDIENTE
 * Solo para SUB_EDITOR
 * Sus posts quedan congelados hasta aprobación
 */
const PERMISOS_CREAR_PENDIENTE = {
    crearPostPendiente: true,              // Puede crear pero queda pendiente
    verEstadoMisPostsPendientes: true,     // Ve si fue aprobado/rechazado
    editarPostAprobadoPropio: true         // Una vez aprobado, puede editarlo
};

/**
 * BLOQUE: Creación de contenido DIRECTO
 * Para EDITOR+
 * Publican sin aprobación previa
 */
const PERMISOS_CREAR_DIRECTO = {
    crearPostDirecto: true,        // Publica inmediatamente
    editarPostPropio: true,        // Edita sus propios posts
    eliminarPostPropio: true       // Elimina sus propios posts
};

/**
 * BLOQUE: Aprobación de posts pendientes
 * Para EDITOR+ (aprueban posts de SUB_EDITORES)
 */
const PERMISOS_APROBACION = {
    verPostsPendientesAsignados: true,  // Ve posts de SUS sub-editores
    aprobarPosts: true,                 // Aprueba un post pendiente
    rechazarPosts: true                 // Rechaza con razón
};

/**
 * BLOQUE: Asignación de SUB_EDITORES
 * Para EDITOR+ (máximo 5 por persona)
 */
const PERMISOS_ASIGNACION = {
    asignarSubEditores: true,       // Puede asignar sub-editores (max 5)
    removerSubEditores: true,       // Puede quitar la asignación
    verMisSubEditores: true         // Ve lista de sus asignados
};

/**
 * BLOQUE: Moderación global
 * Para SUB_ADMIN+ (editan/eliminan contenido de otros)
 */
const PERMISOS_MODERACION = {
    editarCualquierPost: true,          // Edita posts de cualquiera
    eliminarCualquierPost: true,        // Elimina posts (límite: 50/día SUB_ADMIN, 100/día ADMIN)
    moderarComentarios: true,           // Elimina comentarios inapropiados
    silenciarUsuarios: true,            // Silencia usuarios globalmente
    revisarReportesAsignados: true,     // Ve reportes de editores asignados
    resolverReportes: true,             // Marca reportes como resueltos
    verEstadisticasEditores: true,      // Ve stats de editores
    gestionarUsuarios: true             // Puede subir nivel de usuarios
};

/**
 * BLOQUE: Investigaciones
 * Para SUB_ADMIN+ (contenido especial/premium)
 */
const PERMISOS_INVESTIGACIONES = {
    leerInvestigaciones: true,
    comentarInvestigaciones: true,
    crearInvestigaciones: true,
    editarInvestigacionesPropias: true,
    eliminarInvestigacionesPropias: true
};

/**
 * BLOQUE: Permisos exclusivos de ADMIN
 * Control total del sistema
 */
const PERMISOS_ADMIN_TOTAL = {
    revisarTodosLosReportes: true,      // Ve TODOS los reportes, no solo asignados
    verTodasLasEstadisticas: true,      // Stats globales de toda la plataforma
    eliminarInvestigaciones: true,      // Puede eliminar investigaciones de otros
    seleccionarDuracionSilencio: true,  // Elige castigo (1 día, semana, mes, indefinido)
    contadorEliminadosPorPersona: true  // Ve cuántos posts eliminó cada moderador
};

/**
 * BLOQUE: Encuestas
 * Para EDITOR+ (crear y gestionar encuestas)
 */
const PERMISOS_ENCUESTAS = {
    crearEncuesta: true,
    verResultadosEncuesta: true
};

//OJO este es un nuevo bloque de permisos
// En roles.js - Agregar este bloque nuevo
const PERMISOS_METRICAS = {
    verTiempoLectura: true,          // Ver cuánto leen
    verTasaRebote: true,             // Ver rebote
    verRetencion: true,              // Ver retención
    verBusquedasPopulares: true,     // Ver qué buscan
    verCategoriasPopulares: true,    // Ver categorías top
    verEngagementUsuarios: true,     // Ver engagement individual
    exportarMetricas: true           // Descargar reportes
};

// ==========================================
// 3. COMPOSICIÓN DE ROLES
// ==========================================
// 💡 AQUÍ DEFINES QUÉ BLOQUES TIENE CADA ROL
// 💡 Para agregar un permiso: agrega el bloque o permiso individual
// 💡 Para quitar un permiso: elimina la línea o comenta

/**
 * Permisos finales de cada rol
 * Se construyen sumando bloques + permisos individuales
 */
const PERMISOS_POR_ROL = {
    /**
     * VISITANTE
     * - Solo lectura básica
     * - No puede interactuar
     */
    [ROLES.VISITANTE]: {
        ...PERMISOS_LECTURA_BASE
    },

    /**
     * USUARIO (suscrito)
     * - Lectura + Interacción
     * - Debe gastar puntos para desbloquear áreas premium
     * - Ve sus propias estadísticas
     */
    [ROLES.USUARIO]: {
        ...PERMISOS_LECTURA_BASE,
        ...PERMISOS_INTERACCION,
        // Permisos individuales específicos de USUARIO
        verEstadisticasPropias: true,
        participarEncuesta: true
        // 💡 AGREGAR AQUÍ: Permisos futuros de sistema de puntos
        // gastarPuntosEnAcceso: true,
        // verMisPuntos: true,
    },

    /**
     * SUB_EDITOR (asistente voluntario)
     * - Todo lo de USUARIO
     * - Acceso GRATIS a todas las áreas (beneficio principal)
     * - Crea posts PENDIENTES de aprobación
     * - Máximo 5 por EDITOR/SUB_ADMIN/ADMIN
     */
    [ROLES.SUB_EDITOR]: {
        ...PERMISOS_LECTURA_BASE,
        ...PERMISOS_INTERACCION,
        ...PERMISOS_ACCESO_COMPLETO,     // ← Beneficio clave
        ...PERMISOS_CREAR_PENDIENTE,     // ← Lo especial de este rol
        // Permisos individuales
        verEstadisticasPropias: true,
        participarEncuesta: true,
        verQuienEsMiEditor: true         // Sabe quién lo supervisa
    },

    /**
     * EDITOR (staff pagado - entrada al equipo)
     * - Publica contenido directo
     * - Aprueba posts de SUB_EDITORES
     * - Puede asignar hasta 5 SUB_EDITORES
     * - Silencia usuarios solo en SUS publicaciones
     */
    [ROLES.EDITOR]: {
        ...PERMISOS_LECTURA_BASE,
        ...PERMISOS_INTERACCION,
        ...PERMISOS_ACCESO_COMPLETO,
        ...PERMISOS_CREAR_DIRECTO,
        ...PERMISOS_APROBACION,          // ← Aprueba posts pendientes
        ...PERMISOS_ASIGNACION,          // ← Asigna sub-editores
        ...PERMISOS_ENCUESTAS,
        // Permisos individuales
        verEstadisticasPropias: true,
        participarEncuesta: true,
        silenciarEnMisPublicaciones: true,  // Solo en SUS posts
        reportarContenido: true
    },

    /**
     * SUB_ADMIN (staff pagado - supervisor)
     * - Todo lo de EDITOR
     * - Moderación global (edita/elimina posts de otros)
     * - Gestiona usuarios (puede subirlos de nivel)
     * - Límite: 50 eliminaciones/día
     */
    [ROLES.SUB_ADMIN]: {
        ...PERMISOS_LECTURA_BASE,
        ...PERMISOS_INTERACCION,
        ...PERMISOS_ACCESO_COMPLETO,
        ...PERMISOS_CREAR_DIRECTO,
        ...PERMISOS_APROBACION,
        ...PERMISOS_ASIGNACION,
        ...PERMISOS_MODERACION,          // ← Moderación global
        ...PERMISOS_INVESTIGACIONES,
        ...PERMISOS_ENCUESTAS,
        // Permisos individuales
        verEstadisticasPropias: true,
        participarEncuesta: true,
        reportarContenido: true,
        verRankingPropio: true,
        verRankingGlobal: true
    },

    /**
     * ADMIN (staff pagado - control total)
     * - Todo lo de SUB_ADMIN
     * - Ve TODOS los reportes (no solo asignados)
     * - Estadísticas globales
     * - Puede eliminar investigaciones de otros
     * - Límite: 100 eliminaciones/día
     */
    [ROLES.ADMIN]: {
        ...PERMISOS_LECTURA_BASE,
        ...PERMISOS_INTERACCION,
        ...PERMISOS_ACCESO_COMPLETO,
        ...PERMISOS_CREAR_DIRECTO,
        ...PERMISOS_APROBACION,
        ...PERMISOS_ASIGNACION,
        ...PERMISOS_MODERACION,
        ...PERMISOS_INVESTIGACIONES,
        ...PERMISOS_ADMIN_TOTAL,         // ← Control total
        ...PERMISOS_ENCUESTAS,
        ...PERMISOS_METRICAS,
        // Permisos individuales
        verEstadisticasPropias: true,
        participarEncuesta: true,
        reportarContenido: true,
        verRankingPropio: true,
        verRankingGlobal: true
    }
};

// ==========================================
// 4. JERARQUÍA DE ROLES (para comparaciones)
// ==========================================
// 💡 Solo se usa para funciones como tieneRolMinimo()
// 💡 No afecta los permisos (esos se definen arriba)

const JERARQUIA_ROLES = [
    ROLES.VISITANTE,
    ROLES.USUARIO,
    ROLES.SUB_EDITOR,
    ROLES.EDITOR,
    ROLES.SUB_ADMIN,
    ROLES.ADMIN
];

// ==========================================
// 5. GESTIÓN DE SESIÓN
// ==========================================

/**
 * Obtiene el usuario actual de la sesión
 * @returns {Object} Usuario con {id, nombre, rol, email}
 */
function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuario_actual');
    if (usuario) {
        return JSON.parse(usuario);
    }
    // Si no hay usuario logueado, es visitante
    return {
        id: null,
        nombre: 'Visitante',
        rol: ROLES.VISITANTE,
        email: null
    };
}

/**
 * Guarda el usuario en la sesión
 * @param {Object} usuario - Objeto con datos del usuario
 */
function establecerUsuarioActual(usuario) {
    localStorage.setItem('usuario_actual', JSON.stringify(usuario));
}

/**
 * Cierra sesión del usuario
 * Limpia localStorage y recarga la página
 */
function cerrarSesion() {
    localStorage.removeItem('usuario_actual');
    location.reload();
}

// ==========================================
// 6. VERIFICACIÓN DE PERMISOS
// ==========================================

/**
 * Verifica si el usuario actual tiene un permiso específico
 * 
 * USO: if (tienePermiso('crearPostDirecto')) { ... }
 * 
 * @param {string} permiso - Nombre del permiso a verificar
 * @returns {boolean} true si tiene el permiso
 */
function tienePermiso(permiso) {
    const usuario = obtenerUsuarioActual();
    const permisosDelRol = PERMISOS_POR_ROL[usuario.rol];
    return permisosDelRol && permisosDelRol[permiso] === true;
}

/**
 * Verifica si el usuario tiene un rol específico o superior
 * 
 * USO: if (tieneRolMinimo(ROLES.EDITOR)) { ... }
 * 
 * @param {string} rolMinimo - Rol mínimo requerido
 * @returns {boolean} true si cumple con el nivel
 */
function tieneRolMinimo(rolMinimo) {
    const usuario = obtenerUsuarioActual();
    const nivelUsuario = JERARQUIA_ROLES.indexOf(usuario.rol);
    const nivelRequerido = JERARQUIA_ROLES.indexOf(rolMinimo);
    return nivelUsuario >= nivelRequerido;
}

/**
 * Verifica si el usuario tiene un rol exacto
 * 
 * USO: if (esRolExacto(ROLES.SUB_EDITOR)) { ... }
 * 
 * @param {string} rol - Rol a verificar
 * @returns {boolean} true si es ese rol exacto
 */
function esRolExacto(rol) {
    const usuario = obtenerUsuarioActual();
    return usuario.rol === rol;
}

// ==========================================
// 7. CONTROL DE INTERFAZ
// ==========================================

/**
 * Muestra/oculta elementos según permisos del usuario
 * ⚠️ SE EJECUTA:
 * - Al cargar la página
 * - Después del login
 * - Cuando cambia el rol del usuario
 */
function aplicarControlDeAcceso() {
    const usuario = obtenerUsuarioActual();
    
    console.log('🔒 Aplicando control de acceso para:', usuario.nombre, `(${usuario.rol})`);
    
    // ==========================================
    // ÁREA DE ADMINISTRACIÓN (crear posts)
    // ==========================================
    const adminArea = document.getElementById('admin-area');
    if (adminArea) {
        if (tienePermiso('crearPostDirecto') || tienePermiso('crearPostPendiente')) {
            adminArea.classList.remove('oculto');
        } else {
            adminArea.classList.add('oculto');
        }
    }
    
    // ==========================================
    // BOTONES DE COMENTARIOS
    // ==========================================
    const botonesComentario = document.querySelectorAll('.btn-comentar');
    botonesComentario.forEach(btn => {
        if (tienePermiso('comentar')) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    });
    
    // ==========================================
    // BOTONES DE EDICIÓN
    // Muestra solo si puede editar posts de otros
    // ==========================================
    const botonesEditar = document.querySelectorAll('.btn-editar, .btn-editar-mini');
    botonesEditar.forEach(btn => {
        if (tienePermiso('editarCualquierPost')) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    });
    
    // ==========================================
    // BOTONES DE ELIMINACIÓN
    // Muestra solo si puede eliminar posts de otros
    // ==========================================
    const botonesEliminar = document.querySelectorAll('.btn-eliminar, .btn-borrar-mini');
    botonesEliminar.forEach(btn => {
        if (tienePermiso('eliminarCualquierPost')) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
    });

    // ==========================================
    // BOTÓN FLOTANTE ADMIN
    // Solo para ADMIN (control total)
    // ==========================================
    const btnAdminFlotante = document.getElementById('btn-abrir-admin-panel');
    if (btnAdminFlotante) {
        if (esRolExacto(ROLES.ADMIN)) {
            btnAdminFlotante.classList.remove('oculto');
        } else {
            btnAdminFlotante.classList.add('oculto');
        }
    }

    // ==========================================
    // PANEL DE ADMINISTRACIÓN
    // Solo para roles con permisos administrativos
    // ==========================================
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        const rolesConAccesoPanel = ['admin', 'sub-admin', 'editor', 'sub-editor'];
        
        if (rolesConAccesoPanel.includes(usuario.rol)) {
            adminPanel.classList.remove('oculto');
            console.log(`✅ Panel de administración visible para: ${usuario.rol}`);
        } else {
            adminPanel.classList.add('oculto');
            console.log(`⛔ Panel de administración oculto para: ${usuario.rol}`);
        }
    }
    
    // Actualizar header con información del usuario
    actualizarHeaderUsuario();
}



/**
 * Actualiza el header con información del usuario actual
 * Muestra menú diferente según si está logueado o no
 */
function actualizarHeaderUsuario() {
    const usuario = obtenerUsuarioActual();
    const menuUsuario = document.querySelector('.menu ul');
    
    if (!menuUsuario) return;
    
    // Limpiar menú actual
    menuUsuario.innerHTML = '';
    
    if (usuario.rol === ROLES.VISITANTE) {
        // ==========================================
        // MENÚ PARA VISITANTES
        // ==========================================
        menuUsuario.innerHTML = `
            <li><a href="#" id="join-now">Join now</a></li>
            <li><a href="#" id="log-in">Log in</a></li>
        `;
    } else {
        // ==========================================
        // MENÚ PARA USUARIOS LOGUEADOS
        // ==========================================
        menuUsuario.innerHTML = `
            <li><span class="usuario-nombre">👤 ${usuario.nombre}</span></li>
            <li><span class="usuario-rol">${usuario.rol}</span></li>
            ${tienePermiso('verEstadisticasPropias') ? '<li><a href="#" id="ver-stats">📊 Estadísticas</a></li>' : ''}
            ${tienePermiso('verMisSubEditores') ? '<li><a href="#" id="ver-sub-editores">👥 Mis Sub-Editores</a></li>' : ''}
            ${tienePermiso('verPostsPendientesAsignados') ? '<li><a href="#" id="ver-pendientes">⏸️ Posts Pendientes</a></li>' : ''}
            <li><a href="#" id="cerrar-sesion">🚪 Cerrar sesión</a></li>
        `;
        
        // ==========================================
        // EVENT LISTENERS DEL MENÚ
        // ==========================================
        
        // Cerrar sesión
        const btnCerrarSesion = document.getElementById('cerrar-sesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('¿Seguro que deseas cerrar sesión?')) {
                    cerrarSesion();
                }
            });
        }
        
        // Ver estadísticas
        const btnStats = document.getElementById('ver-stats');
        if (btnStats && typeof mostrarPanelEstadisticas === 'function') {
            btnStats.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarPanelEstadisticas();
            });
        }

        // Ver sub-editores asignados
        const btnSubEditores = document.getElementById('ver-sub-editores');
        if (btnSubEditores && typeof mostrarPanelSubEditores === 'function') {
            btnSubEditores.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarPanelSubEditores();
            });
        }

        // Ver posts pendientes
        const btnPendientes = document.getElementById('ver-pendientes');
        if (btnPendientes && typeof mostrarPostsPendientes === 'function') {
            btnPendientes.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarPostsPendientes();
            });
        }
    }
}

// ==========================================
// 8. PANEL DE DESARROLLO
// ==========================================

/**
 * Panel de ayuda para desarrollo
 * Muestra en consola cómo cambiar de rol fácilmente
 */
function mostrarPanelDesarrollo() {
    if (!DESARROLLO) return;
    
    const usuario = obtenerUsuarioActual();
    
    console.log(`
    ===================================
    🔐 SISTEMA DE ROLES - PANEL DE DESARROLLO
    ===================================
    Usuario actual: ${usuario.nombre}
    Rol actual: ${usuario.rol}
    
    COMANDOS DISPONIBLES:
    
    → Cambiar de rol:
      cambiarRol('${ROLES.VISITANTE}')
      cambiarRol('${ROLES.USUARIO}')
      cambiarRol('${ROLES.SUB_EDITOR}')
      cambiarRol('${ROLES.EDITOR}')
      cambiarRol('${ROLES.SUB_ADMIN}')
      cambiarRol('${ROLES.ADMIN}')
    
    → Login rápido:
      loginRapido('visitante')
      loginRapido('usuario')
      loginRapido('subeditor')
      loginRapido('editor')
      loginRapido('subadmin')
      loginRapido('admin')
    
    → Ver permisos del rol actual:
      verMisPermisos()
    
    → Ver todos los permisos disponibles:
      verTodosLosPermisos()
    ===================================
    `);
}

/**
 * FUNCIÓN DE DESARROLLO: Cambiar de rol rápidamente
 * @param {string} nuevoRol - Rol al que cambiar
 */
window.cambiarRol = function(nuevoRol) {
    if (!Object.values(ROLES).includes(nuevoRol)) {
        console.error('❌ Rol no válido. Usa uno de:', Object.values(ROLES));
        return;
    }
    const usuario = obtenerUsuarioActual();
    usuario.rol = nuevoRol;
    establecerUsuarioActual(usuario);
    location.reload();
}

/**
 * FUNCIÓN DE DESARROLLO: Login rápido con roles predefinidos
 * @param {string} tipo - Tipo de usuario (visitante, usuario, editor, etc.)
 */
window.loginRapido = function(tipo) {
    const usuarios = {
        visitante: { id: null, nombre: 'Visitante', rol: ROLES.VISITANTE, email: null },
        usuario: { id: 1, nombre: 'Juan Usuario', rol: ROLES.USUARIO, email: 'juan@test.com' },
        subeditor: { id: 2, nombre: 'Ana SubEditor', rol: ROLES.SUB_EDITOR, email: 'ana@test.com' },
        editor: { id: 3, nombre: 'Carlos Editor', rol: ROLES.EDITOR, email: 'carlos@test.com' },
        subadmin: { id: 4, nombre: 'María SubAdmin', rol: ROLES.SUB_ADMIN, email: 'maria@test.com' },
        admin: { id: 5, nombre: 'Admin Master', rol: ROLES.ADMIN, email: 'admin@test.com' }
    };
    
    if (usuarios[tipo]) {
        establecerUsuarioActual(usuarios[tipo]);
        location.reload();
    } else {
        console.error('❌ Tipo no válido. Usa: visitante, usuario, subeditor, editor, subadmin, admin');
    }
}

/**
 * FUNCIÓN DE DESARROLLO: Ver permisos del usuario actual
 */
window.verMisPermisos = function() {
    const usuario = obtenerUsuarioActual();
    const permisos = PERMISOS_POR_ROL[usuario.rol];
    console.log(`📋 Permisos de ${usuario.nombre} (${usuario.rol}):`);
    console.table(permisos);
}

/**
 * FUNCIÓN DE DESARROLLO: Ver todos los permisos disponibles en el sistema
 */
window.verTodosLosPermisos = function() {
    console.log('📋 TODOS LOS PERMISOS DEL SISTEMA:');
    Object.keys(ROLES).forEach(rol => {
        console.log(`\n${rol}:`);
        console.table(PERMISOS_POR_ROL[ROLES[rol]]);
    });
}

// ==========================================
// 9. EXPORTAR FUNCIONES GLOBALES
// ==========================================
// 💡 Estas funciones estarán disponibles en toda la app

window.tienePermiso = tienePermiso;
window.tieneRolMinimo = tieneRolMinimo;
window.esRolExacto = esRolExacto;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.establecerUsuarioActual = establecerUsuarioActual;
window.cerrarSesion = cerrarSesion;
window.aplicarControlDeAcceso = aplicarControlDeAcceso;
window.actualizarHeaderUsuario = actualizarHeaderUsuario;
window.ROLES = ROLES;