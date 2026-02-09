// ==========================================
// ACCIONES ADMINISTRATIVAS (Advertencias, Suspensiones, Cambios de Rol)
// ==========================================

const AdminAcciones = {
    
    // ==========================================
    // ADVERTENCIAS
    // ==========================================
    
    abrirModalAdvertencia(usuarioId) {
        const usuario = AdminPersonal.obtenerPersonalPorId(usuarioId);
        
        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }
        
        const modal = `
            <div id="modal-advertencia" class="modal-accion-admin">
                <div class="modal-accion-contenido">
                    <h3>⚠️ Advertir a ${usuario.nombre}</h3>
                    <p class="modal-descripcion">
                        Las advertencias quedan registradas en el historial del usuario.
                    </p>
                    
                    <form id="form-advertencia" onsubmit="AdminAcciones.enviarAdvertencia(event, '${usuarioId}')">
                        <div class="form-group">
                            <label>Motivo de la advertencia:</label>
                            <select name="motivo" required>
                                <option value="">Selecciona un motivo...</option>
                                <option value="contenido-inapropiado">Contenido inapropiado</option>
                                <option value="incumplimiento-normas">Incumplimiento de normas</option>
                                <option value="spam">Spam o contenido repetitivo</option>
                                <option value="falta-calidad">Falta de calidad editorial</option>
                                <option value="reportes-usuarios">Reportes de usuarios</option>
                                <option value="otro">Otro motivo</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Detalles adicionales:</label>
                            <textarea name="detalles" rows="4" 
                                      placeholder="Describe la situación que motivó esta advertencia..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" onclick="AdminAcciones.cerrarModal('modal-advertencia')" 
                                    class="btn-cancelar">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-confirmar-advertencia">
                                ⚠️ Enviar Advertencia
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    enviarAdvertencia(event, usuarioId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const motivo = formData.get('motivo');
        const detalles = formData.get('detalles');
        
        const adminActual = obtenerUsuarioActual();
        
        const advertencia = {
            id: `adv_${Date.now()}`,
            usuarioId: usuarioId,
            tipo: 'advertencia',
            motivo: motivo,
            detalles: detalles,
            fecha: new Date().toISOString(),
            adminId: adminActual.id,
            adminNombre: adminActual.nombre
        };
        
        // Guardar advertencia
        const advertencias = this.obtenerAdvertencias();
        advertencias.push(advertencia);
        this.guardarAdvertencias(advertencias);
        
        // Registrar en historial
        AdminHistorial.registrarAccion(
            usuarioId,
            'Advertencia emitida',
            `${motivo}${detalles ? ': ' + detalles : ''}`,
            adminActual.id
        );
        
        this.cerrarModal('modal-advertencia');
        alert('✅ Advertencia registrada correctamente');
        
        // Recargar perfil
        AdminPersonal.verPerfil(usuarioId);
    },
    
    contarAdvertencias(usuarioId) {
        const advertencias = this.obtenerAdvertencias();
        return advertencias.filter(a => a.usuarioId === usuarioId).length;
    },
    
    // ==========================================
    // SUSPENSIONES
    // ==========================================
    
    abrirModalSuspension(usuarioId) {
        const usuario = AdminPersonal.obtenerPersonalPorId(usuarioId);
        
        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }
        
        if (usuario.estado === 'suspendido') {
            alert('Este usuario ya está suspendido');
            return;
        }
        
        const modal = `
            <div id="modal-suspension" class="modal-accion-admin">
                <div class="modal-accion-contenido">
                    <h3>🚫 Suspender a ${usuario.nombre}</h3>
                    <p class="modal-descripcion modal-alerta">
                        <strong>⚠️ Atención:</strong> La suspensión impedirá al usuario acceder al sistema.
                    </p>
                    
                    <form id="form-suspension" onsubmit="AdminAcciones.aplicarSuspension(event, '${usuarioId}')">
                        <div class="form-group">
                            <label>Tipo de suspensión:</label>
                            <select name="tipo-suspension" id="tipo-suspension" 
                                    onchange="AdminAcciones.cambiarTipoSuspension(this.value)" required>
                                <option value="">Selecciona...</option>
                                <option value="temporal">Temporal</option>
                                <option value="permanente">Permanente</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="grupo-duracion" style="display: none;">
                            <label>Duración:</label>
                            <select name="duracion">
                                <option value="7">7 días</option>
                                <option value="15">15 días</option>
                                <option value="30">30 días</option>
                                <option value="60">60 días</option>
                                <option value="90">90 días</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Motivo de la suspensión:</label>
                            <select name="motivo" required>
                                <option value="">Selecciona un motivo...</option>
                                <option value="violacion-normas-grave">Violación grave de normas</option>
                                <option value="contenido-prohibido">Publicación de contenido prohibido</option>
                                <option value="acoso-usuarios">Acoso a otros usuarios</option>
                                <option value="multiples-advertencias">Múltiples advertencias previas</option>
                                <option value="fraude">Fraude o suplantación</option>
                                <option value="otro">Otro motivo</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Descripción detallada:</label>
                            <textarea name="descripcion" rows="4" required
                                      placeholder="Describe las razones de esta suspensión..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" onclick="AdminAcciones.cerrarModal('modal-suspension')" 
                                    class="btn-cancelar">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-confirmar-suspension">
                                🚫 Confirmar Suspensión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    cambiarTipoSuspension(tipo) {
        const grupoDuracion = document.getElementById('grupo-duracion');
        if (tipo === 'temporal') {
            grupoDuracion.style.display = 'block';
        } else {
            grupoDuracion.style.display = 'none';
        }
    },
    
    aplicarSuspension(event, usuarioId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const tipoSuspension = formData.get('tipo-suspension');
        const duracion = formData.get('duracion');
        const motivo = formData.get('motivo');
        const descripcion = formData.get('descripcion');
        
        const adminActual = obtenerUsuarioActual();
        
        const fechaInicio = new Date();
        let fechaFin = null;
        
        if (tipoSuspension === 'temporal' && duracion) {
            fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + parseInt(duracion));
        }
        
        const suspension = {
            id: `susp_${Date.now()}`,
            usuarioId: usuarioId,
            tipo: tipoSuspension,
            motivo: motivo,
            descripcion: descripcion,
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin ? fechaFin.toISOString() : null,
            adminId: adminActual.id,
            adminNombre: adminActual.nombre,
            activa: true
        };
        
        // Guardar suspensión
        const sanciones = this.obtenerSanciones();
        sanciones.push(suspension);
        this.guardarSanciones(sanciones);
        
        // Actualizar estado del usuario
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (usuario) {
            usuario.estado = 'suspendido';
            localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
        }
        
        // Registrar en historial
        AdminHistorial.registrarAccion(
            usuarioId,
            `Suspensión ${tipoSuspension}`,
            `${motivo}: ${descripcion}${fechaFin ? ` (hasta ${new Date(fechaFin).toLocaleDateString('es-ES')})` : ''}`,
            adminActual.id
        );
        
        this.cerrarModal('modal-suspension');
        alert(`✅ Usuario suspendido ${tipoSuspension === 'temporal' ? 'temporalmente' : 'permanentemente'}`);
        
        // Recargar perfil
        AdminPersonal.verPerfil(usuarioId);
    },
    
    levantarSuspension(usuarioId) {
        if (!confirm('¿Estás seguro de levantar la suspensión de este usuario?')) {
            return;
        }
        
        const adminActual = obtenerUsuarioActual();
        
        // Desactivar suspensiones
        const sanciones = this.obtenerSanciones();
        sanciones.forEach(s => {
            if (s.usuarioId === usuarioId && s.activa) {
                s.activa = false;
                s.fechaLevantamiento = new Date().toISOString();
                s.levantadaPor = adminActual.id;
            }
        });
        this.guardarSanciones(sanciones);
        
        // Actualizar estado del usuario
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        const usuario = usuarios.find(u => u.id === usuarioId);
        if (usuario) {
            usuario.estado = 'activo';
            localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
        }
        
        // Registrar en historial
        AdminHistorial.registrarAccion(
            usuarioId,
            'Suspensión levantada',
            'Usuario reactivado',
            adminActual.id
        );
        
        alert('✅ Suspensión levantada. El usuario puede volver a acceder al sistema.');
        
        // Recargar perfil
        AdminPersonal.verPerfil(usuarioId);
    },
    
    // ==========================================
    // CAMBIAR ROL
    // ==========================================
    
    abrirModalCambiarRol(usuarioId) {
        const usuario = AdminPersonal.obtenerPersonalPorId(usuarioId);
        
        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }
        
        const modal = `
            <div id="modal-cambiar-rol" class="modal-accion-admin">
                <div class="modal-accion-contenido">
                    <h3>🔄 Cambiar Rol de ${usuario.nombre}</h3>
                    <p class="modal-descripcion">
                        Rol actual: <strong>${usuario.rol}</strong>
                    </p>
                    
                    <form id="form-cambiar-rol" onsubmit="AdminAcciones.cambiarRol(event, '${usuarioId}')">
                        <div class="form-group">
                            <label>Nuevo rol:</label>
                            <select name="nuevo-rol" required>
                                <option value="">Selecciona un rol...</option>
                                ${usuario.rol !== 'sub-editor' ? '<option value="sub-editor">Sub-Editor</option>' : ''}
                                ${usuario.rol !== 'editor' ? '<option value="editor">Editor</option>' : ''}
                                ${usuario.rol !== 'sub-admin' ? '<option value="sub-admin">Sub-Admin</option>' : ''}
                                ${usuario.rol !== 'usuario' ? '<option value="usuario">Usuario Regular</option>' : ''}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Motivo del cambio:</label>
                            <textarea name="motivo" rows="3" required
                                      placeholder="¿Por qué se cambia el rol de este usuario?"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" onclick="AdminAcciones.cerrarModal('modal-cambiar-rol')" 
                                    class="btn-cancelar">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-confirmar-cambio-rol">
                                🔄 Cambiar Rol
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    },
    
    cambiarRol(event, usuarioId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const nuevoRol = formData.get('nuevo-rol');
        const motivo = formData.get('motivo');
        
        const adminActual = obtenerUsuarioActual();
        
        // Actualizar rol del usuario
        const usuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
        const usuario = usuarios.find(u => u.id === usuarioId);
        
        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }
        
        const rolAnterior = usuario.rol;
        usuario.rol = nuevoRol;
        localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
        
        // Registrar en historial
        AdminHistorial.registrarAccion(
            usuarioId,
            'Cambio de rol',
            `De "${rolAnterior}" a "${nuevoRol}". Motivo: ${motivo}`,
            adminActual.id
        );
        
        this.cerrarModal('modal-cambiar-rol');
        alert(`✅ Rol cambiado exitosamente a: ${nuevoRol}`);
        
        // Recargar perfil
        AdminPersonal.verPerfil(usuarioId);
    },
    
    // ==========================================
    // UTILIDADES
    // ==========================================
    
    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    },
    
    obtenerSancionesPorUsuario(usuarioId) {
        const sanciones = this.obtenerSanciones();
        return sanciones.filter(s => s.usuarioId === usuarioId && s.activa);
    },
    
    obtenerSancionesActivas() {
        const sanciones = this.obtenerSanciones();
        return sanciones.filter(s => s.activa);
    },
    
    // ==========================================
    // STORAGE
    // ==========================================
    
    obtenerAdvertencias() {
        return JSON.parse(localStorage.getItem('db_advertencias') || '[]');
    },
    
    guardarAdvertencias(advertencias) {
        localStorage.setItem('db_advertencias', JSON.stringify(advertencias));
    },
    
    obtenerSanciones() {
        return JSON.parse(localStorage.getItem('db_sanciones') || '[]');
    },
    
    guardarSanciones(sanciones) {
        localStorage.setItem('db_sanciones', JSON.stringify(sanciones));
    }
};