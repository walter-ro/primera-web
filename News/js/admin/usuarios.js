// ================================
// BASE DE DATOS DE USUARIOS (localStorage)
// CON SISTEMA DE VERIFICACIÓN POR EMAIL
// ================================

// ================================
// 1. INICIALIZACIÓN
// ================================

if (!localStorage.getItem('db_usuarios')) {
    localStorage.setItem('db_usuarios', JSON.stringify([]));
}

if (!localStorage.getItem('db_tokens_verificacion')) {
    localStorage.setItem('db_tokens_verificacion', JSON.stringify([]));
}

// ================================
// 2. FUNCIONES DE BASE DE DATOS
// ================================

function obtenerTodosUsuarios() {
    return JSON.parse(localStorage.getItem('db_usuarios')) || [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
}

function obtenerTokensVerificacion() {
    return JSON.parse(localStorage.getItem('db_tokens_verificacion')) || [];
}

function guardarTokensVerificacion(tokens) {
    localStorage.setItem('db_tokens_verificacion', JSON.stringify(tokens));
}

// ================================
// 3. GENERACIÓN DE TOKENS
// ================================

/**
 * Genera un token único de 6 dígitos
 */
function generarCodigoVerificacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genera un token único largo (para URLs)
 */
function generarTokenURL() {
    return 'verify_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Guarda un token de verificación
 */
function crearTokenVerificacion(userId, email) {
    const tokens = obtenerTokensVerificacion();
    
    const token = {
        userId: userId,
        email: email,
        codigo: generarCodigoVerificacion(),
        tokenURL: generarTokenURL(),
        fechaCreacion: new Date().toISOString(),
        expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        usado: false
    };
    
    tokens.push(token);
    guardarTokensVerificacion(tokens);
    
    return token;
}

// ================================
// 4. REGISTRO CON VERIFICACIÓN
// ================================

/**
 * Registra un nuevo usuario (NO VERIFICADO)
 */
function registrarUsuario(nombre, email, password) {
    const usuarios = obtenerTodosUsuarios();

    // Validar email duplicado
    const existe = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existe) {
        return {
            exito: false,
            mensaje: 'El correo ya está registrado'
        };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            exito: false,
            mensaje: 'El formato del email no es válido'
        };
    }

    // Validar contraseña
    if (password.length < 6) {
        return {
            exito: false,
            mensaje: 'La contraseña debe tener al menos 6 caracteres'
        };
    }

    // Crear usuario NO VERIFICADO
    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        email: email,
        password: password, // ⚠️ En producción: bcrypt.hash(password)
        rol: 'usuario',
        verificado: false,           // ⚠️ IMPORTANTE
        activo: false,               // ⚠️ No puede iniciar sesión hasta verificar
        fechaCreacion: new Date().toISOString(),
        fechaVerificacion: null
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    // Crear token de verificación
    const token = crearTokenVerificacion(nuevoUsuario.id, email);

    // Enviar email (en desarrollo: mostrar en consola)
    enviarEmailVerificacion(email, nombre, token);

    return {
        exito: true,
        mensaje: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
        usuario: nuevoUsuario,
        token: token // Solo para desarrollo
    };
}

// ================================
// 5. ENVÍO DE EMAIL (DESARROLLO/PRODUCCIÓN)
// ================================

/**
 * Envía email de verificación
 * EN DESARROLLO: Muestra en consola
 * EN PRODUCCIÓN: Envía email real
 */
