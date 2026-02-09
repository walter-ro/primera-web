// Sistema de Reportes de Comentarios
const SistemaReportes = {
    
    // Reportar un comentario
    reportarComentario(noticiaId, comentarioId, motivo, reportadoPor) {
        const reportes = this.obtenerReportes();
        const reporteId = `reporte_${Date.now()}`;
        
        const nuevoReporte = {
            id: reporteId,
            noticiaId: noticiaId,
            comentarioId: comentarioId,
            motivo: motivo,
            reportadoPor: reportadoPor,
            fecha: new Date().toISOString(),
            estado: 'pendiente',
            fechaCreacion: new Date().toLocaleString('es-ES')
        };
        
        reportes.push(nuevoReporte);
        this.guardarReportes(reportes);
        
        // ✅ CAMBIADO: Ahora usa el sistema de notificaciones
        SistemaNotificaciones.notificarEditor(noticiaId, comentarioId, reportadoPor, motivo);
        
        return nuevoReporte;
    },
    
    // Notificar al editor
    notificarEditor(noticiaId, comentarioId, reportadoPor) {
        // AQUÍ DEBES AGREGAR LOS TIPOS DE USUARIO QUE RECIBIRÁN NOTIFICACIONES
        // Ejemplo de cómo obtener el editor del post:
        
        /* 
        ⚠️ CONFIGURACIÓN REQUERIDA:
        
        1. Obtén el usuario que creó la noticia:
           const noticia = obtenerNoticiaPorId(noticiaId);
           const editorId = noticia.creadoPor; // o noticia.autorId según tu estructura
        
        2. Define qué tipos de usuario reciben notificaciones:
           const usuariosNotificar = [
               'editor',      // El editor que subió el post
               'moderador',   // Los moderadores
               'admin'        // Los administradores
           ];
        
        3. Opcional - Si tienes un sistema de notificaciones:
           enviarNotificacion(editorId, {
               tipo: 'reporte_comentario',
               noticiaId: noticiaId,
               comentarioId: comentarioId,
               mensaje: `${reportadoPor} reportó un comentario en tu publicación`
           });
        */
        
        const notificaciones = this.obtenerNotificaciones();
        
        // 🔧 MODIFICA AQUÍ: Agrega la lógica para obtener el ID del editor
        // const editorId = obtenerEditorDeNoticia(noticiaId); 
        const editorId = "EDITOR_ID_AQUI"; // ⚠️ REEMPLAZAR
        
        notificaciones.push({
            id: `notif_${Date.now()}`,
            para: editorId, // 🔧 Aquí va el ID del editor
            tipo: 'reporte_comentario',
            noticiaId: noticiaId,
            comentarioId: comentarioId,
            mensaje: `Un usuario reportó un comentario en tu publicación`,
            leido: false,
            fecha: new Date().toISOString()
        });
        
        this.guardarNotificaciones(notificaciones);
        
        // 🔧 OPCIONAL: También notificar a moderadores y admins
        // this.notificarModeradoresYAdmins(noticiaId, comentarioId);
    },
    
    // 🔧 FUNCIÓN OPCIONAL: Notificar a moderadores y administradores
    notificarModeradoresYAdmins(noticiaId, comentarioId) {
        /*
        ⚠️ AGREGA AQUÍ LA LÓGICA PARA NOTIFICAR A:
        - Moderadores (rol: 'moderador')
        - Administradores (rol: 'admin' o 'administrador')
        
        Ejemplo:
        const usuarios = obtenerTodosUsuarios();
        const moderadoresYAdmins = usuarios.filter(u => 
            u.rol === 'moderador' || u.rol === 'admin'
        );
        
        moderadoresYAdmins.forEach(usuario => {
            // enviar notificación a cada uno
        });
        */
    },
    
    // Obtener reportes pendientes
    obtenerReportesPendientes() {
        const reportes = this.obtenerReportes();
        return reportes.filter(r => r.estado === 'pendiente');
    },
    
    // Marcar reporte como revisado
    marcarComoRevisado(reporteId) {
        const reportes = this.obtenerReportes();
        const reporte = reportes.find(r => r.id === reporteId);
        if (reporte) {
            reporte.estado = 'revisado';
            reporte.fechaRevision = new Date().toLocaleString('es-ES');
            this.guardarReportes(reportes);
        }
    },
    
    // ===== STORAGE =====
    
    obtenerReportes() {
        return JSON.parse(localStorage.getItem('reportes_comentarios') || '[]');
    },
    
    guardarReportes(reportes) {
        localStorage.setItem('reportes_comentarios', JSON.stringify(reportes));
    },
    
    obtenerNotificaciones() {
        return JSON.parse(localStorage.getItem('notificaciones_sistema') || '[]');
    },
    
    guardarNotificaciones(notificaciones) {
        localStorage.setItem('notificaciones_sistema', JSON.stringify(notificaciones));
    },

    obtenerReportes() {
        return JSON.parse(localStorage.getItem('reportes_comentarios') || '[]');
    },
    
    guardarReportes(reportes) {
        localStorage.setItem('reportes_comentarios', JSON.stringify(reportes));
    }
};

