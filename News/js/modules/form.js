// ==========================================
// CREAR EDITOR
// ==========================================

/**
 * Formulario para crear editor
 */
function mostrarCrearEditor() {
    const content = document.getElementById('admin-panel-content');
    
    content.innerHTML = `
        <div class="crear-usuario-form">
            <h3>➕ Crear Nuevo Editor</h3>
            <form id="form-crear-editor" onsubmit="return submitCrearEditor(event)">
                <div class="form-group">
                    <label>Nombre completo:</label>
                    <input type="text" id="editor-nombre" required>
                </div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="editor-email" required>
                </div>
                
                <div class="form-group">
                    <label>Contraseña:</label>
                    <input type="password" id="editor-password" required minlength="6">
                </div>
                
                <button type="submit" class="btn-crear-usuario">✅ Crear Editor</button>
            </form>
        </div>
    `;
}

//Para crear editores
function crearEditor(nombre, email, password) {
    let usuarios = JSON.parse(localStorage.getItem('db_usuarios')) || [];

    // Validar email único
    if (usuarios.some(u => u.email === email)) {
        return { exito: false, mensaje: 'Este email ya está registrado' };
    }

    const nuevoEditor = {
        id: Date.now(),
        nombre,
        email,
        password,
        rol: 'editor',
        activo: true
    };

    usuarios.push(nuevoEditor);
    localStorage.setItem('db_usuarios', JSON.stringify(usuarios));

    return { exito: true, mensaje: 'Editor creado correctamente' };
}



/**
 * Submit del formulario de crear editor
 */
window.submitCrearEditor = function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('editor-nombre').value;
    const email = document.getElementById('editor-email').value;
    const password = document.getElementById('editor-password').value;
    
    const resultado = crearEditor(nombre, email, password);
    
    if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}\n\nEmail: ${email}\nPassword: ${password}`);
        mostrarGestionUsuarios();
    } else {
        alert(`❌ ${resultado.mensaje}`);
    }
    
    return false;
}

// ==========================================
// CREAR SUB-ADMIN
// ==========================================

/**
 * Formulario para crear sub-admin
 */
function mostrarCrearSubAdmin() {
    const content = document.getElementById('admin-panel-content');
    
    content.innerHTML = `
        <div class="crear-usuario-form">
            <h3>➕ Crear Nuevo Sub-Admin</h3>
            <form id="form-crear-subadmin" onsubmit="return submitCrearSubAdmin(event)">
                <div class="form-group">
                    <label>Nombre completo:</label>
                    <input type="text" id="subadmin-nombre" required>
                </div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="subadmin-email" required>
                </div>
                
                <div class="form-group">
                    <label>Contraseña:</label>
                    <input type="password" id="subadmin-password" required minlength="6">
                </div>
                
                <button type="submit" class="btn-crear-usuario">✅ Crear Sub-Admin</button>
            </form>
        </div>
    `;
}

function crearSubAdmin(nombre, email, password) {
    let usuarios = JSON.parse(localStorage.getItem('db_usuarios')) || [];

    // Validar email único
    if (usuarios.some(u => u.email === email)) {
        return { exito: false, mensaje: 'Este email ya está registrado' };
    }

    const nuevoSubAdmin = {
        id: Date.now(),
        nombre,
        email,
        password,
        rol: 'sub-admin',
        activo: true
    };

    usuarios.push(nuevoSubAdmin);
    localStorage.setItem('db_usuarios', JSON.stringify(usuarios));

    return { exito: true, mensaje: 'SubAdmin creado correctamente' };
}


/**
 * Submit del formulario de crear sub-admin
 */
window.submitCrearSubAdmin = function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('subadmin-nombre').value;
    const email = document.getElementById('subadmin-email').value;
    const password = document.getElementById('subadmin-password').value;
    
    const resultado = crearSubAdmin(nombre, email, password);
    
    if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}\n\nEmail: ${email}\nPassword: ${password}`);
        mostrarGestionUsuarios();
    } else {
        alert(`❌ ${resultado.mensaje}`);
    }
    
    return false;
}

// Mantener activos los usuarios cuando se crean

let usuarios = JSON.parse(localStorage.getItem('db_usuarios')) || [];

usuarios.forEach(u => {
    if (typeof u.activo !== 'boolean') {
        u.activo = true;
    }
});

localStorage.setItem('db_usuarios', JSON.stringify(usuarios));


window.mostrarCrearEditor = mostrarCrearEditor;
window.mostrarCrearSubAdmin = mostrarCrearSubAdmin;