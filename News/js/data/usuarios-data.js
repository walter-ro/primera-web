// === LÓGICA DE DATOS DE USUARIOS ===

export function obtenerTodosUsuarios() {
    return JSON.parse(localStorage.getItem('db_usuarios')) || [];
}

export function cambiarRolUsuario(usuarioId, nuevoRol) {
    let usuarios = obtenerTodosUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioId);
    if (index !== -1) {
        usuarios[index].rol = nuevoRol;
        localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
        return true;
    }
    return false;
}

export function toggleUsuarioActivo(usuarioId) {
    let usuarios = obtenerTodosUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioId);
    if (index !== -1) {
        usuarios[index].activo = !usuarios[index].activo;
        localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
        return true;
    }
    return false;
}

export function crearUsuarioEspecial(nombre, email, password, rol) {
    const usuarios = obtenerTodosUsuarios();
    if (usuarios.find(u => u.email === email)) {
        return { exito: false, mensaje: "El email ya existe" };
    }
    
    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        email,
        password, // En un sistema real, esto iría encriptado
        rol: rol,
        activo: true,
        fechaCreacion: new Date().toISOString()
    };
    
    usuarios.push(nuevoUsuario);
    localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
    return { exito: true, mensaje: `${rol} creado exitosamente` };
}