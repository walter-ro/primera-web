// ==========================================
// SISTEMA DE NAVEGACIÓN DEL PANEL DE ADMIN
// ==========================================

const AdminNavegacion = {
    pantallaActual: 'resumen',
    
    // Inicializar panel
    inicializar() {
        this.mostrarPantalla('resumen');
    },
    
    // Cambiar de pantalla
    mostrarPantalla(pantalla) {
        this.pantallaActual = pantalla;
        const contenedor = document.getElementById('admin-panel-content');
        
        // Limpiar contenido anterior
        contenedor.innerHTML = '';
        
        // Renderizar nueva pantalla
        switch(pantalla) {
            case 'resumen':
                contenedor.innerHTML = this.renderizarResumen();
                break;
            case 'personal':
                contenedor.innerHTML = AdminPersonal.renderizarListado();
                break;
            case 'perfil':
                // Se llamará desde AdminPersonal.verPerfil(usuarioId)
                break;
            case 'noticias':
                contenedor.innerHTML = this.renderizarGestionNoticias();
                break;
            case 'estadisticas':
                contenedor.innerHTML = this.renderizarEstadisticasGlobales();
                break;
            case 'crear-editor':
                contenedor.innerHTML = this.renderizarCrearEditor();
                break;
            case 'crear-subadmin':
                contenedor.innerHTML = this.renderizarCrearSubAdmin();
                break;
            default:
                contenedor.innerHTML = '<p>Pantalla no encontrada</p>';
        }
    },
    
    // Volver atrás
    volverAtras() {
        this.mostrarPantalla('resumen');
    },
    
    // ==========================================
    // PANTALLA: RESUMEN HUMANO
    // ==========================================
    
    renderizarResumen() {
        const stats = this.calcularEstadisticasPersonal();
        
        return `
            <div class="admin-resumen">
                <div class="breadcrumb">
                    <span class="breadcrumb-actual">📊 Resumen General</span>
                </div>
                
                <h2>👥 Resumen del Personal</h2>
                <p class="descripcion-seccion">Visión general del equipo que opera el sistema</p>
                
                <div class="grid-resumen">
                    <div class="tarjeta-stat">
                        <div class="stat-icono">✍️</div>
                        <div class="stat-info">
                            <div class="stat-numero">${stats.totalEditores}</div>
                            <div class="stat-label">Editores</div>
                        </div>
                    </div>
                    
                    <div class="tarjeta-stat">
                        <div class="stat-icono">📝</div>
                        <div class="stat-info">
                            <div class="stat-numero">${stats.totalSubEditores}</div>
                            <div class="stat-label">Sub-Editores</div>
                        </div>
                    </div>
                    
                    <div class="tarjeta-stat">
                        <div class="stat-icono">⚙️</div>
                        <div class="stat-info">
                            <div class="stat-numero">${stats.totalSubAdmins}</div>
                            <div class="stat-label">Sub-Admins</div>
                        </div>
                    </div>
                    
                    <div class="tarjeta-stat">
                        <div class="stat-icono">✅</div>
                        <div class="stat-info">
                            <div class="stat-numero">${stats.activosEsteMes}</div>
                            <div class="stat-label">Activos este mes</div>
                        </div>
                    </div>
                    
                    <div class="tarjeta-stat ${stats.sancionesActivas > 0 ? 'stat-alerta' : ''}">
                        <div class="stat-icono">⚠️</div>
                        <div class="stat-info">
                            <div class="stat-numero">${stats.sancionesActivas}</div>
                            <div class="stat-label">Sanciones activas</div>
                        </div>
                    </div>
                    
                    <div class="tarjeta-stat">
                        <div class="stat-icono">👤</div>
                        <div class="stat-info">
                            <div class="stat-numero">${stats.totalUsuarios}</div>
                            <div class="stat-label">Usuarios registrados</div>
                        </div>
                    </div>
                </div>
                
                <div class="acciones-rapidas">
                    <h3>⚡ Acciones Rápidas</h3>
                    <div class="grid-acciones">
                        <button onclick="AdminNavegacion.mostrarPantalla('personal')" class="btn-accion-rapida">
                            <span class="icono">👥</span>
                            <span class="texto">Gestionar Personal</span>
                        </button>
                        
                        <button onclick="abrirPanelReportes()" class="btn-accion-rapida">
                            <span class="icono">🚨</span>
                            <span class="texto">Ver Reportes</span>
                            ${stats.reportesPendientes > 0 ? `<span class="badge-alerta">${stats.reportesPendientes}</span>` : ''}
                        </button>
                        
                        <button onclick="AdminNavegacion.mostrarPantalla('crear-editor')" class="btn-accion-rapida">
                            <span class="icono">➕</span>
                            <span class="texto">Crear Editor</span>
                        </button>
                        
                        <button onclick="abrirPanelMetricas()" class="btn-accion-rapida">
                            <span class="icono">📊</span>
                            <span class="texto">Ver Métricas</span>
                        </button>
                    </div>
                </div>
                
                ${stats.sancionesActivas > 0 ? `
                    <div class="alerta-sanciones">
                        <div class="alerta-icono">⚠️</div>
                        <div class="alerta-contenido">
                            <h4>Atención: Sanciones Activas</h4>
                            <p>Hay ${stats.sancionesActivas} sanción(es) vigente(s) que requieren seguimiento.</p>
                            <button onclick="AdminPersonal.filtrarPorSanciones()" class="btn-ver-sanciones">
                                Ver usuarios sancionados
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Calcular estadísticas del personal
    calcularEstadisticasPersonal() {
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        const sanciones = AdminAcciones.obtenerSancionesActivas();
        const reportes = typeof SistemaNotificaciones !== 'undefined' 
            ? SistemaNotificaciones.obtenerNotificaciones() 
            : [];
        
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        // 🔧 MODIFICA AQUÍ los nombres de roles según tu sistema
        const editores = usuarios.filter(u => u.rol === 'editor');
        const subEditores = usuarios.filter(u => u.rol === 'sub-editor');
        const subAdmins = usuarios.filter(u => u.rol === 'sub-admin');
        
        // Contar activos este mes
        const activosEsteMes = usuarios.filter(u => {
            const ultimaActividad = u.ultimaActividad ? new Date(u.ultimaActividad) : null;
            return ultimaActividad && ultimaActividad >= inicioMes;
        }).length;
        
        const reportesPendientes = reportes.filter(r => !r.confirmado).length;
        
        return {
            totalEditores: editores.length,
            totalSubEditores: subEditores.length,
            totalSubAdmins: subAdmins.length,
            totalUsuarios: usuarios.filter(u => u.rol === 'usuario').length,
            activosEsteMes: activosEsteMes,
            sancionesActivas: sanciones.length,
            reportesPendientes: reportesPendientes
        };
    },
    
    // ==========================================
    // PANTALLAS PENDIENTES (placeholder)
    // ==========================================
    
    renderizarGestionNoticias() {
        return `
            <div class="pantalla-construccion">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">📰 Gestión de Noticias</span>
                </div>
                
                <h2>📰 Gestión de Noticias</h2>
                <p class="mensaje-construccion">
                    Esta sección estará disponible en la siguiente fase del desarrollo.
                    <br><br>
                    Aquí podrás:
                    <ul>
                        <li>Ver todas las publicaciones</li>
                        <li>Aprobar/rechazar contenido pendiente</li>
                        <li>Editar publicaciones existentes</li>
                        <li>Eliminar contenido inapropiado</li>
                    </ul>
                </p>
                <button onclick="AdminNavegacion.volverAtras()" class="btn-volver">
                    ← Volver al resumen
                </button>
            </div>
        `;
    },
    
    renderizarEstadisticasGlobales() {
        return `
            <div class="pantalla-construccion">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">📊 Estadísticas Globales</span>
                </div>
                
                <h2>📊 Estadísticas Globales</h2>
                <p class="mensaje-construccion">
                    Esta sección estará disponible en la siguiente fase del desarrollo.
                    <br><br>
                    Aquí podrás ver:
                    <ul>
                        <li>Tendencias de publicaciones</li>
                        <li>Métricas de engagement</li>
                        <li>Análisis de contenido por categoría</li>
                        <li>Gráficas de actividad</li>
                    </ul>
                </p>
                <button onclick="AdminNavegacion.volverAtras()" class="btn-volver">
                    ← Volver al resumen
                </button>
            </div>
        `;
    },
    
    renderizarCrearEditor() {
        return `
            <div class="pantalla-crear-usuario">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">➕ Crear Editor</span>
                </div>
                
                <h2>➕ Crear Nuevo Editor</h2>
                <p class="descripcion-seccion">Crea una cuenta con permisos de editor</p>
                
                <form id="form-crear-editor" onsubmit="AdminPersonal.crearPersonal(event, 'editor')">
                    <div class="form-group">
                        <label for="nombre-editor">Nombre completo</label>
                        <input type="text" id="nombre-editor" name="nombre" required 
                               placeholder="Ej: Juan Pérez">
                    </div>
                    
                    <div class="form-group">
                        <label for="usuario-editor">Nombre de usuario</label>
                        <input type="text" id="usuario-editor" name="usuario" required 
                               placeholder="Ej: juan.perez" pattern="[a-zA-Z0-9._-]+">
                        <small>Solo letras, números, puntos, guiones y guiones bajos</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="email-editor">Email</label>
                        <input type="email" id="email-editor" name="email" required 
                               placeholder="juan@ejemplo.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="password-editor">Contraseña inicial</label>
                        <input type="password" id="password-editor" name="password" required 
                               minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="AdminNavegacion.volverAtras()" class="btn-cancelar">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-crear">
                            ✅ Crear Editor
                        </button>
                    </div>
                </form>
            </div>
        `;
    },
    
    renderizarCrearSubAdmin() {
        return `
            <div class="pantalla-crear-usuario">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">➕ Crear Sub-Admin</span>
                </div>
                
                <h2>➕ Crear Nuevo Sub-Admin</h2>
                <p class="descripcion-seccion">Crea una cuenta con permisos de sub-administrador</p>
                
                <div class="alerta-advertencia">
                    <div class="alerta-icono">⚠️</div>
                    <div class="alerta-texto">
                        <strong>Atención:</strong> Los Sub-Admins tienen permisos elevados. 
                        Solo crea esta cuenta si confías plenamente en esta persona.
                    </div>
                </div>
                
                <form id="form-crear-subadmin" onsubmit="AdminPersonal.crearPersonal(event, 'sub-admin')">
                    <div class="form-group">
                        <label for="nombre-subadmin">Nombre completo</label>
                        <input type="text" id="nombre-subadmin" name="nombre" required 
                               placeholder="Ej: María García">
                    </div>
                    
                    <div class="form-group">
                        <label for="usuario-subadmin">Nombre de usuario</label>
                        <input type="text" id="usuario-subadmin" name="usuario" required 
                               placeholder="Ej: maria.garcia" pattern="[a-zA-Z0-9._-]+">
                        <small>Solo letras, números, puntos, guiones y guiones bajos</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="email-subadmin">Email</label>
                        <input type="email" id="email-subadmin" name="email" required 
                               placeholder="maria@ejemplo.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="password-subadmin">Contraseña inicial</label>
                        <input type="password" id="password-subadmin" name="password" required 
                               minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="AdminNavegacion.volverAtras()" class="btn-cancelar">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-crear">
                            ✅ Crear Sub-Admin
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
};

// Funciones globales para compatibilidad con HTML
function mostrarGestionUsuarios() {
    AdminNavegacion.mostrarPantalla('personal');
}

function mostrarGestionNoticias() {
    AdminNavegacion.mostrarPantalla('noticias');
}

function mostrarPanelEstadisticas() {
    AdminNavegacion.mostrarPantalla('estadisticas');
}

function mostrarCrearEditor() {
    AdminNavegacion.mostrarPantalla('crear-editor');
}

function mostrarCrearSubAdmin() {
    AdminNavegacion.mostrarPantalla('crear-subadmin');
}

function cerrarPanelAdmin() {
    document.getElementById('admin-panel').classList.add('oculto');
}

function abrirPanelAdmin() {
    document.getElementById('admin-panel').classList.remove('oculto');
    AdminNavegacion.inicializar();
}