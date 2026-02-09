/**
 * ========================================
 * NOTICIAS-RENDER - RENDERIZADO DE NOTICIAS
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Renderizar lista de noticias en #main-content
 * - Renderizar noticia individual completa
 * - Soportar bloques modernos y formato legacy
 * 
 * IMPORTANTE:
 * - Este archivo SÍ modifica #main-content directamente
 * - Pero SOLO para mostrar noticias (su responsabilidad principal)
 * - Usa cambiarVista(VISTAS.NOTICIAS) antes de renderizar
 * - Para volver, usa history.back() o volverInicio()
 */

// ==========================================
// 1. HELPERS DE BLOQUES
// ==========================================

/**
 * Renderiza un solo bloque según su tipo
 */
function renderizarBloque(bloque) {
    if (!bloque || !bloque.type) return '';
    
    let html = '';
    
    switch(bloque.type) {
        case 'title-h1':
            html = `<h1>${bloque.content}</h1>`;
            break;
            
        case 'title-h2':
            html = `<h2>${bloque.content}</h2>`;
            break;
            
        case 'title-h3':
            html = `<h3>${bloque.content}</h3>`;
            break;
            
        case 'paragraph':
            html = `<p>${bloque.content}</p>`;
            break;
            
        case 'image':
            if (bloque.content) {
                html = `<div class="bloque-imagen">
                    <img src="${bloque.content}" alt="Imagen" style="max-width: 100%; border-radius: 8px;">
                </div>`;
            }
            break;
            
        case 'video':
            if (bloque.content) {
                let videoId = bloque.content;
                if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                    videoId = videoId.split('v=')[1] || videoId.split('/').pop();
                    videoId = videoId.split('&')[0];
                }
                html = `<div class="bloque-video">
                    <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" allowfullscreen></iframe>
                </div>`;
            }
            break;
            
        case 'quote':
            html = `<blockquote class="bloque-cita">${bloque.content}</blockquote>`;
            break;
            
        case 'divider':
            html = `<hr class="bloque-divisor">`;
            break;
            
        case 'facts':
            if (bloque.content && typeof bloque.content === 'object') {
                html = `<div class="bloque-datos">
                    <h4>${bloque.content.title || 'Dato Importante'}</h4>
                    <p>${bloque.content.text}</p>
                </div>`;
            }
            break;
            
        case 'timeline':
            if (bloque.content && Array.isArray(bloque.content)) {
                html = '<div class="bloque-timeline">';
                bloque.content.forEach(item => {
                    html += `
                        <div class="timeline-evento">
                            <h4>${item.title}</h4>
                            <p>${item.description}</p>
                        </div>
                    `;
                });
                html += '</div>';
            }
            break;
            
        case 'button':
            if (bloque.content && typeof bloque.content === 'object') {
                html = `<div class="bloque-boton">
                    <button style="background: ${bloque.content.color}; padding: 12px 24px; 
                                   border: none; border-radius: 6px; color: white; 
                                   font-size: 16px; cursor: pointer;">
                        ${bloque.content.text}
                    </button>
                </div>`;
            }
            break;
            
        case 'table':
            if (bloque.content && typeof bloque.content === 'object') {
                html = '<div class="bloque-tabla"><table style="width: 100%; border-collapse: collapse;">';
                
                html += '<thead><tr>';
                bloque.content.headers.forEach(header => {
                    html += `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${header}</th>`;
                });
                html += '</tr></thead>';
                
                html += '<tbody>';
                bloque.content.rows.forEach(row => {
                    html += '<tr>';
                    row.forEach(cell => {
                        html += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                    });
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
            }
            break;
            
        case 'columns':
            if (bloque.content && Array.isArray(bloque.content)) {
                const colCount = bloque.content.length;
                html = `<div class="bloque-columnas" style="display: grid; grid-template-columns: repeat(${colCount}, 1fr); gap: 20px;">`;
                bloque.content.forEach(col => {
                    html += `<div class="columna">${col}</div>`;
                });
                html += '</div>';
            }
            break;
            
        case 'embed':
            html = `<div class="bloque-embed">${bloque.content}</div>`;
            break;
            
        default:
            html = `<p>${bloque.content}</p>`;
    }
    
    return html;
}

/**
 * Extrae texto plano de bloques para preview
 * Esta es la que crea resumenes para que se vean en inicio o al postear max 150
 */
function extraerTextoPlano(bloques, maxChars = 150) {
    if (!bloques || !Array.isArray(bloques)) return '';
    
    let texto = '';
    
    for (const bloque of bloques) {
        if (texto.length >= maxChars) break;
        
        if (bloque.type === 'paragraph' || bloque.type.startsWith('title-')) {
            texto += bloque.content + ' ';
        } else if (bloque.type === 'quote') {
            texto += '"' + bloque.content + '" ';
        }
    }
    
    return texto.substring(0, maxChars) + (texto.length > maxChars ? '...' : '');
}

/**
 * Extrae primera imagen de los bloques para el post
 */
function extraerPrimeraImagen(bloques) {
    if (!bloques || !Array.isArray(bloques)) return null;
    
    const bloqueImagen = bloques.find(b => b.type === 'image');
    return bloqueImagen ? bloqueImagen.content : null;
}

// ==========================================
// 2. OBTENER NOTICIAS
// ==========================================

/**
 * Obtiene noticias filtradas por categoría/subcategoría
 */
function obtenerNoticiasBloques(categoria = 'inicio', subcategoria = null) {
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];

    return noticias.filter(n => {
        let matchCat = categoria === 'inicio' || n.categoria === categoria;
        let matchSub = !subcategoria || n.subcategoria === subcategoria;
        return matchCat && matchSub;
    });
}

