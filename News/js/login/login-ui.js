/**
 * ========================================
 * LOGIN-UI - INTERFAZ DE AUTENTICACIÓN
 * ========================================
 * 
 * RESPONSABILIDAD:
 * - Mostrar formularios de login/registro
 * - Procesar verificación de email
 * - Actualizar interfaz después del login
 * 
 * IMPORTANTE:
 * - Usa renderizarEnMain() del sistema de navegación
 * - Llama a aplicarControlDeAcceso() después del login
 */
// ==========================================
// EVENT LISTENERS GLOBALES (DELEGACIÓN)
// ==========================================

document.addEventListener('click', (e) => {
    // Navegación principal
    if (e.target.id === 'logo-inicio' || e.target.closest('#logo-inicio')) {
        volverInicio();
    }

    if (e.target.id === 'join-now') {
        e.preventDefault();
        mostrarRegistro();
    }

    if (e.target.id === 'log-in') {
        e.preventDefault();
        mostrarLogin();
    }

    // ✅ NUEVOS: Botones de auth
    if (e.target.id === 'link-registro') {
        e.preventDefault();
        mostrarRegistro();
    }

    if (e.target.id === 'link-login') {
        e.preventDefault();
        mostrarLogin();
    }

    if (e.target.id === 'btn-volver-inicio') {
        volverInicio();
    }

    if (e.target.id === 'btn-auto-login-admin') {
        autoLoginAdmin();
    }

    if (e.target.id === 'btn-reenviar-codigo') {
        const email = e.target.getAttribute('data-email');
        reenviarCodigo(email);
    }

    if (e.target.id === 'btn-cambiar-email') {
        mostrarRegistro();
    }
});

// ✅ NUEVO: Delegación para formularios
document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-login') {
        procesarLogin(e);
    }

    if (e.target.id === 'form-registro') {
        procesarRegistro(e);
    }

    if (e.target.id === 'form-verificacion') {
        e.preventDefault();
        const email = e.target.getAttribute('data-email');
        procesarVerificacion(email);
    }
});

// ==========================================
// PANTALLA DE LOGIN
// ==========================================

function mostrarLogin() {
    const contenido = `
        <div class="seccion-auth">
            <h1>🔐 Iniciar Sesión</h1>
            <form id="form-login">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="login-email" placeholder="tu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label>Contraseña:</label>
                    <input type="password" id="login-password" placeholder="••••••••" required>
                </div>
                
                <button type="submit">Entrar</button>
                
                <p class="auth-link">
                    ¿No tienes cuenta? <a href="#" id="link-registro">Regístrate aquí</a>
                </p>
                
                <div class="credenciales-demo">
                    <h4>🔧 Credenciales de prueba:</h4>
                    <p><strong>Admin:</strong> admin@usnews.com / admin123</p>
                    <p><strong>Editor:</strong> editor@usnews.com / editor123</p>
                    <p><strong>Usuario:</strong> user@usnews.com / user123</p>
                    <button type="button" id="btn-auto-login-admin" class="btn-demo">
                        Login rápido como Admin
                    </button>
                </div>
            </form>
            <button id="btn-volver-inicio" class="btn-volver-auth">← Volver</button>
        </div>
    `;
    
    renderizarEnMain(contenido);
    // ✅ ¡SIN setTimeout! Los event listeners ya están arriba
}

// ==========================================
// PANTALLA DE REGISTRO
// ==========================================

function mostrarRegistro() {
    const contenido = `
        <div class="seccion-auth">
            <h1>📝 Crear Cuenta</h1>
            <form id="form-registro">
                <div class="form-group">
                    <label>Nombre completo:</label>
                    <input type="text" id="registro-nombre" placeholder="Juan Pérez" required>
                </div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="registro-email" placeholder="tu@email.com" required>
                </div>
                
                <div class="form-group">
                    <label>Contraseña:</label>
                    <input type="password" id="registro-password" placeholder="Mínimo 6 caracteres" required minlength="6">
                </div>
                
                <button type="submit">Registrarse</button>
                
                <p class="auth-link">
                    ¿Ya tienes cuenta? <a href="#" id="link-login">Inicia sesión aquí</a>
                </p>
            </form>
            <button id="btn-volver-inicio" class="btn-volver-auth">← Volver</button>
        </div>
    `;
    
    renderizarEnMain(contenido);
    // ✅ ¡SIN setTimeout!
}

// ==========================================
// PANTALLA DE VERIFICACIÓN
// ==========================================

