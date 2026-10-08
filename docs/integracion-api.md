# Integración con el backend

Frontend: https://jd-aristizabal.vercel.app

API: https://api.18-225-234-22.sslip.io/api/v1

La variable pública `VITE_API_URL` permite sustituir la URL en el siguiente build. Solo contiene la dirección de la API; no configurar claves de Gemini ni contraseñas de PostgreSQL en el frontend.

El navegador conserva un UUID anónimo en `portfolio:client-id` y lo envía mediante `X-Client-ID`. Tareas, sesiones, récords y conversaciones se asocian a esa identidad. Borrar el almacenamiento del navegador pierde el acceso anónimo; no hay login ni sincronización entre dispositivos todavía.

Focus Flow crea, edita, completa y elimina tareas mediante REST. El temporizador crea una sesión real antes de comenzar, la completa al terminar y la cancela al reiniciarse o cambiar duración. Una sesión activa se recupera al recargar. La pausa es local; después de recargar se recupera el tiempo transcurrido desde el inicio en servidor. Estadísticas y gráfico provienen de PostgreSQL. Las tareas y sesiones antiguas guardadas exclusivamente en `focus-flow:v1` no se importan automáticamente.

Pixel Sprint pregunta por un nombre al terminar. Al pulsar Guardar resultado, `arcadeScoreService` conserva nombre y partida en el navegador, y envía score, racha máxima, nivel y duración mediante `scoreService` a la API existente. El ranking global y el récord remoto se mantienen. No se envía un campo de nombre sin disponer del contrato que lo acepte.

Orbit Match y Pulse Orbit guardan nombres, récords e historial local a través del mismo repositorio. Las rutas GET `/api/v1/games/orbit-match/leaderboard` y `/api/v1/games/pulse-orbit/leaderboard` devolvieron 404 durante la integración. No se implementaron rutas nuevas en el servidor ni se enviaron resultados de estos juegos como si fueran Pixel Sprint. Para sincronizarlos hace falta confirmar rutas, campos admitidos y la operación para asociar el nombre del jugador. Los errores de envío de Pixel Sprint conservan la partida local y se comunican en pantalla.

Color Studio se encuentra en `/lab/color-studio/`. Genera paletas en el navegador, calcula contraste y copia colores o variables CSS; no requiere API.

El chatbot envía preguntas y acciones rápidas a Gemini a través de Go. Conserva `conversation_id`, recupera los mensajes después de recargar y presenta respuestas como texto. Los errores de red y límites de solicitudes se muestran sin simular éxito ni reintentar llamadas costosas automáticamente.

El diseño, los estilos, las animaciones y las rutas permanecen en el proyecto SvelteKit original. EC2 contiene únicamente API, PostgreSQL y proxy HTTPS. La API usa CORS restringido al origen publicado en Vercel.

Validación: svelte-check, pruebas de servicios HTTP y stores, y build estático. El backend continúa en EC2; este despliegue no utiliza ECS ni RDS. El hostname provisional depende de la IP pública y del proveedor DNS compartido.