// ==========================================
// 3. RENDERIZAR LISTA DE NOTICIAS
// ==========================================

/**
 * Renderiza lista de noticias en #main-content
 * Esta es la vista principal de noticias
 */
function renderizarNoticias(categoria = 'inicio', subcategoria = null) {
    // ✅ Cambiar a vista de noticias
    cambiarVista(VISTAS.NOTICIAS);
    
    const mainContent = document.getElementById('main-content');
    const noticias = obtenerNoticiasBloques(categoria, subcategoria);
    
    let titulo = 'Últimas Noticias';
    if (categoria !== 'inicio') {
        titulo = categoria.replace(/-/g, ' ').toUpperCase();
        if (subcategoria) {
            titulo += ` - ${subcategoria}`;
        }
    }
    
    let noticiasHTML = '';
    
    if (noticias.length === 0) {
        noticiasHTML = '<p class="no-noticias">No hay noticias publicadas en esta sección todavía.</p>';
    } else {
        noticias.forEach(n => {
            // Extraer imagen de preview
            let imagenesHTML = '';
            const imagenBloque = extraerPrimeraImagen(n.bloques);
            
            if (imagenBloque) {
                imagenesHTML = `<img src="${imagenBloque}" alt="${n.titulo}" 
                                     onclick="verNoticiaCompleta(${n.id})" style="cursor: pointer;">`;
            } else if (n.imagenes && n.imagenes.length > 0) {
                imagenesHTML = `<img src="${n.imagenes[0]}" alt="${n.titulo}" 
                                     onclick="verNoticiaCompleta(${n.id})" style="cursor: pointer;">`;
            } else if (n.imagen) {
                imagenesHTML = `<img src="${n.imagen}" alt="${n.titulo}" 
                                     onclick="verNoticiaCompleta(${n.id})" style="cursor: pointer;">`;
            }
            
            // Extraer texto de preview
            let textoPreview = '';
            if (n.bloques && Array.isArray(n.bloques)) {
                textoPreview = extraerTextoPlano(n.bloques, 150);
            } else if (n.contenido) {
                textoPreview = n.contenido.substring(0, 150) + '...';
            }
            
            noticiasHTML += `
                <article class="noticia-card" onclick="verNoticiaCompleta(${n.id})" style="cursor: pointer;">
                    ${imagenesHTML}
                    <div class="noticia-body">
                        <h2>${n.titulo}</h2>
                        <p class="noticia-meta">
                            <span class="categoria-badge">${n.categoria}</span>
                            ${n.subcategoria ? `<span class="subcategoria-badge">${n.subcategoria}</span>` : ''}
                            <span class="fecha">📅 ${n.fecha}</span>
                            ${n.hora ? `<span class="hora">🕐 ${n.hora}</span>` : ''}
                        </p>
                        <p class="noticia-contenido">${textoPreview}</p>
                        ${n.autor ? `<p class="noticia-autor-mini">✍️ ${n.autor}</p>` : ''}
                    </div>
                </article>
            `;
        });
    }
    
    // ✅ Renderizar directamente en main-content (su responsabilidad)
    mainContent.innerHTML = `
        <div class="seccion-noticias">
            <header class="seccion-header">
                <h1>${titulo}</h1>
            </header>
            <div class="grid-noticias">
                ${noticiasHTML}
            </div>
        </div>
    `;
}

// ==========================================
// 4. VER NOTICIA COMPLETA
// ==========================================

/**
 * Renderiza una noticia individual completa
 * Muestra todos los bloques y opciones de edición/eliminación
 */
