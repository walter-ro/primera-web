// ==========================================
// FIX CRÍTICO DEL SISTEMA DE LOGIN
// Agrega esto AL INICIO de roles.js (línea 1)
// ==========================================

/**
 * ⚠️ IMPORTANTE: Ejecutar ANTES de todo
 * Crea usuarios por defecto si no existen
 */
(function inicializarSistemaUsuarios() {
    console.log('🔧 Inicializando sistema de usuarios...');
    
    // Verificar si ya existe la base de datos de usuarios
    let usuarios = localStorage.getItem('db_usuarios');
    
    if (!usuarios) {
        console.log('📝 Creando base de datos de usuarios por primera vez...');
        
        // Crear usuarios por defecto
        const usuariosPorDefecto = [
            {
                id: 1,
                nombre: 'Super Admin',
                email: 'admin@usnews.com',
                password: 'admin123',
                rol: 'admin',
                fechaCreacion: new Date().toISOString(),
                activo: true
            },
            {
                id: 2,
                nombre: 'Editor Demo',
                email: 'editor@usnews.com',
                password: 'editor123',
                rol: 'editor',
                fechaCreacion: new Date().toISOString(),
                activo: true
            },
            {
                id: 3,
                nombre: 'Usuario Demo',
                email: 'user@usnews.com',
                password: 'user123',
                rol: 'usuario',
                fechaCreacion: new Date().toISOString(),
                activo: true
            }
        ];
        
        localStorage.setItem('db_usuarios', JSON.stringify(usuariosPorDefecto));
        
        console.log(`
        ╔════════════════════════════════════════════╗
        ║  ✅ USUARIOS CREADOS EXITOSAMENTE          ║
        ╠════════════════════════════════════════════╣
        ║  👑 ADMIN:                                 ║
        ║     Email: admin@usnews.com                ║
        ║     Password: admin123                     ║
        ║                                            ║
        ║  ✏️ EDITOR:                                ║
        ║     Email: editor@usnews.com               ║
        ║     Password: editor123                    ║
        ║                                            ║
        ║  👤 USUARIO:                               ║
        ║     Email: user@usnews.com                 ║
        ║     Password: user123                      ║
        ╚════════════════════════════════════════════╝
        `);
    } else {
        console.log('✅ Base de datos de usuarios ya existe');
        
        // Verificar que el admin existe
        const usuariosArray = JSON.parse(usuarios);
        const adminExiste = usuariosArray.some(u => u.email === 'admin@usnews.com');
        
        if (!adminExiste) {
            console.log('⚠️ Admin no encontrado, agregándolo...');
            usuariosArray.push({
                id: Date.now(),
                nombre: 'Super Admin',
                email: 'admin@usnews.com',
                password: 'admin123',
                rol: 'admin',
                fechaCreacion: new Date().toISOString(),
                activo: true
            });
            localStorage.setItem('db_usuarios', JSON.stringify(usuariosArray));
            console.log('✅ Admin agregado');
        }
    }
})();

/**
 * Función de login MEJORADA con debugging
 */
function loginUsuario(email, password) {
    console.log('🔐 Intentando login...');
    console.log('📧 Email:', email);
    
    const usuarios = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    console.log('👥 Total usuarios en DB:', usuarios.length);
    
    // Mostrar todos los emails disponibles (para debugging)
    console.log('📋 Emails en sistema:', usuarios.map(u => u.email));
    
    // Buscar usuario
    const usuario = usuarios.find(u => {
        const emailMatch = u.email.toLowerCase() === email.toLowerCase();
        const passwordMatch = u.password === password;
        const activo = u.activo === true;
        
        console.log(`Verificando ${u.email}:`, {
            emailMatch,
            passwordMatch,
            activo
        });
        
        return emailMatch && passwordMatch && activo;
    });
    
    if (usuario) {
        console.log('✅ Login exitoso:', usuario.nombre);
        
        // Establecer usuario actual
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
    
    console.log('❌ Login fallido');
    return {
        exito: false,
        mensaje: 'Email o contraseña incorrectos'
    };
}

/**
 * Función de EMERGENCIA para resetear todo
 * Ejecuta esto en consola si nada funciona: resetearSistema()
 */
window.resetearSistema = function() {
    if (!confirm('⚠️ ADVERTENCIA: Esto eliminará TODO (usuarios, noticias, estadísticas)\n\n¿Continuar?')) {
        return;
    }
    
    localStorage.clear();
    console.log('🗑️ Todo eliminado');
    location.reload();
}

/**
 * Función para VERIFICAR el sistema
 * Ejecuta esto en consola: verificarSistema()
 */
window.verificarSistema = function() {
    console.log('🔍 VERIFICACIÓN DEL SISTEMA');
    console.log('==========================');
    
    const usuarios = JSON.parse(localStorage.getItem('db_usuarios')) || [];
    console.log('👥 Usuarios:', usuarios.length);
    usuarios.forEach(u => {
        console.log(`  - ${u.nombre} (${u.email}) [${u.rol}] ${u.activo ? '✅' : '❌'}`);
    });
    
    const usuarioActual = JSON.parse(localStorage.getItem('usuario_actual'));
    console.log('\n👤 Usuario actual:', usuarioActual ? usuarioActual.nombre : 'Visitante');
    
    const noticias = JSON.parse(localStorage.getItem('db_noticias')) || [];
    console.log('\n📰 Noticias:', noticias.length);
    
    const stats = JSON.parse(localStorage.getItem('db_estadisticas'));
    console.log('\n📊 Estadísticas:', stats ? 'Sí' : 'No');
    
    console.log('\n🔑 Credenciales de prueba:');
    console.log('Admin: admin@usnews.com / admin123');
    console.log('Editor: editor@usnews.com / editor123');
    console.log('Usuario: user@usnews.com / user123');
}

/**
 * Función para login rápido (desarrollo)
 * Ejecuta en consola: loginRapido('admin') o loginRapido('editor')
 */
window.loginRapido = function(tipo = 'admin') {
    const credenciales = {
        admin: { email: 'admin@usnews.com', password: 'admin123' },
        editor: { email: 'editor@usnews.com', password: 'editor123' },
        usuario: { email: 'user@usnews.com', password: 'user123' }
    };
    
    const cred = credenciales[tipo];
    if (!cred) {
        console.log('❌ Tipo inválido. Usa: "admin", "editor" o "usuario"');
        return;
    }
    
    const resultado = loginUsuario(cred.email, cred.password);
    
    if (resultado.exito) {
        console.log(`✅ Logueado como ${tipo}`);
        location.reload();
    } else {
        console.log('❌ Error en login');
    }
}

// Reemplazar la función anterior de loginUsuario
window.loginUsuario = loginUsuario;

