// Como admin
mostrarPanelWhiskoinAdmin()

// Ver stats de Whiskoin
obtenerEstadisticasWhiskoin(userId)

// Ver info de nivel
obtenerInfoNivel(userId)

// Ver avisos
obtenerAvisosUsuario(userId)

// Forzar recarga (solo admin)
forzarRecarga(userId, cantidad)

// Ver historial de patitas
JSON.parse(localStorage.getItem('db_historial_patitas'))

// Ver usuarios con avisos de farmeo
obtenerEstadisticasFarmeo()

// Cancelar castigo (solo admin)
cancelarCastigo(userId)

// Ver solicitudes de privilegios
obtenerSolicitudesPrivilegios()

⚙️ 9. Configuración Personalizada
Puedes ajustar valores en whiskoin-core.js:
const WHISKOIN_CONFIG = {
    PATITAS_INICIALES: 3,           // Cambiar cantidad inicial
    RECARGA_HORAS: 48,              // Cambiar a 24 para 1 patita/día
    VALOR_PATITA: 100,              // Cambiar valor en puntos
    VALOR_LIKE: 10,                 // Cambiar valor de likes
    // etc...
};

🚨 10. Solución de Problemas
"No se muestran los botones de patita"

Verifica que agregarBotonesWhiskoinAComentario() se llama correctamente
Verifica que el usuario esté logueado
Verifica que el usuario tenga cuenta Whiskoin

"No recarga las patitas"

Verifica que iniciarSistemaRecarga() se ejecute al cargar
Ejecuta manualmente: verificarRecargas()

"No aparece en el header"

Verifica que mostrarInfoWhiskoinEnHeader() se llame después del login
Verifica que exista el elemento con clase .usuario-whiskoin-info


📞 11. Siguiente Paso
Una vez todo instalado, el sistema está completamente funcional en desarrollo.
Cuando subas a producción, solo necesitarás:

Configurar el backend para envío de emails (verificación)
Opcionalmente, mover el almacenamiento de localStorage a base de datos

¡Todo lo demás ya funciona! 🎉