function verNoticiaCompleta(noticiaId) {
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    const noticia = noticias.find(n => n.id === noticiaId);
    
    if (!noticia) {
        alert('❌ Noticia no encontrada');
        return;
    }
    
    // Registrar vista
    if (typeof registrarVista === 'function') {
        registrarVista(noticiaId);
    }
    
    const stats = typeof obtenerEstadisticas === 'function' 
        ? obtenerEstadisticas() 
        : { noticias: {} };
    const statsNoticia = stats.noticias[noticiaId] || {vistas: 0, comentarios: 0, reportes: 0};
    
    const usuario = typeof obtenerUsuarioActual === 'function'
        ? obtenerUsuarioActual()
        : { rol: 'visitante' };
    
    const puedeEditar = typeof tienePermiso === 'function' && tienePermiso('editarCualquierPost');
    const puedeEliminar = typeof tienePermiso === 'function' && tienePermiso('eliminarCualquierPost');
    
    // Renderizar contenido según estructura
    let contenidoHTML = '';
    
    if (noticia.bloques && Array.isArray(noticia.bloques)) {
        // Nueva estructura con bloques
        noticia.bloques.forEach(bloque => {
            contenidoHTML += renderizarBloque(bloque);
        });
    } else if (noticia.contenido) {
        // Compatibilidad con formato antiguo
        contenidoHTML = `
            <div class="noticia-texto-completo">
                ${noticia.contenido.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
        `;
        
        if (noticia.imagenes && noticia.imagenes.length > 0) {
            contenidoHTML += '<div class="noticia-imagenes-detalle">';
            noticia.imagenes.forEach(img => {
                contenidoHTML += `<img src="${img}" alt="${noticia.titulo}">`;
            });
            contenidoHTML += '</div>';
        } else if (noticia.imagen) {
            contenidoHTML += `<img src="${noticia.imagen}" alt="${noticia.titulo}" class="noticia-imagen-principal">`;
        }
        
        if (noticia.videos && noticia.videos.length > 0) {
            contenidoHTML += '<div class="noticia-videos-detalle">';
            noticia.videos.forEach(vid => {
                contenidoHTML += `<iframe src="${vid}" frameborder="0" allowfullscreen></iframe>`;
            });
            contenidoHTML += '</div>';
        } else if (noticia.video) {
            contenidoHTML += `<iframe src="${noticia.video}" frameborder="0" allowfullscreen></iframe>`;
        }
    }
    
    // ✅ Asegurarse de estar en vista de noticias
    cambiarVista(VISTAS.NOTICIAS);
    
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <article class="noticia-completa">
            <header class="noticia-completa-header">
                <button onclick="volverInicio()" class="btn-volver">← Volver</button>
                <div class="noticia-acciones-header">
                    ${puedeEditar ? `<button onclick="editarNoticiaUI(${noticiaId})" class="btn-editar">✏️ Editar</button>` : ''}
                    ${puedeEliminar ? `<button onclick="eliminarNoticiaUI(${noticiaId})" class="btn-eliminar">🗑️ Eliminar</button>` : ''}
                    ${usuario.rol !== 'visitante' && typeof ROLES !== 'undefined' && usuario.rol !== ROLES.VISITANTE ? `
                        <button onclick="reportarNoticiaUI(${noticiaId})" class="btn-reportar">⚠️ Reportar</button>
                    ` : ''}
                </div>
            </header>
            
            <div class="noticia-completa-contenido">
                <h1>${noticia.titulo}</h1>
                
                <div class="noticia-meta-completa">
                    <span class="categoria-badge">${noticia.categoria}</span>
                    ${noticia.subcategoria ? `<span class="subcategoria-badge">${noticia.subcategoria}</span>` : ''}
                    <span class="fecha">📅 ${noticia.fecha}</span>
                    ${noticia.hora ? `<span class="hora">🕐 ${noticia.hora}</span>` : ''}
                    ${noticia.autor ? `<span class="autor">✍️ ${noticia.autor}</span>` : ''}
                </div>
                
                <div class="noticia-stats-mini">
                    <span>👁️ ${statsNoticia.vistas} vistas</span>
                    <span>💬 ${statsNoticia.comentarios} comentarios</span>
                </div>
                
                <div class="noticia-bloques-contenido">
                    ${contenidoHTML}
                </div>
                
                ${noticia.fuente ? `
                    <div class="noticia-fuente-box">
                        <strong>📰 Fuente original:</strong> 
                        <a href="${noticia.fuente}" target="_blank" rel="noopener">${noticia.fuente}</a>
                    </div>
                ` : ''}
            </div>
            
            ${typeof renderizarSeccionComentarios === 'function' ? renderizarSeccionComentarios(noticiaId) : ''}
        </article>
    `;
    
    window.scrollTo(0, 0);
}

// ==========================================
// 5. EXPORTAR FUNCIONES
// ==========================================

window.obtenerNoticiasBloques = obtenerNoticiasBloques;
window.renderizarNoticias = renderizarNoticias;
window.verNoticiaCompleta = verNoticiaCompleta;

console.log('✅ Noticias-render cargado');