// Sistema de Métricas Internas
const SistemaMetricas = {
    
    // Inicializar métricas para una noticia
    inicializarMetricas(noticiaId, autorId) {
        const metricas = this.obtenerTodasMetricas();
        
        if (!metricas[noticiaId]) {
            metricas[noticiaId] = {
                noticiaId: noticiaId,
                autorId: autorId,
                likes: 0,
                compartidos: 0,
                vistas: 0,
                comentarios: 0,
                historial: {
                    likesDetalle: [],
                    compartidosDetalle: [],
                    vistasDetalle: []
                },
                fechaCreacion: new Date().toISOString()
            };
            
            this.guardarMetricas(metricas);
        }
    },
    
    // Incrementar likes
    incrementarLikes(noticiaId) {
        const metricas = this.obtenerTodasMetricas();
        
        if (metricas[noticiaId]) {
            metricas[noticiaId].likes++;
            metricas[noticiaId].historial.likesDetalle.push({
                fecha: new Date().toISOString(),
                timestamp: Date.now()
            });
            this.guardarMetricas(metricas);
        }
    },
    
    // Decrementar likes
    decrementarLikes(noticiaId) {
        const metricas = this.obtenerTodasMetricas();
        
        if (metricas[noticiaId] && metricas[noticiaId].likes > 0) {
            metricas[noticiaId].likes--;
            this.guardarMetricas(metricas);
        }
    },
    
    // Incrementar compartidos
    incrementarCompartidos(noticiaId) {
        const metricas = this.obtenerTodasMetricas();
        
        if (metricas[noticiaId]) {
            metricas[noticiaId].compartidos++;
            metricas[noticiaId].historial.compartidosDetalle.push({
                fecha: new Date().toISOString(),
                timestamp: Date.now()
            });
            this.guardarMetricas(metricas);
        }
    },
    
    // Incrementar vistas
    incrementarVistas(noticiaId) {
        const metricas = this.obtenerTodasMetricas();
        
        if (metricas[noticiaId]) {
            metricas[noticiaId].vistas++;
            metricas[noticiaId].historial.vistasDetalle.push({
                fecha: new Date().toISOString(),
                timestamp: Date.now()
            });
            this.guardarMetricas(metricas);
        }
    },
    
    // Incrementar comentarios
    incrementarComentarios(noticiaId) {
        const metricas = this.obtenerTodasMetricas();
        
        if (metricas[noticiaId]) {
            metricas[noticiaId].comentarios++;
            this.guardarMetricas(metricas);
        }
    },
    
    // Obtener métricas de una noticia
    obtenerMetricasNoticia(noticiaId) {
        const metricas = this.obtenerTodasMetricas();
        return metricas[noticiaId] || null;
    },
    
    // Calcular métricas por periodo
    calcularMetricasPorPeriodo(noticiaId, periodo) {
        const metrica = this.obtenerMetricasNoticia(noticiaId);
        if (!metrica) return { likes: 0, compartidos: 0, vistas: 0 };
        
        const ahora = Date.now();
        let limiteInicio;
        
        switch(periodo) {
            case 'semana':
                limiteInicio = ahora - (7 * 24 * 60 * 60 * 1000);
                break;
            case 'mes':
                limiteInicio = ahora - (30 * 24 * 60 * 60 * 1000);
                break;
            case 'semestre':
                limiteInicio = ahora - (180 * 24 * 60 * 60 * 1000);
                break;
            case 'anio':
                limiteInicio = ahora - (365 * 24 * 60 * 60 * 1000);
                break;
            default:
                return { likes: metrica.likes, compartidos: metrica.compartidos, vistas: metrica.vistas };
        }
        
        const likesperiodo = metrica.historial.likesDetalle.filter(l => l.timestamp >= limiteInicio).length;
        const compartidosPeriodo = metrica.historial.compartidosDetalle.filter(c => c.timestamp >= limiteInicio).length;
        const vistasPeriodo = metrica.historial.vistasDetalle.filter(v => v.timestamp >= limiteInicio).length;
        
        return {
            likes: likesPeriodo,
            compartidos: compartidosPeriodo,
            vistas: vistasPeriodo
        };
    },
    
    // Obtener métricas según rol y usuario
    obtenerMetricasParaUsuario(usuarioId, rolUsuario) {
        const todasMetricas = this.obtenerTodasMetricas();
        
        // 🔧 MODIFICA AQUÍ los nombres exactos de los roles
        const rolesAdmin = ['admin', 'sub-admin']; // ⚠️ Ajustar según tus roles
        
        if (rolesAdmin.includes(rolUsuario)) {
            // Admin y Sub-admin ven TODAS las métricas
            return Object.values(todasMetricas);
        } else {
            // Editor solo ve SUS métricas
            return Object.values(todasMetricas).filter(m => m.autorId === usuarioId);
        }
    },
    
    // Renderizar panel de métricas
    renderizarPanelMetricas(usuarioId, rolUsuario) {
        const metricas = this.obtenerMetricasParaUsuario(usuarioId, rolUsuario);
        const rolesAdmin = ['admin', 'sub-admin'];
        const esAdmin = rolesAdmin.includes(rolUsuario);
        
        if (metricas.length === 0) {
            return '<p class="sin-metricas">📊 No hay métricas disponibles</p>';
        }
        
        let html = `
            <div class="panel-metricas">
                <div class="header-metricas">
                    <h2>📊 Métricas de Publicaciones</h2>
                    <div class="filtro-periodo">
                        <select id="periodo-metricas" onchange="actualizarPeriodoMetricas()">
                            <option value="total">Total</option>
                            <option value="semana">Última semana</option>
                            <option value="mes">Último mes</option>
                            <option value="semestre">Último semestre</option>
                            <option value="anio">Último año</option>
                        </select>
                    </div>
                </div>
                
                <div id="contenedor-tarjetas-metricas">
                    ${this.renderizarTarjetasMetricas(metricas, 'total', esAdmin)}
                </div>
            </div>
        `;
        
        return html;
    },
    
    // Renderizar tarjetas de métricas
    renderizarTarjetasMetricas(metricas, periodo, esAdmin) {
        let html = '<div class="grid-metricas">';
        
        metricas.forEach(m => {
            const noticias = JSON.parse(localStorage.getItem('db_noticias') || '[]');
            const noticia = noticias.find(n => n.id === m.noticiaId);
            
            if (!noticia) return;
            
            const metricasPeriodo = periodo === 'total' 
                ? { likes: m.likes, compartidos: m.compartidos, vistas: m.vistas }
                : this.calcularMetricasPorPeriodo(m.noticiaId, periodo);
            
            html += `
                <div class="tarjeta-metrica">
                    <h4>${noticia.titulo}</h4>
                    ${esAdmin ? `<p class="autor-metrica">👤 ${noticia.autor}</p>` : ''}
                    
                    <div class="estadisticas">
                        <div class="stat">
                            <span class="stat-icono">❤️</span>
                            <span class="stat-numero">${metricasPeriodo.likes}</span>
                            <span class="stat-label">Likes</span>
                        </div>
                        
                        <div class="stat">
                            <span class="stat-icono">🔗</span>
                            <span class="stat-numero">${metricasPeriodo.compartidos}</span>
                            <span class="stat-label">Compartidos</span>
                        </div>
                        
                        <div class="stat">
                            <span class="stat-icono">👁️</span>
                            <span class="stat-numero">${metricasPeriodo.vistas}</span>
                            <span class="stat-label">Vistas</span>
                        </div>
                        
                        <div class="stat">
                            <span class="stat-icono">💬</span>
                            <span class="stat-numero">${m.comentarios}</span>
                            <span class="stat-label">Comentarios</span>
                        </div>
                    </div>
                    
                    <div class="fecha-publicacion">
                        📅 ${new Date(m.fechaCreacion).toLocaleDateString('es-ES')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    // Storage
    obtenerTodasMetricas() {
        return JSON.parse(localStorage.getItem('db_metricas') || '{}');
    },
    
    guardarMetricas(metricas) {
        localStorage.setItem('db_metricas', JSON.stringify(metricas));
    }
};

// Funciones globales
function abrirPanelMetricas() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('Debes iniciar sesión');
        return;
    }
    
    // 🔧 MODIFICA AQUÍ: Roles que pueden ver métricas
    const rolesPermitidos = ['editor', 'sub-admin', 'admin']; // ⚠️ Ajustar
    
    if (!rolesPermitidos.includes(usuario.rol)) {
        alert('No tienes permisos para ver métricas');
        return;
    }
    
    const modal = `
        <div id="modal-metricas" class="modal-metricas">
            <div class="modal-metricas-contenido">
                <span class="cerrar-modal" onclick="cerrarPanelMetricas()">&times;</span>
                <div id="contenedor-panel-metricas">
                    ${SistemaMetricas.renderizarPanelMetricas(usuario.id, usuario.rol)}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarPanelMetricas() {
    const modal = document.getElementById('modal-metricas');
    if (modal) modal.remove();
}

function actualizarPeriodoMetricas() {
    const periodo = document.getElementById('periodo-metricas').value;
    const usuario = obtenerUsuarioActual();
    const metricas = SistemaMetricas.obtenerMetricasParaUsuario(usuario.id, usuario.rol);
    const rolesAdmin = ['admin', 'sub-admin'];
    const esAdmin = rolesAdmin.includes(usuario.rol);
    
    document.getElementById('contenedor-tarjetas-metricas').innerHTML = 
        SistemaMetricas.renderizarTarjetasMetricas(metricas, periodo, esAdmin);
}