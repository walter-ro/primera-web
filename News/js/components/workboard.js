// ==========================================
// EDITOR DE BLOQUES - workboard.js
// ==========================================

let blockCounter = 0;

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('news-form');
    if (!form) return;
    
    console.log("🛠️ Editor de bloques inicializado");
    
    // ⭐ PREVENIR RECARGA DE PÁGINA
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
    
    // Agregar campos de metadata al workspace
    agregarCamposMetadata();
});

// ==========================================
// AGREGAR CAMPOS DE CATEGORÍA Y SUBCATEGORÍA
// ==========================================

function agregarCamposMetadata() {
    // ⭐ VERIFICAR SI YA EXISTEN
    if (document.querySelector('.metadata-fields')) {
        console.log("⚠️ Los campos de metadata ya existen");
        return; // Si ya existen, no hacer nada
    }
    
    const workspace = document.querySelector('.workspace');
    const workspaceHeader = workspace.querySelector('.workspace-header');
    
    const metadataHTML = `
        <div class="metadata-fields" style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
            <div style="margin-bottom: 15px;">
                <label for="categoria" style="display: block; margin-bottom: 5px; font-weight: bold;">📂 Categoría:</label>
                <select name="categoria" id="categoria" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                    <option value="">Selecciona una categoría</option>
                    <option value="serial-killers">Serial Killers</option>
                    <option value="dark-innovation">Dark Innovation</option>
                    <option value="fun-facts">Fun Facts</option>
                    <option value="shadow-market">Shadow Market</option>
                    <option value="gaming">Gaming</option>
                    <option value="strange-phenomena">Strange Phenomena</option>
                    <option value="crime">Crime</option>
                    <option value="conspiracies">Conspiracies</option>
                </select>
            </div>
            
            <div>
                <label for="subcategoria" style="display: block; margin-bottom: 5px; font-weight: bold;">📌 Subcategoría:</label>
                <select id="subcategoria" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                    <option value="">Sin subcategoría</option>

                    <!-- Dark Innovation -->
                    <option value="experimental-failures" data-parent="dark-innovation">Experimental Failures</option>
                    <option value="forgotten-technologies" data-parent="dark-innovation">Forgotten Technologies</option>
                    <option value="software" data-parent="dark-innovation">Software</option>
                    <option value="deception-files" data-parent="dark-innovation">Deception Files</option>

                    <!-- Shadow Market -->
                    <option value="books" data-parent="shadow-market">Books</option>
                    <option value="clothing" data-parent="shadow-market">Clothing</option>
                    <option value="ritual-games" data-parent="shadow-market">Ritual Games</option>
                    <option value="miscellaneous" data-parent="shadow-market">Miscellaneous</option>
                    <option value="crystals-&-minerals" data-parent="shadow-market">Crystals & Minerals</option>

                    <!-- Gaming -->
                    <option value="future-teller" data-parent="gaming">Future Teller</option>
                    <option value="ouija" data-parent="gaming">Ouija</option>
                    <option value="tarot" data-parent="gaming">Tarot</option>

                    <!-- Strange Phenomena -->
                    <option value="supernatural" data-parent="strange-phenomena">Supernatural</option>
                    <option value="uaps" data-parent="strange-phenomena">UAPs</option>
                    <option value="urban-legends" data-parent="strange-phenomena">Urban Legends</option>
                    <option value="angelic-or-demonic" data-parent="strange-phenomena">Angelic or Demonic</option>
                    <option value="possessions" data-parent="strange-phenomena">Possessions</option>
                    <option value="rituals" data-parent="strange-phenomena">Rituals</option>

                    <!-- Crime -->
                    <option value="psychology-profiles" data-parent="crime">Psychology & Profiles</option>
                    <option value="white-collar" data-parent="crime">White-collar Crime</option>
                    <option value="cold-cases" data-parent="crime">Cold Cases</option>
                    <option value="most-wanted" data-parent="crime">The Most Wanted</option>

                </select>
            </div>
        </div>
    `;
    
    workspaceHeader.insertAdjacentHTML('afterend', metadataHTML);
    
    // Evento para filtrar subcategorías según la categoría seleccionada
    const selectCategoria = document.getElementById('categoria');
    const selectSubcategoria = document.getElementById('subcategoria');
    
    // Guardar todas las opciones de subcategoría
    const todasLasSubcategorias = Array.from(selectSubcategoria.querySelectorAll('option[data-parent]'));
    
    selectCategoria.addEventListener('change', (e) => {
        const categoriaSeleccionada = e.target.value;
        
        // Limpiar subcategorías
        selectSubcategoria.innerHTML = '<option value="">Sin subcategoría</option>';
        
        if (categoriaSeleccionada) {
            // Filtrar y mostrar solo las subcategorías que corresponden
            const subcategoriasFiltradas = todasLasSubcategorias.filter(
                option => option.dataset.parent === categoriaSeleccionada
            );
            
            subcategoriasFiltradas.forEach(option => {
                selectSubcategoria.appendChild(option.cloneNode(true));
            });
        }
    });
}
// ==========================================
// FUNCIÓN PRINCIPAL: AGREGAR BLOQUES
// ==========================================

