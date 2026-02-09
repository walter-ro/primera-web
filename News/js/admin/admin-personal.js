// ==========================================
// GESTIÓN DE PERSONAL (Editores, Sub-Editores, Sub-Admins)
// ==========================================

const AdminPersonal = {
    
    filtroActual: 'todos', // todos, editor, sub-editor, sub-admin
    estadoFiltro: 'todos', // todos, activo, suspendido
    
    // ==========================================
    // RENDERIZAR LISTADO DE PERSONAL
    // ==========================================
    
    renderizarListado() {
        const personal = this.obtenerPersonal();
        const personalFiltrado = this.aplicarFiltros(personal);
        
        return `
            <div class="admin-personal">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">👥 Gestión de Personal</span>
                </div>
                
                <div class="personal-header">
                    <h2>👥 Gestión de Personal</h2>
                    <button onclick="AdminNavegacion.volverAtras()" class="btn-volver-small">
                        ← Volver
                    </button>
                </div>
                
                <p class="descripcion-seccion">
                    Administra editores, sub-editores y sub-admins del sistema
                </p>
                
                <!-- Filtros -->
                <div class="filtros-personal">
                    <div class="filtro-grupo">
                        <label>Rol:</label>
                        <select id="filtro-rol" onchange="AdminPersonal.cambiarFiltro('rol', this.value)">
                            <option value="todos">Todos los roles</option>
                            <option value="editor">Editores</option>
                            <option value="sub-editor">Sub-Editores</option>
                            <option value="sub-admin">Sub-Admins</option>
                        </select>
                    </div>
                    
                    <div class="filtro-grupo">
                        <label>Estado:</label>
                        <select id="filtro-estado" onchange="AdminPersonal.cambiarFiltro('estado', this.value)">
                            <option value="todos">Todos</option>
                            <option value="activo">Activos</option>
                            <option value="suspendido">Suspendidos</option>
                        </select>
                    </div>
                    
                    <div class="filtro-grupo">
                        <label>Buscar:</label>
                        <input type="text" id="buscar-personal" 
                               placeholder="Nombre o usuario..." 
                               onkeyup="AdminPersonal.buscarPersonal(this.value)">
                    </div>
                </div>
                
                <!-- Listado -->
                <div class="tabla-personal">
                    <div class="tabla-header">
                        <div class="col-nombre">Nombre / Usuario</div>
                        <div class="col-rol">Rol</div>
                        <div class="col-estado">Estado</div>
                        <div class="col-fecha">Fecha Alta</div>
                        <div class="col-actividad">Última Actividad</div>
                        <div class="col-acciones">Acciones</div>
                    </div>
                    
                    <div class="tabla-body" id="lista-personal">
                        ${this.renderizarFilasPersonal(personalFiltrado)}
                    </div>
                </div>
                
                ${personalFiltrado.length === 0 ? `
                    <div class="sin-resultados">
                        <p>😕 No se encontraron resultados con los filtros aplicados</p>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Renderizar filas de personal
    renderizarFilasPersonal(personal) {
        if (personal.length === 0) return '';
        
        return personal.map(p => {
            const indicadores = this.obtenerIndicadores(p);
            const estadoBadge = p.estado === 'suspendido' 
                ? '<span class="badge badge-suspendido">Suspendido</span>'
                : '<span class="badge badge-activo">Activo</span>';
            
            const rolBadge = this.obtenerBadgeRol(p.rol);
            
            return `
                <div class="tabla-fila ${p.estado === 'suspendido' ? 'fila-suspendida' : ''}">
                    <div class="col-nombre">
                        <div class="usuario-info">
                            <div class="usuario-nombre">${p.nombre}</div>
                            <div class="usuario-username">@${p.usuario}</div>
                            ${indicadores.html}
                        </div>
                    </div>
                    <div class="col-rol">${rolBadge}</div>
                    <div class="col-estado">${estadoBadge}</div>
                    <div class="col-fecha">${this.formatearFecha(p.fechaAlta)}</div>
                    <div class="col-actividad">${this.formatearUltimaActividad(p.ultimaActividad)}</div>
                    <div class="col-acciones">
                        <button onclick="AdminPersonal.verPerfil('${p.id}')" 
                                class="btn-ver-perfil" title="Ver perfil completo">
                            👁️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Obtener badge de rol
    obtenerBadgeRol(rol) {
        const badges = {
            'editor': '<span class="badge badge-editor">✍️ Editor</span>',
            'sub-editor': '<span class="badge badge-subeditor">📝 Sub-Editor</span>',
            'sub-admin': '<span class="badge badge-subadmin">⚙️ Sub-Admin</span>'
        };
        return badges[rol] || '<span class="badge">Usuario</span>';
    },
    
    // Obtener indicadores visuales
    obtenerIndicadores(persona) {
        const indicadores = [];
        
        // ⚠️ OJO: AQUÍ VA UNIDO A LA FUNCIÓN DE MEDICIÓN DE ACTIVIDAD
        // Verificar si tiene sanciones
        const sanciones = AdminAcciones.obtenerSancionesPorUsuario(persona.id);
        if (sanciones.length > 0) {
            indicadores.push('<span class="indicador indicador-sancion" title="Tiene sanciones">⚠️</span>');
        }
        
        // Verificar actividad reciente
        const ultimaActividad = persona.ultimaActividad ? new Date(persona.ultimaActividad) : null;
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        if (!ultimaActividad || ultimaActividad < hace30Dias) {
            indicadores.push('<span class="indicador indicador-inactivo" title="Inactivo">💤</span>');
        }
        
        // ⚠️ OJO: AQUÍ VA UNIDO A LA FUNCIÓN DE MEDICIÓN DE REPORTES
        // Verificar reportes
        // const reportes = obtenerReportesPorUsuario(persona.id);
        // if (reportes.length > 3) {
        //     indicadores.push('<span class="indicador indicador-reportes" title="Múltiples reportes">🚨</span>');
        // }
        
        return {
            tiene: indicadores.length > 0,
            html: indicadores.length > 0 ? `<div class="indicadores">${indicadores.join('')}</div>` : ''
        };
    },
    
    // ==========================================
    // VER PERFIL COMPLETO
    // ==========================================
    
    verPerfil(usuarioId) {
        const usuario = this.obtenerPersonalPorId(usuarioId);
        
        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }
        
        const estadisticas = this.calcularEstadisticasUsuario(usuario);
        const sanciones = AdminAcciones.obtenerSancionesPorUsuario(usuarioId);
        const historial = AdminHistorial.obtenerHistorialPorUsuario(usuarioId);
        
        const contenedor = document.getElementById('admin-panel-content');
        contenedor.innerHTML = `
            <div class="perfil-admin">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <a onclick="AdminNavegacion.mostrarPantalla('personal')">👥 Personal</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">${usuario.nombre}</span>
                </div>
                
                <div class="perfil-header">
                    <div class="perfil-info-basica">
                        <h2>${usuario.nombre}</h2>
                        <p class="perfil-username">@${usuario.usuario}</p>
                        ${this.obtenerBadgeRol(usuario.rol)}
                        ${usuario.estado === 'suspendido' 
                            ? '<span class="badge badge-suspendido">Suspendido</span>' 
                            : '<span class="badge badge-activo">Activo</span>'}
                    </div>
                    <button onclick="AdminNavegacion.mostrarPantalla('personal')" class="btn-volver-small">
                        ← Volver al listado
                    </button>
                </div>
                
                <!-- Datos Base -->
                <div class="seccion-perfil">
                    <h3>📋 Datos Base</h3>
                    <div class="grid-datos">
                        <div class="dato">
                            <span class="dato-label">Rol actual:</span>
                            <span class="dato-valor">${usuario.rol}</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Fecha de alta:</span>
                            <span class="dato-valor">${this.formatearFecha(usuario.fechaAlta)}</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Estado:</span>
                            <span class="dato-valor">${usuario.estado || 'activo'}</span>
                        </div>
                        <div class="dato">
                            <span class="dato-label">Email:</span>
                            <span class="dato-valor">${usuario.email || 'No disponible'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Actividad Editorial -->
                <div class="seccion-perfil">
                    <h3>📝 Actividad Editorial</h3>
                    <p class="nota-importante">
                        ⚠️ <strong>OJO:</strong> Los siguientes datos se unirán con el sistema de métricas cuando esté implementado.
                    </p>
                    <div class="grid-estadisticas">
                        <div class="stat-card">
                            <div class="stat-numero">${estadisticas.publicacionesTotales}</div>
                            <div class="stat-label">Publicaciones totales</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-numero">${estadisticas.rangoPublicacion}</div>
                            <div class="stat-label">Rango de publicación</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-numero">${estadisticas.semanasActivas}</div>
                            <div class="stat-label">Semanas activas</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-numero">${estadisticas.vistasPromedio}</div>
                            <div class="stat-label">Vistas promedio</div>
                            <small class="stat-nota">⚠️ Pendiente de integración</small>
                        </div>
                    </div>
                </div>
                
                <!-- Comportamiento -->
                <div class="seccion-perfil">
                    <h3>⚠️ Comportamiento</h3>
                    <div class="grid-comportamiento">
                        <div class="comportamiento-item">
                            <span class="comportamiento-label">Reportes en publicaciones:</span>
                            <span class="comportamiento-valor">${estadisticas.reportesEnPublicaciones}</span>
                        </div>
                        <div class="comportamiento-item">
                            <span class="comportamiento-label">Reportes personales:</span>
                            <span class="comportamiento-valor">${estadisticas.reportesPersonales}</span>
                        </div>
                        <div class="comportamiento-item">
                            <span class="comportamiento-label">Advertencias:</span>
                            <span class="comportamiento-valor">${estadisticas.advertencias}</span>
                        </div>
                        <div class="comportamiento-item">
                            <span class="comportamiento-label">Sanciones:</span>
                            <span class="comportamiento-valor ${sanciones.length > 0 ? 'valor-alerta' : ''}">${sanciones.length}</span>
                        </div>
                    </div>
                    
                    ${sanciones.length > 0 ? `
                        <div class="lista-sanciones">
                            <h4>Sanciones Activas:</h4>
                            ${sanciones.map(s => `
                                <div class="sancion-item">
                                    <strong>${s.tipo}</strong> - ${s.motivo}
                                    <br>
                                    <small>Desde: ${this.formatearFecha(s.fechaInicio)} 
                                    ${s.fechaFin ? `hasta ${this.formatearFecha(s.fechaFin)}` : '(Permanente)'}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Indicadores Rápidos -->
                <div class="seccion-perfil">
                    <h3>🎯 Indicadores Rápidos</h3>
                    <div class="indicadores-rapidos">
                        ${this.generarIndicadoresRapidos(estadisticas)}
                    </div>
                </div>
                
                <!-- Acciones Administrativas -->
                <div class="seccion-perfil seccion-acciones">
                    <h3>⚙️ Acciones Administrativas</h3>
                    <div class="grid-acciones-admin">
                        <button onclick="AdminAcciones.abrirModalAdvertencia('${usuarioId}')" 
                                class="btn-accion btn-advertir">
                            ⚠️ Advertir
                        </button>
                        <button onclick="AdminAcciones.abrirModalSuspension('${usuarioId}')" 
                                class="btn-accion btn-suspender">
                            🚫 Suspender
                        </button>
                        <button onclick="AdminAcciones.abrirModalCambiarRol('${usuarioId}')" 
                                class="btn-accion btn-cambiar-rol">
                            🔄 Cambiar Rol
                        </button>
                        ${usuario.estado === 'suspendido' ? `
                            <button onclick="AdminAcciones.levantarSuspension('${usuarioId}')" 
                                    class="btn-accion btn-reactivar">
                                ✅ Reactivar
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Historial de Acciones -->
                ${historial.length > 0 ? `
                    <div class="seccion-perfil">
                        <h3>📜 Historial de Acciones Administrativas</h3>
                        <div class="timeline-historial">
                            ${historial.map(h => `
                                <div class="historial-item">
                                    <div class="historial-fecha">${this.formatearFecha(h.fecha)}</div>
                                    <div class="historial-accion">${h.accion}</div>
                                    <div class="historial-admin">Por: ${h.adminNombre}</div>
                                    ${h.motivo ? `<div class="historial-motivo">Motivo: ${h.motivo}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Calcular estadísticas del usuario
    calcularEstadisticasUsuario(usuario) {
        // ⚠️ OJO: AQUÍ VA UNIDO A LA FUNCIÓN DE MEDICIÓN COMPLETA
        const noticias = JSON.parse(localStorage.getItem('db_noticias') || '[]');
        const noticiasUsuario = noticias.filter(n => n.autorId === usuario.id);
        
        // Calcular semanas activas
        const fechasPublicacion = noticiasUsuario.map(n => new Date(n.fechaCreacion));
        const semanasUnicas = new Set(
            fechasPublicacion.map(f => this.obtenerNumeroSemana(f))
        );
        
        // Determinar rango de publicación
        let rangoPublicacion = 'Sin actividad';
        if (noticiasUsuario.length === 0) rangoPublicacion = 'Sin actividad';
        else if (noticiasUsuario.length < 5) rangoPublicacion = 'Bajo';
        else if (noticiasUsuario.length < 20) rangoPublicacion = 'Medio';
        else rangoPublicacion = 'Alto';
        
        return {
            publicacionesTotales: noticiasUsuario.length,
            rangoPublicacion: rangoPublicacion,
            semanasActivas: semanasUnicas.size,
            vistasPromedio: 'N/A', // ⚠️ Pendiente de integración con métricas
            reportesEnPublicaciones: 0, // ⚠️ Pendiente de integración
            reportesPersonales: 0, // ⚠️ Pendiente de integración
            advertencias: AdminAcciones.contarAdvertencias(usuario.id)
        };
    },
    
    // Generar indicadores rápidos
    generarIndicadoresRapidos(stats) {
        const indicadores = [];
        
        if (stats.publicacionesTotales > 50) {
            indicadores.push('<div class="indicador-positivo">✅ Usuario recurrente</div>');
        }
        
        if (stats.semanasActivas < 4 && stats.publicacionesTotales > 0) {
            indicadores.push('<div class="indicador-neutral">⚠️ Actividad irregular</div>');
        }
        
        if (stats.advertencias === 0 && stats.reportesPersonales === 0) {
            indicadores.push('<div class="indicador-positivo">✨ Historial limpio</div>');
        }
        
        if (stats.reportesEnPublicaciones > 5) {
            indicadores.push('<div class="indicador-negativo">🚨 Múltiples reportes</div>');
        }
        
        return indicadores.length > 0 
            ? indicadores.join('') 
            : '<div class="sin-indicadores">Sin indicadores destacables</div>';
    },
    
    // ==========================================
    // FILTROS Y BÚSQUEDA
    // ==========================================
    
    cambiarFiltro(tipo, valor) {
        if (tipo === 'rol') {
            this.filtroActual = valor;
        } else if (tipo === 'estado') {
            this.estadoFiltro = valor;
        }
        this.actualizarListado();
    },
    
    buscarPersonal(termino) {
        this.terminoBusqueda = termino.toLowerCase();
        this.actualizarListado();
    },
    
    aplicarFiltros(personal) {
        let resultado = personal;
        
        // Filtro por rol
        if (this.filtroActual !== 'todos') {
            resultado = resultado.filter(p => p.rol === this.filtroActual);
        }
        
        // Filtro por estado
        if (this.estadoFiltro !== 'todos') {
            resultado = resultado.filter(p => (p.estado || 'activo') === this.estadoFiltro);
        }
        
        // Búsqueda
        if (this.terminoBusqueda) {
            resultado = resultado.filter(p => 
                p.nombre.toLowerCase().includes(this.terminoBusqueda) ||
                p.usuario.toLowerCase().includes(this.terminoBusqueda)
            );
        }
        
        return resultado;
    },
    
    actualizarListado() {
        const personal = this.obtenerPersonal();
        const personalFiltrado = this.aplicarFiltros(personal);
        const listaContainer = document.getElementById('lista-personal');
        
        if (listaContainer) {
            listaContainer.innerHTML = this.renderizarFilasPersonal(personalFiltrado);
        }
    },
    
    filtrarPorSanciones() {
        const personal = this.obtenerPersonal();
        const conSanciones = personal.filter(p => {
            const sanciones = AdminAcciones.obtenerSancionesPorUsuario(p.id);
            return sanciones.length > 0;
        });
        
        AdminNavegacion.mostrarPantalla('personal');
        
        setTimeout(() => {
            const listaContainer = document.getElementById('lista-personal');
            if (listaContainer) {
                listaContainer.innerHTML = this.renderizarFilasPersonal(conSanciones);
            }
        }, 100);
    },
    
    // ==========================================
    // CREAR PERSONAL
    // ==========================================
    
    crearPersonal(event, rol) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const nombre = formData.get('nombre');
        const usuario = formData.get('usuario');
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Validar que el usuario no exista
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        const existe = usuarios.find(u => u.usuario === usuario || u.email === email);
        
        if (existe) {
            alert('❌ Ya existe un usuario con ese nombre de usuario o email');
            return;
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = {
            id: `user_${Date.now()}`,
            nombre: nombre,
            usuario: usuario,
            email: email,
            password: password, // ⚠️ En producción, hashear la contraseña
            rol: rol,
            estado: 'activo',
            fechaAlta: new Date().toISOString(),
            ultimaActividad: null
        };
        
        usuarios.push(nuevoUsuario);
        localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
        
        // Registrar en historial
        AdminHistorial.registrarAccion(
            nuevoUsuario.id,
            'Cuenta creada',
            `Rol asignado: ${rol}`,
            null
        );
        
        alert(`✅ ${rol === 'editor' ? 'Editor' : 'Sub-Admin'} creado exitosamente\n\nUsuario: ${usuario}\nContraseña: ${password}\n\n⚠️ Comunica estas credenciales de manera segura.`);
        
        // Volver al resumen
        AdminNavegacion.volverAtras();
    },
    
    // ==========================================
    // UTILIDADES
    // ==========================================
    
    obtenerPersonal() {
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        // 🔧 MODIFICA AQUÍ los roles según tu sistema
        return usuarios.filter(u => 
            u.rol === 'editor' || 
            u.rol === 'sub-editor' || 
            u.rol === 'sub-admin'
        );
    },
    
    obtenerPersonalPorId(id) {
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        return usuarios.find(u => u.id === id);
    },
    
    formatearFecha(fechaISO) {
        if (!fechaISO) return 'N/A';
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    formatearUltimaActividad(fechaISO) {
        if (!fechaISO) return 'Sin actividad';
        
        const ahora = new Date();
        const actividad = new Date(fechaISO);
        const diffMs = ahora - actividad;
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDias === 0) return 'Hoy';
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
        return this.formatearFecha(fechaISO);
    },
    
    obtenerNumeroSemana(fecha) {
        const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
};