function mostrarPantallaVerificacion(email) {
    const contenido = `
        <div class="seccion-auth">
            <h1>📧 Verifica tu cuenta</h1>
            <p class="texto-verificacion">
                Hemos enviado un código de verificación a:<br>
                <strong>${email}</strong>
            </p>
            
            <form id="form-verificacion" data-email="${email}">
                <div class="form-group">
                    <label>Código de verificación (6 dígitos):</label>
                    <input 
                        type="text" 
                        id="codigo-verificacion" 
                        placeholder="123456" 
                        maxlength="6"
                        pattern="[0-9]{6}"
                        required
                        autocomplete="off"
                    >
                    <small>Revisa tu correo (o la consola del navegador en desarrollo)</small>
                </div>
                
                <button type="submit">Verificar Cuenta</button>
            </form>
            
            <div class="opciones-verificacion">
                <p>¿No recibiste el código?</p>
                <button type="button" id="btn-reenviar-codigo" data-email="${email}" class="btn-secundario">
                    📬 Reenviar código
                </button>
                <button type="button" id="btn-cambiar-email" class="btn-secundario">
                    ✏️ Cambiar email
                </button>
            </div>
            
            <button id="btn-volver-inicio" class="btn-volver-auth">← Volver al inicio</button>
        </div>
    `;
    
    renderizarEnMain(contenido);
    
    // ✅ Solo auto-focus (esto SÍ necesita setTimeout porque el DOM necesita renderizarse)
    setTimeout(() => {
        document.getElementById('codigo-verificacion')?.focus();
    }, 50);
}

// ==========================================
// PROCESAR LOGIN
// ==========================================

function procesarLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const resultado = loginUsuario(email, password);
    
    if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}\n\nRol: ${resultado.usuario.rol}`);
        actualizarInterfazDespuesDeLogin();
    } else if (resultado.requiereVerificacion) {
        alert(`⚠️ ${resultado.mensaje}`);
        mostrarPantallaVerificacion(resultado.email);
    } else {
        alert(`❌ ${resultado.mensaje}`);
    }
}

// ==========================================
// PROCESAR REGISTRO
// ==========================================

function procesarRegistro(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('registro-nombre').value;
    const email = document.getElementById('registro-email').value;
    const password = document.getElementById('registro-password').value;
    
    const resultado = registrarUsuario(nombre, email, password);
    
    if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        mostrarPantallaVerificacion(email);
    } else {
        alert(`❌ ${resultado.mensaje}`);
    }
}

// ==========================================
// PROCESAR VERIFICACIÓN
// ==========================================

function procesarVerificacion(email) {
    const codigo = document.getElementById('codigo-verificacion').value;
    
    if (codigo.length !== 6) {
        alert('❌ El código debe tener 6 dígitos');
        return;
    }
    
    const resultado = verificarConCodigo(email, codigo);
    
    if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        mostrarLogin();
    } else {
        alert(`❌ ${resultado.mensaje}`);
    }
}

// ==========================================
// REENVIAR CÓDIGO
// ==========================================

function reenviarCodigo(email) {
    const resultado = reenviarCodigoVerificacion(email);
    
    if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}\n\nRevisa tu correo (o la consola en desarrollo)`);
    } else {
        alert(`❌ ${resultado.mensaje}`);
    }
}

// ==========================================
// VERIFICACIÓN POR URL
// ==========================================

function verificarDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        const resultado = verificarConURL(token);
        
        if (resultado.exito) {
            alert(`✅ ${resultado.mensaje}`);
            window.history.replaceState({}, document.title, window.location.pathname);
            mostrarLogin();
        } else {
            alert(`❌ ${resultado.mensaje}`);
            mostrarLogin();
        }
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', verificarDesdeURL);

// ==========================================
// ACTUALIZAR INTERFAZ DESPUÉS DEL LOGIN
// ==========================================

function actualizarInterfazDespuesDeLogin() {
    const usuario = obtenerUsuarioActual();
    console.log(`✅ Login exitoso como: ${usuario.nombre} (${usuario.rol})`);
    
    if (typeof actualizarHeaderUsuario === 'function') {
        actualizarHeaderUsuario();
    }
    
    if (typeof aplicarControlDeAcceso === 'function') {
        console.log('🔄 Aplicando control de acceso...');
        aplicarControlDeAcceso();
    } else {
        console.error('❌ aplicarControlDeAcceso() no está disponible');
    }
    
    if (typeof volverInicio === 'function') {
        volverInicio();
    }
}

// ==========================================
// AUTO-LOGIN ADMIN (para testing)
// ==========================================

function autoLoginAdmin() {
    const resultado = loginUsuario('admin@usnews.com', 'admin123');
    
    if (resultado.exito) {
        alert(`✅ Logueado como Admin\n\nRol: ${resultado.usuario.rol}`);
        actualizarInterfazDespuesDeLogin();
    } else {
        alert('❌ Error: La cuenta de admin no existe. Ejecuta verificarSistema() en consola.');
    }
}

// ==========================================
// CERRAR SESIÓN
// ==========================================

function cerrarSesionUI() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
        cerrarSesion();
        if (typeof aplicarControlDeAcceso === 'function') {
            aplicarControlDeAcceso();
        }
    }
}

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.mostrarPantallaVerificacion = mostrarPantallaVerificacion;
window.cerrarSesionUI = cerrarSesionUI;

console.log('✅ Login-UI cargado');