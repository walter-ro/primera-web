// Sistema de Borradores
const SistemaBorradores = {
    
    // Guardar borrador
    guardarBorrador(titulo, categoria, subcategoria, bloques, autorId) {
        const borradores = this.obtenerBorradores();
        
        // Verificar si ya existe un borrador con el mismo título del mismo autor
        const borradorExistente = borradores.findIndex(
            b => b.titulo === titulo && b.autorId === autorId
        );
        
        const ahora = new Date();
        const borrador = {
            id: borradorExistente >= 0 ? borradores[borradorExistente].id : `borrador_${Date.now()}`,
            titulo: titulo || 'Sin título',
            categoria: categoria,
            subcategoria: subcategoria,
            bloques: bloques,
            autorId: autorId,
            fechaGuardado: ahora.toISOString(),
            fechaGuardadoLegible: ahora.toLocaleString('es-ES')
        };
        
        if (borradorExistente >= 0) {
            // Actualizar borrador existente
            borradores[borradorExistente] = borrador;
        } else {
            // Agregar nuevo borrador
            borradores.unshift(borrador);
        }
        
        this.guardarBorradoresStorage(borradores);
        return borrador;
    },
    
    // Obtener borradores del usuario actual
    obtenerBorradoresUsuario(autorId) {
        const borradores = this.obtenerBorradores();
        return borradores.filter(b => b.autorId === autorId);
    },
    
    // Cargar borrador en el editor
    cargarBorrador(borradorId) {
        const borradores = this.obtenerBorradores();
        const borrador = borradores.find(b => b.id === borradorId);
        
        if (!borrador) {
            alert('❌ Borrador no encontrado');
            return;
        }
        
        // Limpiar editor actual
        document.getElementById('mainTitle').value = borrador.titulo;
        document.getElementById('categoria').value = borrador.categoria;
        
        // Disparar evento change para cargar subcategorías
        const eventoCategoria = new Event('change');
        document.getElementById('categoria').dispatchEvent(eventoCategoria);
        
        setTimeout(() => {
            document.getElementById('subcategoria').value = borrador.subcategoria || '';
        }, 100);
        
        // Limpiar bloques
        document.getElementById('contentBlocks').innerHTML = '';
        window.blockCounter = 0;
        
        // Recrear bloques
        borrador.bloques.forEach(bloque => {
            this.recrearBloque(bloque);
        });
        
        alert('✅ Borrador cargado correctamente');
    },
    
    // Recrear un bloque desde datos guardados
    recrearBloque(bloqueData) {
        const tipo = bloqueData.type;
        
        if (tipo.startsWith('title-')) {
            const subtipo = tipo.split('-')[1];
            window.addBlock('title', subtipo);
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                ultimoBloque.querySelector('input').value = bloqueData.content;
            }, 50);
        }
        else if (tipo === 'paragraph') {
            window.addBlock('paragraph');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                ultimoBloque.querySelector('textarea').value = bloqueData.content;
            }, 50);
        }
        else if (tipo === 'image') {
            window.addBlock('image');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                const input = ultimoBloque.querySelector('input');
                input.value = bloqueData.content;
                window.loadImage(input);
            }, 50);
        }
        else if (tipo === 'video') {
            window.addBlock('video');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                const input = ultimoBloque.querySelector('input');
                input.value = bloqueData.content;
                window.loadVideo(input);
            }, 50);
        }
        else if (tipo === 'quote') {
            window.addBlock('quote');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                ultimoBloque.querySelector('textarea').value = bloqueData.content;
            }, 50);
        }
        else if (tipo === 'divider') {
            window.addBlock('divider');
        }
        else if (tipo === 'facts') {
            window.addBlock('facts');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                ultimoBloque.querySelector('input').value = bloqueData.content.title;
                ultimoBloque.querySelector('textarea').value = bloqueData.content.text;
            }, 50);
        }
        else if (tipo === 'timeline') {
            window.addBlock('timeline');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                const timeline = ultimoBloque.querySelector('.block-timeline');
                
                // Limpiar timeline inicial
                timeline.querySelectorAll('.timeline-item').forEach(item => item.remove());
                
                // Recrear eventos
                const botonAgregar = timeline.querySelector('.add-timeline-btn');
                bloqueData.content.forEach(evento => {
                    const newItem = document.createElement('div');
                    newItem.className = 'timeline-item';
                    newItem.innerHTML = `
                        <input type="text" placeholder="Título del evento" value="${evento.title}">
                        <textarea placeholder="Descripción del evento...">${evento.description}</textarea>
                    `;
                    timeline.insertBefore(newItem, botonAgregar);
                });
            }, 50);
        }
        else if (tipo === 'button') {
            window.addBlock('button');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                ultimoBloque.querySelector('input[type="text"]').value = bloqueData.content.text;
                ultimoBloque.querySelector('input[type="color"]').value = bloqueData.content.color;
                window.updateButton(ultimoBloque.querySelector('input[type="text"]'));
            }, 50);
        }
        else if (tipo === 'table') {
            window.addBlock('table');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                const table = ultimoBloque.querySelector('table');
                
                // Cargar headers
                const headers = table.querySelectorAll('thead th input');
                bloqueData.content.headers.forEach((h, i) => {
                    if (headers[i]) headers[i].value = h;
                });
                
                // Cargar filas
                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';
                bloqueData.content.rows.forEach(row => {
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        tr.innerHTML += `<td><input type="text" value="${cell}"></td>`;
                    });
                    tbody.appendChild(tr);
                });
            }, 50);
        }
        else if (tipo === 'columns') {
            const colCount = bloqueData.content.length;
            window.addBlock('columns', colCount);
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                const textareas = ultimoBloque.querySelectorAll('textarea');
                bloqueData.content.forEach((contenido, i) => {
                    if (textareas[i]) textareas[i].value = contenido;
                });
            }, 50);
        }
        else if (tipo === 'embed') {
            window.addBlock('embed');
            setTimeout(() => {
                const bloques = document.querySelectorAll('.content-block');
                const ultimoBloque = bloques[bloques.length - 1];
                const textarea = ultimoBloque.querySelector('textarea');
                textarea.value = bloqueData.content;
                window.updateEmbed(textarea);
            }, 50);
        }
    },
    
    // Eliminar borrador
    eliminarBorrador(borradorId) {
        const borradores = this.obtenerBorradores();
        const nuevosBorradores = borradores.filter(b => b.id !== borradorId);
        this.guardarBorradoresStorage(nuevosBorradores);
    },
    
    // Renderizar lista de borradores
    renderizarListaBorradores(autorId) {
        const borradores = this.obtenerBorradoresUsuario(autorId);
        
        if (borradores.length === 0) {
            return '<p class="sin-borradores">📝 No tienes borradores guardados</p>';
        }
        
        let html = '<div class="lista-borradores">';
        
        borradores.forEach(b => {
            html += `
                <div class="tarjeta-borrador">
                    <div class="borrador-info">
                        <h4>${b.titulo || 'Sin título'}</h4>
                        <p><strong>Categoría:</strong> ${b.categoria || 'No definida'}</p>
                        ${b.subcategoria ? `<p><strong>Subcategoría:</strong> ${b.subcategoria}</p>` : ''}
                        <p class="fecha-borrador">💾 Guardado: ${b.fechaGuardadoLegible}</p>
                    </div>
                    <div class="borrador-acciones">
                        <button onclick="SistemaBorradores.cargarBorrador('${b.id}')" class="btn-cargar-borrador">
                            📝 Editar
                        </button>
                        <button onclick="confirmarEliminarBorrador('${b.id}')" class="btn-eliminar-borrador">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    // Storage
    obtenerBorradores() {
        return JSON.parse(localStorage.getItem('db_borradores') || '[]');
    },
    
    guardarBorradoresStorage(borradores) {
        localStorage.setItem('db_borradores', JSON.stringify(borradores));
    }
};

// Funciones globales
function abrirModalBorradores() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('Debes iniciar sesión');
        return;
    }
    
    const modal = `
        <div id="modal-borradores" class="modal-borradores">
            <div class="modal-borradores-contenido">
                <span class="cerrar-modal" onclick="cerrarModalBorradores()">&times;</span>
                <h2>📝 Mis Borradores</h2>
                ${SistemaBorradores.renderizarListaBorradores(usuario.id)}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

function cerrarModalBorradores() {
    const modal = document.getElementById('modal-borradores');
    if (modal) modal.remove();
}

function confirmarEliminarBorrador(borradorId) {
    if (confirm('¿Estás seguro de eliminar este borrador?')) {
        SistemaBorradores.eliminarBorrador(borradorId);
        cerrarModalBorradores();
        abrirModalBorradores(); // Reabrir para actualizar lista
    }
}

