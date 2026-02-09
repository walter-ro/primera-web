window.eliminarNoticiaUI = function(noticiaId) {
    if (!confirm('⚠️ ¿Estás seguro de eliminar esta noticia?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    let noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    noticias = noticias.filter(n => n.id !== noticiaId);
    localStorage.setItem('db_noticias', JSON.stringify(noticias));
    
    alert('🗑️ Noticia eliminada');
    volverInicio();
}

