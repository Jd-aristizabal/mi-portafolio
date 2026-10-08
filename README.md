# Portafolio de Johan Aristizabal

Portafolio estático construido con SvelteKit, Svelte, TypeScript y CSS. Incluye Focus Flow, Pixel Sprint, Orbit Match, Pulse Orbit, Color Studio y un asistente. Las animaciones respetan movimiento reducido y la interfaz admite aspecto diurno y nocturno.

El inicio permite cambiar entre español e inglés con el selector ES / EN junto al tema. La preferencia se guarda en el navegador y se sincroniza entre pestañas. Las traducciones se centralizan en `src/lib/data/translations.ts` y `skillsEnglish.ts`. Las pantallas de las experiencias conservan su idioma original.

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

La compilación genera `build/`. Las seis rutas están prerenderizadas: `/`, `/works/focus-flow/`, `/works/pixel-sprint/`, `/works/orbit-match/`, `/works/pulse-orbit/` y `/lab/color-studio/`. Vercel publica los archivos estáticos según `vercel.json`.

`pnpm check:preview` comprueba que el HTML y el módulo cliente muestran la misma interfaz tras una edición. Requiere el servidor de desarrollo activo y restaura el archivo después de comprobarlo.

## Experiencias

- Focus Flow organiza tareas y sesiones con la API ya integrada.
- Pixel Sprint: 30 segundos de reflejos, combo y dificultad progresiva. Al guardar, conserva el nombre y la partida en el navegador y envía la puntuación a la API existente.
- Orbit Match: seis parejas, 60 segundos, bonificación por rachas y tiempo restante.
- Pulse Orbit: 40 segundos para tocar cuando el satélite atraviesa el arco. Los aciertos perfectos y las rachas multiplican los puntos.
- Color Studio genera armonías, prueba una composición, calcula contraste y copia colores o variables CSS.

Los tres juegos preguntan por un nombre o apodo al guardar. `arcadeScoreService` mantiene historiales independientes y conserva los mejores resultados aunque se alcance el límite del historial. Orbit Match y Pulse Orbit utilizan guardado local mientras se confirma el contrato de sus rutas de servidor. El ranking global de Pixel Sprint conserva sus datos reales, sin jugadores ficticios. La situación de la integración y las rutas verificadas están documentadas en [Integración API](docs/integracion-api.md).

## Organización

`src/lib/components` contiene UI compartida; `services` contiene acceso a API y almacenamiento; `stores` mantiene estado compartido; `types` define contratos; `data` centraliza configuración; `utils` contiene reglas y cálculos; `animations` contiene acciones y transiciones. Los componentes no acceden directamente a localStorage.

La variable pública `VITE_API_URL` configura la API existente. No se incluyen credenciales ni servicios de servidor. Contacto y descarga del CV se configuran en `src/lib/data/config.ts`. Las tipografías tienen fuentes de sistema como alternativa. Las animaciones ambientales se pausan fuera de pantalla; el átomo conserva su movimiento propio y desactiva parallax en móvil.