function addBlock(type, subtype = null) {
    const container = document.getElementById('contentBlocks');
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const blockId = `block-${blockCounter++}`;
    const blockDiv = document.createElement('div');
    blockDiv.className = 'content-block';
    blockDiv.id = blockId;

    let blockHTML = '';

    switch(type) {
        case 'title':
            blockHTML = `
                <div class="block-title ${subtype}">
                    <input type="text" placeholder="${subtype.toUpperCase()}: Escribe tu título...">
                </div>
            `;
            break;

        case 'paragraph':
            blockHTML = `
                <div class="block-paragraph">
                    <textarea placeholder="Escribe tu párrafo aquí..."></textarea>
                </div>
            `;
            break;

        case 'image':
            blockHTML = `
                <div class="block-image">
                    <input type="text" placeholder="URL de la imagen" onchange="loadImage(this)">
                    <div class="image-preview"></div>
                </div>
            `;
            break;

        case 'video':
            blockHTML = `
                <div class="block-video">
                    <input type="text" placeholder="URL del video de YouTube" onchange="loadVideo(this)">
                    <div class="video-preview"></div>
                </div>
            `;
            break;

        case 'quote':
            blockHTML = `
                <div class="block-quote">
                    <textarea placeholder="Escribe tu cita aquí..."></textarea>
                </div>
            `;
            break;

        case 'divider':
            blockHTML = `<hr class="block-divider">`;
            break;

        case 'facts':
            blockHTML = `
                <div class="block-facts">
                    <input type="text" placeholder="Título del dato importante">
                    <textarea placeholder="Información destacada..."></textarea>
                </div>
            `;
            break;

        case 'timeline':
            blockHTML = `
                <div class="block-timeline">
                    <div class="timeline-item">
                        <input type="text" placeholder="Título del evento">
                        <textarea placeholder="Descripción del evento..."></textarea>
                    </div>
                    <button class="add-timeline-btn" onclick="addTimelineItem(this)">+ Agregar evento</button>
                </div>
            `;
            break;

        case 'button':
            blockHTML = `
                <div class="block-button-element">
                    <input type="text" placeholder="Texto del botón" onchange="updateButton(this)">
                    <input type="color" value="#2196F3" onchange="updateButton(this)">
                    <div class="button-preview" style="background: #2196F3;">Botón</div>
                </div>
            `;
            break;

        case 'table':
            blockHTML = `
                <div class="block-table">
                    <div class="table-controls">
                        <button onclick="addTableRow(this)">+ Fila</button>
                        <button onclick="addTableCol(this)">+ Columna</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th><input type="text" placeholder="Encabezado 1"></th>
                                <th><input type="text" placeholder="Encabezado 2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" placeholder="Dato"></td>
                                <td><input type="text" placeholder="Dato"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'columns':
            const colCount = subtype || 2;
            let columns = '';
            for(let i = 0; i < colCount; i++) {
                columns += `
                    <div class="column">
                        <textarea placeholder="Contenido columna ${i + 1}..."></textarea>
                    </div>
                `;
            }
            blockHTML = `
                <div class="block-columns cols-${colCount}">
                    ${columns}
                </div>
            `;
            break;

        case 'embed':
            blockHTML = `
                <div class="block-embed">
                    <textarea placeholder="Pega tu código HTML aquí (ej: iframe de Twitter, Instagram, etc.)" onchange="updateEmbed(this)"></textarea>
                    <div class="embed-preview"></div>
                </div>
            `;
            break;
    }

    // Agregar controles (menos para divisor)
    if (type !== 'divider') {
        blockHTML += `
            <div class="block-controls">
                <button class="control-btn" onclick="moveBlockUp('${blockId}')">↑</button>
                <button class="control-btn" onclick="moveBlockDown('${blockId}')">↓</button>
                <button class="control-btn delete-btn" onclick="deleteBlock('${blockId}')">×</button>
            </div>
        `;
    }

    blockDiv.innerHTML = blockHTML;
    container.appendChild(blockDiv);
}

// ==========================================
// CONTROLES DE BLOQUES
// ==========================================

function deleteBlock(blockId) {
    document.getElementById(blockId).remove();
    checkEmptyState();
}

function moveBlockUp(blockId) {
    const block = document.getElementById(blockId);
    const prev = block.previousElementSibling;
    if (prev && !prev.classList.contains('empty-state')) {
        block.parentNode.insertBefore(block, prev);
    }
}

function moveBlockDown(blockId) {
    const block = document.getElementById(blockId);
    const next = block.nextElementSibling;
    if (next) {
        block.parentNode.insertBefore(next, block);
    }
}

function checkEmptyState() {
    const container = document.getElementById('contentBlocks');
    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>👈 Selecciona bloques para comenzar</h3>
                <p>Agrega títulos, texto, imágenes y más para crear tu noticia</p>
            </div>
        `;
    }
}