// ===== FUNCIONES GLOBALES PARA ONCLICK =====

function abrirModalReporte(noticiaId, comentarioId) {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('Debes iniciar sesión para reportar');
        return;
    }
    
    // Crear modal
    const modal = `
        <div id="modal-reporte" class="modal-reporte">
            <div class="modal-contenido">
                <span class="cerrar-modal" onclick="cerrarModalReporte()">&times;</span>
                <h3>🚨 Reportar Comentario</h3>
                <p>¿Por qué reportas este comentario?</p>
                
                <select id="motivo-reporte" class="select-motivo">
                    <option value="">Selecciona un motivo...</option>
                    <option value="spam">Spam o publicidad</option>
                    <option value="ofensivo">Contenido ofensivo</option>
                    <option value="acoso">Acoso o intimidación</option>
                    <option value="desinformacion">Desinformación</option>
                    <option value="otro">Otro motivo</option>
                </select>
                
                <textarea id="detalle-reporte" 
                          placeholder="Detalles adicionales (opcional)..." 
                          rows="3"></textarea>
                
                <div class="botones-modal">
                    <button onclick="cerrarModalReporte()" class="btn-cancelar">
                        Cancelar
                    </button>
                    <button onclick="enviarReporte(${noticiaId}, ${comentarioId})" 
                            class="btn-enviar-reporte">
                        Enviar Reporte
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarModalReporte() {
    const modal = document.getElementById('modal-reporte');
    if (modal) {
        modal.remove();
    }
}

function enviarReporte(noticiaId, comentarioId) {
    const motivo = document.getElementById('motivo-reporte').value;
    const detalle = document.getElementById('detalle-reporte').value;
    const usuario = obtenerUsuarioActual();
    
    if (!motivo) {
        alert('Por favor selecciona un motivo');
        return;
    }
    
    const motivoCompleto = detalle ? `${motivo} - ${detalle}` : motivo;
    
    SistemaReportes.reportarComentario(
        noticiaId, 
        comentarioId, 
        motivoCompleto, 
        usuario.nombre || usuario.id
    );
    
    cerrarModalReporte();
    alert('✅ Reporte enviado. Gracias por tu colaboración.');
}

// Actualizar contador de reportes pendientes
function actualizarContadorReportes() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return;
    
    const contador = SistemaNotificaciones.contarPendientes(usuario.id, usuario.rol);
    const badge = document.getElementById('contador-reportes-pendientes');
    
    if (badge) {
        badge.textContent = contador > 0 ? contador : '';
        badge.style.display = contador > 0 ? 'inline' : 'none';
    }
}

window.addEventListener('load', actualizarContadorReportes);