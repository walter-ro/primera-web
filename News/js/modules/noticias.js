function eliminarNoticia(noticiaId) {
    let noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    const nuevasNoticias = noticias.filter(n => n.id !== noticiaId);

    if (noticias.length === nuevasNoticias.length) {
        return false; // no se eliminó nada
    }

    localStorage.setItem('db_noticias', JSON.stringify(nuevasNoticias));
    return true;
}