// ==========================================
// FUNCIONES ESPECÍFICAS DE BLOQUES
// ==========================================

function loadImage(input) {
    const preview = input.nextElementSibling;
    if (input.value) {
        preview.innerHTML = `<img src="${input.value}" alt="Imagen" style="max-width: 100%; border-radius: 8px;">`;
    }
}

function loadVideo(input) {
    const preview = input.nextElementSibling;
    if (input.value) {
        let videoId = input.value;
        if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
            videoId = videoId.split('v=')[1] || videoId.split('/').pop();
            videoId = videoId.split('&')[0];
        }
        preview.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
}

function addTimelineItem(btn) {
    const timeline = btn.parentElement;
    const newItem = document.createElement('div');
    newItem.className = 'timeline-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Título del evento">
        <textarea placeholder="Descripción del evento..."></textarea>
    `;
    timeline.insertBefore(newItem, btn);
}

function updateButton(input) {
    const container = input.parentElement;
    const textInput = container.querySelector('input[type="text"]');
    const colorInput = container.querySelector('input[type="color"]');
    const preview = container.querySelector('.button-preview');
    
    preview.textContent = textInput.value || 'Botón';
    preview.style.background = colorInput.value;
}

function addTableRow(btn) {
    const table = btn.parentElement.nextElementSibling;
    const tbody = table.querySelector('tbody');
    const colCount = table.querySelector('thead tr').children.length;
    
    const newRow = document.createElement('tr');
    for(let i = 0; i < colCount; i++) {
        newRow.innerHTML += '<td><input type="text" placeholder="Dato"></td>';
    }
    tbody.appendChild(newRow);
}

function addTableCol(btn) {
    const table = btn.parentElement.nextElementSibling;
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelectorAll('tbody tr');
    
    thead.innerHTML += '<th><input type="text" placeholder="Encabezado"></th>';
    tbody.forEach(row => {
        row.innerHTML += '<td><input type="text" placeholder="Dato"></td>';
    });
}

function updateEmbed(textarea) {
    const preview = textarea.nextElementSibling;
    preview.innerHTML = textarea.value;
}

// ==========================================
// RECOLECTAR DATOS DE BLOQUES
// ==========================================

function recolectarBloques() {
    const bloques = [];
    const container = document.getElementById('contentBlocks');
    const blocks = container.querySelectorAll('.content-block');
    
    blocks.forEach(block => {
        const bloqueData = {
            id: block.id,
            type: null,
            content: null
        };
        
        // Detectar tipo y extraer contenido
        if (block.querySelector('.block-title')) {
            const input = block.querySelector('input');
            const tipo = block.querySelector('.block-title').className.split(' ')[1];
            bloqueData.type = `title-${tipo}`;
            bloqueData.content = input.value;
        }
        else if (block.querySelector('.block-paragraph')) {
            bloqueData.type = 'paragraph';
            bloqueData.content = block.querySelector('textarea').value;
        }
        else if (block.querySelector('.block-image')) {
            bloqueData.type = 'image';
            bloqueData.content = block.querySelector('input').value;
        }
        else if (block.querySelector('.block-video')) {
            bloqueData.type = 'video';
            bloqueData.content = block.querySelector('input').value;
        }
        else if (block.querySelector('.block-quote')) {
            bloqueData.type = 'quote';
            bloqueData.content = block.querySelector('textarea').value;
        }
        else if (block.querySelector('.block-divider')) {
            bloqueData.type = 'divider';
            bloqueData.content = '---';
        }
        else if (block.querySelector('.block-facts')) {
            bloqueData.type = 'facts';
            bloqueData.content = {
                title: block.querySelector('input').value,
                text: block.querySelector('textarea').value
            };
        }
        else if (block.querySelector('.block-timeline')) {
            bloqueData.type = 'timeline';
            const items = [];
            block.querySelectorAll('.timeline-item').forEach(item => {
                items.push({
                    title: item.querySelector('input').value,
                    description: item.querySelector('textarea').value
                });
            });
            bloqueData.content = items;
        }
        else if (block.querySelector('.block-button-element')) {
            bloqueData.type = 'button';
            bloqueData.content = {
                text: block.querySelector('input[type="text"]').value,
                color: block.querySelector('input[type="color"]').value
            };
        }
        else if (block.querySelector('.block-table')) {
            bloqueData.type = 'table';
            const tableData = {
                headers: [],
                rows: []
            };
            
            block.querySelectorAll('thead th input').forEach(th => {
                tableData.headers.push(th.value);
            });
            
            block.querySelectorAll('tbody tr').forEach(tr => {
                const row = [];
                tr.querySelectorAll('td input').forEach(td => {
                    row.push(td.value);
                });
                tableData.rows.push(row);
            });
            
            bloqueData.content = tableData;
        }
        else if (block.querySelector('.block-columns')) {
            bloqueData.type = 'columns';
            const columns = [];
            block.querySelectorAll('.column textarea').forEach(col => {
                columns.push(col.value);
            });
            bloqueData.content = columns;
        }
        else if (block.querySelector('.block-embed')) {
            bloqueData.type = 'embed';
            bloqueData.content = block.querySelector('textarea').value;
        }
        
        bloques.push(bloqueData);
    });
    
    return bloques;
}

// ==========================================
// GUARDAR BORRADOR (NUEVA FUNCIÓN)
// ==========================================

function saveDraft() {
    const usuario = obtenerUsuarioActual();
    
    if (!usuario) {
        alert('❌ Debes iniciar sesión para guardar borradores');
        return;
    }
    
    const title = document.getElementById('mainTitle').value.trim();
    const categoria = document.getElementById('categoria').value;
    const subcategoria = document.getElementById('subcategoria').value || null;
    const bloques = recolectarBloques();
    
    if (!title && bloques.length === 0) {
        alert('⚠️ El borrador está vacío');
        return;
    }
    
    const borrador = SistemaBorradores.guardarBorrador(
        title,
        categoria,
        subcategoria,
        bloques,
        usuario.id
    );
    
    alert(`💾 Borrador guardado exitosamente\n\n📝 ${borrador.titulo}\n🕐 ${borrador.fechaGuardadoLegible}`);
}

// ==========================================
// VISTA PREVIA
// ==========================================

function previewPost() {
    const title = document.getElementById('mainTitle').value;
    const categoria = document.getElementById('categoria').value;
    const subcategoria = document.getElementById('subcategoria').value;
    const bloques = recolectarBloques();
    
    if (!title) {
        alert('⚠️ Por favor agrega un título');
        return;
    }
    
    if (!categoria) {
        alert('⚠️ Por favor selecciona una categoría');
        return;
    }
    
    // Generar HTML de vista previa
    let htmlBloques = '';
    
    bloques.forEach(bloque => {
        switch(bloque.type) {
            case 'title-h1':
                htmlBloques += `<h1 class="preview-h1">${bloque.content}</h1>`;
                break;
            case 'title-h2':
                htmlBloques += `<h2 class="preview-h2">${bloque.content}</h2>`;
                break;
            case 'title-h3':
                htmlBloques += `<h3 class="preview-h3">${bloque.content}</h3>`;
                break;
            case 'paragraph':
                htmlBloques += `<p class="preview-paragraph">${bloque.content}</p>`;
                break;
            case 'image':
                htmlBloques += `<img src="${bloque.content}" class="preview-image" alt="Imagen">`;
                break;
            case 'video':
                let videoId = bloque.content;
                if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                    videoId = videoId.split('v=')[1] || videoId.split('/').pop();
                    videoId = videoId.split('&')[0];
                }
                htmlBloques += `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="preview-video"></iframe>`;
                break;
            case 'quote':
                htmlBloques += `<blockquote class="preview-quote">${bloque.content}</blockquote>`;
                break;
            case 'divider':
                htmlBloques += `<hr class="preview-divider">`;
                break;
            case 'facts':
                htmlBloques += `
                    <div class="preview-facts">
                        <h4>${bloque.content.title}</h4>
                        <p>${bloque.content.text}</p>
                    </div>
                `;
                break;
            case 'timeline':
                let timelineHTML = '<div class="preview-timeline">';
                bloque.content.forEach(evento => {
                    timelineHTML += `
                        <div class="timeline-event">
                            <h5>${evento.title}</h5>
                            <p>${evento.description}</p>
                        </div>
                    `;
                });
                timelineHTML += '</div>';
                htmlBloques += timelineHTML;
                break;
            case 'button':
                htmlBloques += `<button class="preview-button" style="background: ${bloque.content.color}">${bloque.content.text}</button>`;
                break;
            case 'table':
                let tableHTML = '<table class="preview-table"><thead><tr>';
                bloque.content.headers.forEach(h => {
                    tableHTML += `<th>${h}</th>`;
                });
                tableHTML += '</tr></thead><tbody>';
                bloque.content.rows.forEach(row => {
                    tableHTML += '<tr>';
                    row.forEach(cell => {
                        tableHTML += `<td>${cell}</td>`;
                    });
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';
                htmlBloques += tableHTML;
                break;
            case 'columns':
                let colsHTML = '<div class="preview-columns">';
                bloque.content.forEach(col => {
                    colsHTML += `<div class="preview-column">${col}</div>`;
                });
                colsHTML += '</div>';
                htmlBloques += colsHTML;
                break;
            case 'embed':
                htmlBloques += `<div class="preview-embed">${bloque.content}</div>`;
                break;
        }
    });
    
    // Crear modal de vista previa
    const modalHTML = `
        <div id="modal-preview" class="modal-preview">
            <div class="modal-preview-contenido">
                <div class="preview-header">
                    <h2>👁️ Vista Previa</h2>
                    <button onclick="cerrarVistaPrevia()" class="btn-cerrar-preview">✕ Cerrar</button>
                </div>
                
                <div class="preview-body">
                    <div class="preview-metadata">
                        <span class="badge-categoria">${categoria}</span>
                        ${subcategoria ? `<span class="badge-subcategoria">${subcategoria}</span>` : ''}
                    </div>
                    
                    <h1 class="preview-title">${title}</h1>
                    
                    <div class="preview-content">
                        ${htmlBloques}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function cerrarVistaPrevia() {
    const modal = document.getElementById('modal-preview');
    if (modal) modal.remove();
}

// ==========================================
// GUARDAR NOTICIA
// ==========================================

function savePost() {
    const usuario = typeof obtenerUsuarioActual === 'function' 
        ? obtenerUsuarioActual() 
        : null;
    
    if (!usuario) {
        alert('❌ Debes iniciar sesión para guardar noticias');
        return;
    }
    
    const puedeCrear = tienePermiso?.('crearPostDirecto') || tienePermiso?.('crearPostPendiente');
    
    if (!puedeCrear) {
        alert('❌ No tienes permisos para crear noticias');
        return;
    }
    
    const title = document.getElementById('mainTitle').value.trim();
    const categoria = document.getElementById('categoria').value;
    const subcategoria = document.getElementById('subcategoria').value || null;
    const bloques = recolectarBloques();
    
    if (!title) {
        alert('⚠️ Por favor agrega un título');
        return;
    }
    
    if (!categoria) {
        alert('⚠️ Por favor selecciona una categoría');
        return;
    }
    
    if (bloques.length === 0) {
        alert('⚠️ Agrega al menos un bloque de contenido');
        return;
    }
    
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const hora = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const noticia = {
        id: Date.now(),
        titulo: title,
        categoria: categoria,
        subcategoria: subcategoria,
        bloques: bloques,
        autor: usuario.nombre,
        autorId: usuario.id,
        fecha: fecha,
        hora: hora,
        fechaCreacion: ahora.toISOString()
    };
    
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    noticias.unshift(noticia);
    localStorage.setItem('db_noticias', JSON.stringify(noticias));
    
    // ✅ NUEVO: Inicializar métricas
    if (typeof SistemaMetricas !== 'undefined') {
        SistemaMetricas.inicializarMetricas(noticia.id, usuario.id);
    }
    
    if (typeof registrarPublicacion === 'function') {
        registrarPublicacion(noticia.id, usuario.id);
    }
    
    // ✅ NUEVO: Mostrar botones de compartir automáticamente
    mostrarBotonesCompartirPostPublicacion(noticia.id, noticia.titulo);
    
    // Limpiar formulario
    document.getElementById('mainTitle').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('subcategoria').value = '';
    document.getElementById('contentBlocks').innerHTML = `
        <div class="empty-state">
            <h3>👈 Selecciona bloques para comenzar</h3>
            <p>Agrega títulos, texto, imágenes y más para crear tu noticia</p>
        </div>
    `;
    blockCounter = 0;
    
    if (typeof renderizarNoticias === 'function') {
        renderizarNoticias();
    }
}

// ✅ NUEVA FUNCIÓN: Mostrar botones de compartir después de publicar
function mostrarBotonesCompartirPostPublicacion(noticiaId, titulo) {
    const modalHTML = `
        <div id="modal-post-publicado" class="modal-post-publicado">
            <div class="modal-post-contenido">
                <h2>✅ ¡Noticia Publicada!</h2>
                <p>Tu noticia <strong>"${titulo}"</strong> ha sido publicada exitosamente.</p>
                
                ${SistemaCompartir.renderizarBotonesCompartir(noticiaId, titulo)}
                
                <button onclick="cerrarModalPostPublicado()" class="btn-continuar">
                    Continuar
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function cerrarModalPostPublicado() {
    const modal = document.getElementById('modal-post-publicado');
    if (modal) modal.remove();
}

// ==========================================
// HACER FUNCIONES GLOBALES
// ==========================================

window.saveDraft = saveDraft;
window.cerrarVistaPrevia = cerrarVistaPrevia;
window.cerrarModalPostPublicado = cerrarModalPostPublicado;
window.addBlock = addBlock;
window.deleteBlock = deleteBlock;
window.moveBlockUp = moveBlockUp;
window.moveBlockDown = moveBlockDown;
window.loadImage = loadImage;
window.loadVideo = loadVideo;
window.addTimelineItem = addTimelineItem;
window.updateButton = updateButton;
window.addTableRow = addTableRow;
window.addTableCol = addTableCol;
window.updateEmbed = updateEmbed;
window.previewPost = previewPost;
window.savePost = savePost;