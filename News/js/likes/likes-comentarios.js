// Sistema de Likes con Métricas
const SistemaLikes = {
    // Estructura de datos para likes
    // {
    //   comentarioId: {
    //     usuarios: [userId1, userId2...],
    //     total: 2
    //   }
    // }
    
    // Dar/quitar like (toggle)
    toggleLike(comentarioId, userId) {
        const likes = this.obtenerLikes();
        
        if (!likes[comentarioId]) {
            likes[comentarioId] = {
                usuarios: [],
                total: 0
            };
        }
        
        const yaLikeado = likes[comentarioId].usuarios.includes(userId);
        
        if (yaLikeado) {
            // Quitar like
            likes[comentarioId].usuarios = likes[comentarioId].usuarios.filter(id => id !== userId);
            likes[comentarioId].total--;
        } else {
            // Agregar like
            likes[comentarioId].usuarios.push(userId);
            likes[comentarioId].total++;
        }
        
        this.guardarLikes(likes);
        this.actualizarMetricasUsuario(userId, !yaLikeado); // true si agregó, false si quitó
        
        // ✅ NUEVO: Actualizar métricas de la noticia
        // Necesitas obtener el noticiaId del comentario
        const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
        const comentario = comentarios.find(c => c.id === comentarioId);
        
        if (comentario && typeof SistemaMetricas !== 'undefined') {
            if (!yaLikeado) {
                SistemaMetricas.incrementarLikes(comentario.noticiaId);
            } else {
                SistemaMetricas.decrementarLikes(comentario.noticiaId);
            }
        }

        return {
            likeado: !yaLikeado,
            totalLikes: likes[comentarioId].total
        };
    },
    
    // Verificar si usuario ya dio like
    usuarioYaLikeo(comentarioId, userId) {
        const likes = this.obtenerLikes();
        return likes[comentarioId]?.usuarios.includes(userId) || false;
    },
    
    // Obtener total de likes de un comentario
    obtenerTotalLikes(comentarioId) {
        const likes = this.obtenerLikes();
        return likes[comentarioId]?.total || 0;
    },
    
    // ===== MÉTRICAS DE USUARIO =====
    
    actualizarMetricasUsuario(userId, sumar) {
        const metricas = this.obtenerMetricasUsuario(userId);
        const ahora = new Date();
        
        if (sumar) {
            metricas.total++;
            metricas.semanaActual++;
            metricas.mesActual++;
            metricas.ultimoLike = ahora.toISOString();
        } else {
            metricas.total = Math.max(0, metricas.total - 1);
            metricas.semanaActual = Math.max(0, metricas.semanaActual - 1);
            metricas.mesActual = Math.max(0, metricas.mesActual - 1);
        }
        
        this.guardarMetricasUsuario(userId, metricas);
    },
    
    obtenerMetricasUsuario(userId) {
        const metricas = JSON.parse(localStorage.getItem('metricas_likes') || '{}');
        
        if (!metricas[userId]) {
            metricas[userId] = {
                total: 0,
                semanaActual: 0,
                mesActual: 0,
                inicioSemana: this.obtenerInicioSemana(),
                inicioMes: this.obtenerInicioMes(),
                ultimoLike: null
            };
        }
        
        // Resetear contadores si cambió el periodo
        const inicioSemanaActual = this.obtenerInicioSemana();
        const inicioMesActual = this.obtenerInicioMes();
        
        if (metricas[userId].inicioSemana !== inicioSemanaActual) {
            metricas[userId].semanaActual = 0;
            metricas[userId].inicioSemana = inicioSemanaActual;
        }
        
        if (metricas[userId].inicioMes !== inicioMesActual) {
            metricas[userId].mesActual = 0;
            metricas[userId].inicioMes = inicioMesActual;
        }
        
        return metricas[userId];
    },
    
    // ===== UTILIDADES =====
    
    obtenerInicioSemana() {
        const ahora = new Date();
        const dia = ahora.getDay();
        const diff = ahora.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes
        return new Date(ahora.setDate(diff)).toISOString().split('T')[0];
    },
    
    obtenerInicioMes() {
        const ahora = new Date();
        return new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0];
    },
    
    // ===== STORAGE =====
    
    obtenerLikes() {
        return JSON.parse(localStorage.getItem('likes_comentarios') || '{}');
    },
    
    guardarLikes(likes) {
        localStorage.setItem('likes_comentarios', JSON.stringify(likes));
    },
    
    guardarMetricasUsuario(userId, metricas) {
        const todasMetricas = JSON.parse(localStorage.getItem('metricas_likes') || '{}');
        todasMetricas[userId] = metricas;
        localStorage.setItem('metricas_likes', JSON.stringify(todasMetricas));
    }
};

// Función global para usar en onclick
function darLike(noticiaId, comentarioId) {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('Debes iniciar sesión para dar like');
        return;
    }
    
    const resultado = SistemaLikes.toggleLike(comentarioId, usuario.id);
    
    // Actualizar UI
    const boton = event.target;
    const contador = document.getElementById(`likes-${comentarioId}`);
    
    if (resultado.likeado) {
        boton.classList.add('liked');
        boton.textContent = '❤️ Te gusta';
    } else {
        boton.classList.remove('liked');
        boton.textContent = '🤍 Like';
    }
    
    contador.textContent = resultado.totalLikes;
}