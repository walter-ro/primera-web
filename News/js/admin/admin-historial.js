// ==========================================
// HISTORIAL DE ACCIONES ADMINISTRATIVAS (Auditoría)
// ==========================================

const AdminHistorial = {
    
    // Registrar una acción administrativa
    registrarAccion(usuarioAfectadoId, tipoAccion, descripcion, adminId) {
        const historial = this.obtenerHistorial();
        
        const adminActual = adminId ? this.obtenerNombreAdmin(adminId) : 'Sistema';
        
        const accion = {
            id: `hist_${Date.now()}`,
            usuarioAfectadoId: usuarioAfectadoId,
            tipoAccion: tipoAccion,
            descripcion: descripcion,
            adminId: adminId,
            adminNombre: adminActual,
            fecha: new Date().toISOString()
        };
        
        historial.unshift(accion); // Agregar al inicio
        this.guardarHistorial(historial);
        
        return accion;
    },
    
    // Obtener historial por usuario
    obtenerHistorialPorUsuario(usuarioId) {
        const historial = this.obtenerHistorial();
        return historial.filter(h => h.usuarioAfectadoId === usuarioId);
    },
    
    // Obtener historial completo (para admins)
    obtenerHistorialCompleto(limite = 50) {
        const historial = this.obtenerHistorial();
        return historial.slice(0, limite);
    },
    
    // Renderizar historial completo
    renderizarHistorialCompleto() {
        const historial = this.obtenerHistorialCompleto(100);
        
        return `
            <div class="historial-completo">
                <div class="breadcrumb">
                    <a onclick="AdminNavegacion.volverAtras()">📊 Resumen</a>
                    <span class="separador">›</span>
                    <span class="breadcrumb-actual">📜 Historial de Acciones</span>
                </div>
                
                <div class="historial-header">
                    <h2>📜 Historial de Acciones Administrativas</h2>
                    <button onclick="AdminNavegacion.volverAtras()" class="btn-volver-small">
                        ← Volver
                    </button>
                </div>
                
                <p class="descripcion-seccion">
                    Registro de todas las acciones administrativas realizadas en el sistema
                </p>
                
                <div class="filtros-historial">
                    <input type="text" id="buscar-historial" 
                           placeholder="Buscar por usuario o acción..." 
                           onkeyup="AdminHistorial.buscarEnHistorial(this.value)">
                    
                    <select id="filtro-tipo-accion" onchange="AdminHistorial.filtrarPorTipo(this.value)">
                        <option value="todos">Todas las acciones</option>
                        <option value="Cuenta creada">Cuentas creadas</option>
                        <option value="Advertencia emitida">Advertencias</option>
                        <option value="Suspensión">Suspensiones</option>
                        <option value="Cambio de rol">Cambios de rol</option>
                    </select>
                </div>
                
                <div class="timeline-historial-completo" id="lista-historial">
                    ${this.renderizarItemsHistorial(historial)}
                </div>
                
                ${historial.length === 0 ? `
                    <div class="sin-historial">
                        <p>📭 No hay acciones registradas en el historial</p>
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Renderizar items del historial
    renderizarItemsHistorial(historial) {
        return historial.map(h => {
            const usuario = AdminPersonal.obtenerPersonalPorId(h.usuarioAfectadoId);
            const nombreUsuario = usuario ? usuario.nombre : 'Usuario desconocido';
            
            const icono = this.obtenerIconoAccion(h.tipoAccion);
            const claseAccion = this.obtenerClaseAccion(h.tipoAccion);
            
            return `
                <div class="historial-item-completo ${claseAccion}">
                    <div class="historial-icono">${icono}</div>
                    <div class="historial-contenido">
                        <div class="historial-titulo">
                            <strong>${h.tipoAccion}</strong> → ${nombreUsuario}
                        </div>
                        <div class="historial-descripcion">${h.descripcion}</div>
                        <div class="historial-meta">
                            <span class="historial-admin">👤 ${h.adminNombre}</span>
                            <span class="historial-fecha">📅 ${this.formatearFechaCompleta(h.fecha)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Obtener icono según tipo de acción
    obtenerIconoAccion(tipo) {
        const iconos = {
            'Cuenta creada': '➕',
            'Advertencia emitida': '⚠️',
            'Suspensión temporal': '🚫',
            'Suspensión permanente': '⛔',
            'Suspensión levantada': '✅',
            'Cambio de rol': '🔄'
        };
        
        for (const key in iconos) {
            if (tipo.includes(key)) return iconos[key];
        }
        
        return '📌';
    },
    
    // Obtener clase CSS según tipo de acción
    obtenerClaseAccion(tipo) {
        if (tipo.includes('Suspensión') && !tipo.includes('levantada')) return 'accion-suspension';
        if (tipo.includes('Advertencia')) return 'accion-advertencia';
        if (tipo.includes('Cuenta creada')) return 'accion-creacion';
        if (tipo.includes('Cambio de rol')) return 'accion-cambio';
        if (tipo.includes('levantada')) return 'accion-positiva';
        return '';
    },
    
    // Buscar en historial
    buscarEnHistorial(termino) {
        const historial = this.obtenerHistorialCompleto(100);
        const terminoBusqueda = termino.toLowerCase();
        
        const resultados = historial.filter(h => {
            const usuario = AdminPersonal.obtenerPersonalPorId(h.usuarioAfectadoId);
            const nombreUsuario = usuario ? usuario.nombre.toLowerCase() : '';
            
            return nombreUsuario.includes(terminoBusqueda) ||
                   h.tipoAccion.toLowerCase().includes(terminoBusqueda) ||
                   h.descripcion.toLowerCase().includes(terminoBusqueda) ||
                   h.adminNombre.toLowerCase().includes(terminoBusqueda);
        });
        
        const lista = document.getElementById('lista-historial');
        if (lista) {
            lista.innerHTML = this.renderizarItemsHistorial(resultados);
        }
    },
    
    // Filtrar por tipo de acción
    filtrarPorTipo(tipo) {
        const historial = this.obtenerHistorialCompleto(100);
        
        const resultados = tipo === 'todos' 
            ? historial 
            : historial.filter(h => h.tipoAccion.includes(tipo));
        
        const lista = document.getElementById('lista-historial');
        if (lista) {
            lista.innerHTML = this.renderizarItemsHistorial(resultados);
        }
    },
    
    // ==========================================
    // UTILIDADES
    // ==========================================
    
    obtenerNombreAdmin(adminId) {
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        const admin = usuarios.find(u => u.id === adminId);
        return admin ? admin.nombre : 'Admin Desconocido';
    },
    
    formatearFechaCompleta(fechaISO) {
        if (!fechaISO) return 'Fecha desconocida';
        
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // ==========================================
    // STORAGE
    // ==========================================
    
    obtenerHistorial() {
        return JSON.parse(localStorage.getItem('db_historial_admin') || '[]');
    },
    
    guardarHistorial(historial) {
        localStorage.setItem('db_historial_admin', JSON.stringify(historial));
    }
};

// Función global para abrir historial
function mostrarHistorialCompleto() {
    const contenedor = document.getElementById('admin-panel-content');
    contenedor.innerHTML = AdminHistorial.renderizarHistorialCompleto();
}