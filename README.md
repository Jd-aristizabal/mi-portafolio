# Portafolio de Johan Aristizabal

Frontend estático con SvelteKit, Svelte, TypeScript y CSS. Incluye portafolio, Focus Flow, Pixel Sprint y un asistente con respuestas predefinidas.

## Desarrollo

Requiere Node.js 22.12 o posterior y pnpm.

```sh
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

Durante el desarrollo, `pnpm check:preview` verifica que el HTML y el módulo cliente entreguen la misma interfaz antes y después de una edición. Requiere `pnpm dev` activo. La prueba agrega temporalmente un atributo de diagnóstico a la página y restaura el archivo al terminar. La detección de archivos usa polling para mantener ambas versiones actualizadas en Windows.

La compilación genera los archivos estáticos en `build/`. Las rutas `/`, `/works/focus-flow` y `/works/pixel-sprint` están prerenderizadas.

La publicación en Vercel se configura en `vercel.json`: instalación reproducible con pnpm 11.19.0, compilación y publicación de `build/`. El preset es Other; no requiere variables de entorno ni servicios de servidor. La vinculación local de Vercel se excluye del repositorio.

## Organización

- `src/lib/components`: componentes compartidos y confirmación accesible.
- `src/lib/stores`: estado y acciones de tareas.
- `src/lib/services`: contratos implementados con almacenamiento local y datos de ejemplo.
- `src/lib/types`: interfaces de repositorios, tareas, sesiones y puntuaciones.
- `src/lib/data`: configuración de contacto, respuestas y datos mock.
- `src/lib/utils`: reglas del juego y formato de tiempo.
- `src/lib/animations`: apariciones por scroll, botones magnéticos, parallax y movimiento de proyectos con APIs nativas.

Los componentes no acceden directamente a localStorage. Para una integración futura, sustituir las implementaciones de `taskService` y `scoreService`, conservando sus interfaces. No se incluyen endpoints, servicios de servidor, autenticación ni bases de datos.

Focus Flow guarda tareas y las últimas 100 sesiones terminadas en este navegador. El temporizador admite 1, 15, 25 y 50 minutos; navegar fuera de la demo termina la sesión en curso sin registrarla. Pixel Sprint dura 30 segundos, aumenta la velocidad cada 7 aciertos y el multiplicador cada 5, hasta ×5. El leaderboard incluye personajes de ejemplo y el mejor resultado local.

Los datos locales no se sincronizan entre dispositivos. Los enlaces y el contacto se configuran en `src/lib/data/config.ts`. El asistente usa reglas locales y no envía mensajes. Las tipografías se cargan desde Google Fonts, con fuentes de sistema como alternativa. Las animaciones respetan la preferencia de movimiento reducido.

El portafolio combina una portada oscura, tipografía editorial, una figura orbital creada con CSS y previews detallados de los proyectos. El movimiento del cursor se habilita únicamente con punteros precisos; en pantallas táctiles las demos se abren directamente al tocar las tarjetas. Los efectos de scroll usan IntersectionObserver y requestAnimationFrame, con limpieza al salir de la página. Las transiciones de navegación no bloquean los enlaces.

Las apariciones comparten un observador. Las animaciones ambientales se pausan fuera de pantalla o cuando la pestaña está oculta; el parallax no solicita frames si su elemento no es visible. El CSS compartido excluye los estilos de la portada anterior.

La sección Skills incluye filtros, selección de tecnología y ejemplos de código que se pueden copiar. El contenido se configura en `src/lib/data/skills.ts`; los iconos SVG se renderizan localmente en `SkillIcon.svelte`. Los ejemplos son texto ilustrativo y no se ejecutan. La sección es navegable con teclado y respeta la preferencia de movimiento reducido.
