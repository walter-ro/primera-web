// Sistema de Notificaciones y Panel de Reportes
const SistemaNotificaciones = {
    
    // Crear notificación para el editor del post
    notificarEditor(noticiaId, comentarioId, reportadoPor, motivo) {
        const notificaciones = this.obtenerNotificaciones();
        
        // 🔧 MODIFICA AQUÍ: Obtén el editor que creó la noticia
        // Ejemplo de cómo podría ser:
        // const noticia = obtenerNoticiaPorId(noticiaId);
        // const editorId = noticia.autorId; // o noticia.creadoPor
        
        const editorId = this.obtenerEditorDeNoticia(noticiaId); // ⚠️ Implementar esta función
        
        if (!editorId) return;
        
        const nuevaNotificacion = {
            id: `notif_${Date.now()}`,
            tipo: 'reporte_comentario',
            para: editorId, // Solo para este editor
            noticiaId: noticiaId,
            comentarioId: comentarioId,
            reportadoPor: reportadoPor,
            motivo: motivo,
            estado: 'pendiente', // pendiente, visto, resuelto
            prioridad: 'normal', // normal, urgente (cambia a urgente después de 7 días)
            fechaCreacion: new Date().toISOString(),
            fechaLimite: this.calcularFechaLimite(7), // 7 días para que se ponga rojo
            visto: false,
            confirmado: false
        };
        
        notificaciones.push(nuevaNotificacion);
        this.guardarNotificaciones(notificaciones);
        
        return nuevaNotificacion;
    },
    
    // 🔧 IMPLEMENTA ESTA FUNCIÓN según tu estructura de datos
    obtenerEditorDeNoticia(noticiaId) {
        /*
        ⚠️ MODIFICA AQUÍ según cómo obtienes las noticias en tu sistema
        
        Ejemplo 1: Si tienes una función global
        const noticia = obtenerNoticiaPorId(noticiaId);
        return noticia ? noticia.autorId : null;
        
        Ejemplo 2: Si está en localStorage
        const noticias = JSON.parse(localStorage.getItem('noticias') || '[]');
        const noticia = noticias.find(n => n.id === noticiaId);
        return noticia ? noticia.autorId : null;
        */
        
        // PLACEHOLDER - REEMPLAZAR CON TU LÓGICA
        const noticias = JSON.parse(localStorage.getItem('noticias') || '[]');
        const noticia = noticias.find(n => n.id === noticiaId);
        return noticia ? noticia.autorId : null;
    },
    
    // Calcular fecha límite
    calcularFechaLimite(dias) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + dias);
        return fecha.toISOString();
    },
    
    // Verificar si ya pasó la semana (debe ponerse rojo)
    verificarPrioridad(notificacion) {
        if (notificacion.confirmado) return 'normal';
        
        const ahora = new Date();
        const limite = new Date(notificacion.fechaLimite);
        
        return ahora > limite ? 'urgente' : 'normal';
    },
    
    // Confirmar que se vio/leyó el reporte
    confirmarReporte(notificacionId) {
        const notificaciones = this.obtenerNotificaciones();
        const notif = notificaciones.find(n => n.id === notificacionId);
        
        if (notif) {
            notif.confirmado = true;
            notif.visto = true;
            notif.fechaConfirmacion = new Date().toISOString();
            notif.prioridad = 'normal'; // Ya no es urgente
            this.guardarNotificaciones(notificaciones);
        }
    },
    
    // Obtener notificaciones según el rol del usuario
    obtenerNotificacionesParaUsuario(usuarioId, rolUsuario) {
        const notificaciones = this.obtenerNotificaciones();
        
        // 🔧 MODIFICA AQUÍ los nombres exactos de los roles
        const rolesAdmin = ['admin', 'sub-admin']; // ⚠️ Ajusta según tus roles exactos
        // Ejemplos: ['administrador', 'subadministrador']
        //          ['ADMIN', 'SUB_ADMIN']
        
        // Admin y Sub-admin ven TODAS las notificaciones
        if (rolesAdmin.includes(rolUsuario)) {
            return notificaciones.map(n => ({
                ...n,
                prioridad: this.verificarPrioridad(n)
            }));
        }
        
        // Editor solo ve SUS notificaciones
        return notificaciones
            .filter(n => n.para === usuarioId)
            .map(n => ({
                ...n,
                prioridad: this.verificarPrioridad(n)
            }));
    },
    
    // Contar notificaciones pendientes
    contarPendientes(usuarioId, rolUsuario) {
        const notificaciones = this.obtenerNotificacionesParaUsuario(usuarioId, rolUsuario);
        return notificaciones.filter(n => !n.confirmado).length;
    },
    
    // Renderizar panel de notificaciones/reportes
    renderizarPanelReportes(usuarioId, rolUsuario) {
        const notificaciones = this.obtenerNotificacionesParaUsuario(usuarioId, rolUsuario);
        const pendientes = notificaciones.filter(n => !n.confirmado);
        const resueltos = notificaciones.filter(n => n.confirmado);
        
        // 🔧 MODIFICA AQUÍ los nombres de roles
        const rolesAdmin = ['admin', 'sub-admin'];
        const esAdmin = rolesAdmin.includes(rolUsuario);
        
        let html = `
            <div class="panel-reportes">
                <div class="header-reportes">
                    <h2>🚨 Reportes de Comentarios</h2>
                    <span class="badge-pendientes">${pendientes.length} pendientes</span>
                </div>
                
                <div class="tabs-reportes">
                    <button class="tab-btn active" onclick="SistemaNotificaciones.mostrarTab('pendientes')">
                        Pendientes (${pendientes.length})
                    </button>
                    <button class="tab-btn" onclick="SistemaNotificaciones.mostrarTab('resueltos')">
                        Resueltos (${resueltos.length})
                    </button>
                </div>
                
                <!-- PENDIENTES -->
                <div id="tab-pendientes" class="tab-contenido active">
                    ${pendientes.length === 0 ? 
                        '<p class="sin-reportes">✅ No hay reportes pendientes</p>' :
                        this.renderizarListaReportes(pendientes, esAdmin, true)
                    }
                </div>
                
                <!-- RESUELTOS -->
                <div id="tab-resueltos" class="tab-contenido">
                    ${resueltos.length === 0 ? 
                        '<p class="sin-reportes">No hay reportes resueltos</p>' :
                        this.renderizarListaReportes(resueltos, esAdmin, false)
                    }
                </div>
            </div>
        `;
        
        return html;
    },
    
    // Renderizar lista de reportes
    renderizarListaReportes(reportes, esAdmin, esPendiente) {
        let html = '<div class="lista-reportes">';
        
        reportes.forEach(r => {
            const claseUrgente = r.prioridad === 'urgente' ? 'reporte-urgente' : '';
            const diasPasados = this.calcularDiasPasados(r.fechaCreacion);
            
            html += `
                <div class="tarjeta-reporte ${claseUrgente}" data-reporte-id="${r.id}">
                    <div class="reporte-header">
                        <div class="reporte-info">
                            <span class="reporte-fecha">
                                ${new Date(r.fechaCreacion).toLocaleString('es-ES')}
                            </span>
                            ${r.prioridad === 'urgente' ? 
                                `<span class="badge-urgente">⚠️ Urgente (${diasPasados} días)</span>` : 
                                `<span class="badge-normal">${diasPasados} días</span>`
                            }
                            ${esAdmin ? `<span class="badge-editor">Editor: ${r.para}</span>` : ''}
                        </div>
                        
                        ${esPendiente ? `
                            <button onclick="SistemaNotificaciones.confirmarYCerrar('${r.id}')" 
                                    class="btn-confirmar">
                                ✓ Confirmar
                            </button>
                        ` : `
                            <span class="badge-resuelto">✓ Resuelto</span>
                        `}
                    </div>
                    
                    <div class="reporte-contenido">
                        <p><strong>Reportado por:</strong> ${r.reportadoPor}</p>
                        <p><strong>Motivo:</strong> ${r.motivo}</p>
                        <p><strong>Noticia ID:</strong> ${r.noticiaId}</p>
                        <p><strong>Comentario ID:</strong> ${r.comentarioId}</p>
                    </div>
                    
                    <div class="reporte-acciones">
                        <button onclick="verComentarioReportado(${r.noticiaId}, ${r.comentarioId})" 
                                class="btn-ver-comentario">
                            👁️ Ver comentario
                        </button>
                        ${esAdmin ? `
                            <button onclick="eliminarComentarioUI(${r.noticiaId}, ${r.comentarioId})" 
                                    class="btn-eliminar-comentario-reporte">
                                🗑️ Eliminar comentario
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    // Calcular días pasados
    calcularDiasPasados(fechaISO) {
        const ahora = new Date();
        const fecha = new Date(fechaISO);
        const diff = ahora - fecha;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
    
    // Confirmar y cerrar modal
    confirmarYCerrar(notificacionId) {
        this.confirmarReporte(notificacionId);
        this.actualizarPanelReportes();
    },
    
    // Actualizar panel sin recargar página
    actualizarPanelReportes() {
        const usuario = obtenerUsuarioActual();
        const contenedor = document.getElementById('contenedor-panel-reportes');
        
        if (contenedor && usuario) {
            contenedor.innerHTML = this.renderizarPanelReportes(usuario.id, usuario.rol);
        }
    },
    
    // Mostrar/ocultar tabs
    mostrarTab(tabNombre) {
        const tabs = document.querySelectorAll('.tab-contenido');
        const botones = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        botones.forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(`tab-${tabNombre}`).classList.add('active');
        event.target.classList.add('active');
    },
    
    // ===== STORAGE =====
    
    obtenerNotificaciones() {
        return JSON.parse(localStorage.getItem('notificaciones_reportes') || '[]');
    },
    
    guardarNotificaciones(notificaciones) {
        localStorage.setItem('notificaciones_reportes', JSON.stringify(notificaciones));
    }
};

// ===== FUNCIONES GLOBALES =====

function verComentarioReportado(noticiaId, comentarioId) {
    // 🔧 IMPLEMENTA AQUÍ: Navegar al comentario o mostrarlo en un modal
    alert(`Redirigiendo a noticia ${noticiaId}, comentario ${comentarioId}`);
    // Ejemplo: window.location.href = `#noticia-${noticiaId}-comentario-${comentarioId}`;
}

function abrirPanelReportes() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('Debes iniciar sesión');
        return;
    }
    
    // 🔧 MODIFICA AQUÍ: Roles que pueden ver el panel
    const rolesPermitidos = ['editor', 'sub-admin', 'admin']; // ⚠️ Ajustar
    
    if (!rolesPermitidos.includes(usuario.rol)) {
        alert('No tienes permisos para ver reportes');
        return;
    }
    
    const modal = `
        <div id="modal-panel-reportes" class="modal-panel-reportes">
            <div class="modal-panel-contenido">
                <span class="cerrar-modal-panel" onclick="cerrarPanelReportes()">&times;</span>
                <div id="contenedor-panel-reportes">
                    ${SistemaNotificaciones.renderizarPanelReportes(usuario.id, usuario.rol)}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarPanelReportes() {
    const modal = document.getElementById('modal-panel-reportes');
    if (modal) modal.remove();
}