function enviarEmailVerificacion(email, nombre, token) {
    // ⚠️ MODO DESARROLLO: Simular envío
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║           📧 EMAIL DE VERIFICACIÓN (SIMULADO)             ║
╠═══════════════════════════════════════════════════════════╣
║  Para: ${email}
║  
║  Hola ${nombre},
║  
║  Gracias por registrarte en US News!
║  
║  Tu código de verificación es:
║  
║       ${token.codigo}
║  
║  O verifica con este enlace:
║  ${window.location.origin}/verificar?token=${token.tokenURL}
║  
║  Este código expira en 24 horas.
║  
║  ⚠️ DESARROLLO: Copia el código y pégalo en la pantalla
║     de verificación para activar tu cuenta.
║  
╚═══════════════════════════════════════════════════════════╝
        `);
        
        // Mostrar alerta amigable
        alert(`📧 Email simulado enviado a: ${email}\n\nMira la consola del navegador para ver el código de verificación.\n\nCódigo: ${token.codigo}`);
        
        return { exito: true, modo: 'desarrollo' };
    }
    
    // ⚠️ MODO PRODUCCIÓN: Enviar email real
    // Aquí integrarías con un servicio como SendGrid, Mailgun, AWS SES, etc.
    return enviarEmailReal(email, nombre, token);
}

/**
 * Función para envío REAL de emails (cuando esté en producción)
 * Ejemplo con fetch a tu backend que maneje el email
 */
async function enviarEmailReal(email, nombre, token) {
    try {
        const response = await fetch('/api/enviar-verificacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                nombre: nombre,
                codigo: token.codigo,
                tokenURL: token.tokenURL
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al enviar email');
        }
        
        return { exito: true, modo: 'produccion' };
        
    } catch (error) {
        console.error('Error enviando email:', error);
        return { exito: false, error: error.message };
    }
}

// ================================
// 6. VERIFICACIÓN DE CUENTA
// ================================

/**
 * Verifica una cuenta con código de 6 dígitos
 */
function verificarConCodigo(email, codigo) {
    const usuarios = obtenerTodosUsuarios();
    const tokens = obtenerTokensVerificacion();
    
    // Buscar usuario
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!usuario) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    // Si ya está verificado
    if (usuario.verificado) {
        return {
            exito: false,
            mensaje: 'Esta cuenta ya está verificada'
        };
    }
    
    // Buscar token válido
    const token = tokens.find(t => 
        t.email.toLowerCase() === email.toLowerCase() &&
        t.codigo === codigo &&
        !t.usado &&
        new Date(t.expiracion) > new Date()
    );
    
    if (!token) {
        return {
            exito: false,
            mensaje: 'Código inválido o expirado'
        };
    }
    
    // Marcar token como usado
    token.usado = true;
    guardarTokensVerificacion(tokens);
    
    // Activar usuario
    usuario.verificado = true;
    usuario.activo = true;
    usuario.fechaVerificacion = new Date().toISOString();
    guardarUsuarios(usuarios);
    
    return {
        exito: true,
        mensaje: '¡Cuenta verificada exitosamente! Ahora puedes iniciar sesión.',
        usuario: usuario
    };
}

/**
 * Verifica una cuenta con token de URL
 */
function verificarConURL(tokenURL) {
    const usuarios = obtenerTodosUsuarios();
    const tokens = obtenerTokensVerificacion();
    
    // Buscar token válido
    const token = tokens.find(t => 
        t.tokenURL === tokenURL &&
        !t.usado &&
        new Date(t.expiracion) > new Date()
    );
    
    if (!token) {
        return {
            exito: false,
            mensaje: 'El enlace de verificación es inválido o ha expirado'
        };
    }
    
    // Buscar usuario
    const usuario = usuarios.find(u => u.id === token.userId);
    if (!usuario) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    // Si ya está verificado
    if (usuario.verificado) {
        return {
            exito: true,
            mensaje: 'Esta cuenta ya estaba verificada',
            yaVerificado: true
        };
    }
    
    // Marcar token como usado
    token.usado = true;
    guardarTokensVerificacion(tokens);
    
    // Activar usuario
    usuario.verificado = true;
    usuario.activo = true;
    usuario.fechaVerificacion = new Date().toISOString();
    guardarUsuarios(usuarios);
    
    return {
        exito: true,
        mensaje: '¡Cuenta verificada exitosamente! Ahora puedes iniciar sesión.',
        usuario: usuario
    };
}

// ================================
// 7. REENVÍO DE CÓDIGO
// ================================

/**
 * Reenvía código de verificación
 */
function reenviarCodigoVerificacion(email) {
    const usuarios = obtenerTodosUsuarios();
    
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!usuario) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    if (usuario.verificado) {
        return {
            exito: false,
            mensaje: 'Esta cuenta ya está verificada'
        };
    }
    
    // Invalidar tokens antiguos
    const tokens = obtenerTokensVerificacion();
    tokens.forEach(t => {
        if (t.userId === usuario.id) {
            t.usado = true;
        }
    });
    guardarTokensVerificacion(tokens);
    
    // Crear nuevo token
    const nuevoToken = crearTokenVerificacion(usuario.id, email);
    
    // Reenviar email
    enviarEmailVerificacion(email, usuario.nombre, nuevoToken);
    
    return {
        exito: true,
        mensaje: 'Código de verificación reenviado. Revisa tu correo.',
        token: nuevoToken // Solo para desarrollo
    };
}

// ================================
// 8. MODIFICAR LOGIN PARA VALIDAR VERIFICACIÓN
// ================================

/**
 * Login modificado: solo permite usuarios VERIFICADOS
 */
function loginUsuario(email, password) {
    const usuarios = obtenerTodosUsuarios();
    
    const usuario = usuarios.find(u => 
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    
    if (!usuario) {
        return {
            exito: false,
            mensaje: 'Email o contraseña incorrectos'
        };
    }
    
    // ⚠️ VALIDAR VERIFICACIÓN
    if (!usuario.verificado || !usuario.activo) {
        return {
            exito: false,
            mensaje: 'Debes verificar tu cuenta antes de iniciar sesión. Revisa tu correo.',
            requiereVerificacion: true,
            email: usuario.email
        };
    }
    
    // Login exitoso
    const usuarioSesion = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    };
    
    localStorage.setItem('usuario_actual', JSON.stringify(usuarioSesion));
    
    return {
        exito: true,
        mensaje: `¡Bienvenido ${usuario.nombre}!`,
        usuario: usuarioSesion
    };
}

// ================================
// 9. FUNCIONES DE UTILIDAD
// ================================

/**
 * Limpia tokens expirados (ejecutar periódicamente)
 */
function limpiarTokensExpirados() {
    const tokens = obtenerTokensVerificacion();
    const ahora = new Date();
    
    const tokensValidos = tokens.filter(t => new Date(t.expiracion) > ahora);
    
    if (tokensValidos.length !== tokens.length) {
        guardarTokensVerificacion(tokensValidos);
        console.log(`🗑️ Limpieza: ${tokens.length - tokensValidos.length} tokens expirados eliminados`);
    }
}

/**
 * Obtener estadísticas de verificación
 */
function obtenerEstadisticasVerificacion() {
    const usuarios = obtenerTodosUsuarios();
    
    return {
        total: usuarios.length,
        verificados: usuarios.filter(u => u.verificado).length,
        noVerificados: usuarios.filter(u => !u.verificado).length,
        porcentajeVerificacion: ((usuarios.filter(u => u.verificado).length / usuarios.length) * 100).toFixed(1)
    };
}

// ================================
// 10. EXPORTAR FUNCIONES GLOBALES
// ================================

window.registrarUsuario = registrarUsuario;
window.loginUsuario = loginUsuario;
window.verificarConCodigo = verificarConCodigo;
window.verificarConURL = verificarConURL;
window.reenviarCodigoVerificacion = reenviarCodigoVerificacion;
window.obtenerTodosUsuarios = obtenerTodosUsuarios;
window.limpiarTokensExpirados = limpiarTokensExpirados;
window.obtenerEstadisticasVerificacion = obtenerEstadisticasVerificacion;

// ================================
// 11. LIMPIEZA AUTOMÁTICA DE TOKENS
// ================================

/**
 * Inicia la limpieza periódica de tokens expirados
 * Solo se ejecuta UNA VEZ, incluso si el script se recarga
 */
function iniciarLimpiezaAutomatica() {
    // Verificar si ya existe un intervalo activo
    if (window.intervaloLimpiezaTokens) {
        console.log('⚠️ Limpieza de tokens ya está activa');
        return;
    }
    
    // Crear intervalo y guardarlo globalmente
    window.intervaloLimpiezaTokens = setInterval(() => {
        limpiarTokensExpirados();
    }, 60 * 60 * 1000); // Cada 1 hora
    
    console.log('✅ Limpieza automática de tokens iniciada (cada 1 hora)');
    
    // Ejecutar una limpieza inicial inmediatamente
    limpiarTokensExpirados();
}

// Iniciar limpieza cuando cargue el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarLimpiezaAutomatica);
} else {
    // Si el DOM ya está cargado, ejecutar inmediatamente
    iniciarLimpiezaAutomatica();
}

console.log('✅ Sistema de verificación por email inicializado');