# Exec Plan: Preview De Arena En Menu

## Objetivo

Implementar la primera actividad del backlog priorizado: mostrar un preview visual de la arena seleccionada en la pantalla inicial.

La experiencia cambia en que el jugador ve una mini-representacion, nombre y descripcion/chiste de la arena antes de iniciar partida. Queda fuera del alcance cambiar reglas de combate, balance, fisica, hitboxes, persistencia o el render del canvas principal.

## Contexto Actual

- `src/index.html` tiene el selector `#arena-select` dentro del menu principal.
- `src/game.js` maneja `selectedArena`, `setArena(...)`, `getArenaLabel()` y `renderLanguage()`.
- `src/i18n.js` contiene nombres de arenas en espanol/ingles.
- `src/styles.css` ya contiene layout del menu inicial y estilos responsivos.
- `tests/game.test.js` usa mocks DOM y puede inspeccionar `className`, `textContent` y estado expuesto.

## Diseño Propuesto

- Agregar un bloque `#arena-preview` debajo de opciones de partida en el menu.
- Renderizar preview con DOM/CSS, no con otro canvas, para evitar duplicar o acoplar `drawBackground()`.
- Usar clases `arena-preview--<arena>` para dar color/tema visual.
- Agregar titulo y descripcion traducibles con claves `arenaPreview*`.
- Actualizar `setArena(...)` y `renderLanguage()` para refrescar el preview.
- Mantener todo visual y sin dependencias.

## Archivos A Modificar

- `src/index.html`: markup del preview.
- `src/styles.css`: estilos y temas del preview.
- `src/i18n.js`: textos de descripcion de arenas.
- `src/game.js`: render del preview y actualizacion al cambiar arena/idioma.
- `tests/game.test.js`: cobertura del preview y traduccion.
- `Readme.md`: marcar preview como implementado y moverlo al backlog completado.
- `plans/plan_0015_preview_arena_menu.md`: este plan.

## Plan De Implementacion

1. Agregar estructura HTML del preview en el menu principal.
2. Agregar estilos base y variantes por arena.
3. Agregar claves i18n para descripciones de arenas.
4. Implementar `renderArenaPreview()` y llamarlo desde `setArena()` y `renderLanguage()`.
5. Exponer estado del preview en tests y agregar pruebas.
6. Actualizar README.
7. Ejecutar validacion completa.
8. Hacer commit de esta actividad antes de pasar a la siguiente.

## Pruebas Y Validacion

```powershell
git diff --check
node --check src\i18n.js
node --check src\config.js
node --check src\audio.js
node --check src\effects.js
node --check src\ai.js
node --check src\fighter_render.js
node --check src\fighter.js
node --check src\game.js
node --test tests\game.test.js
```

Smoke test manual:

- Abrir menu inicial.
- Cambiar arena y confirmar que preview, titulo y descripcion cambian.
- Cambiar idioma y confirmar que titulo/descripcion del preview cambian.
- Confirmar que iniciar partida sigue funcionando.

## Documentacion

- `Readme.md`: actualizar funcionalidades, backlog priorizado y backlog completado.
- `AGENTS.md`: no requiere cambios.
- `PLANS.md`: no requiere cambios.

## Riesgos Y Mitigaciones

- Riesgo: preview ocupa demasiado espacio en movil. Mitigacion: hacerlo compacto y responsivo.
- Riesgo: duplicar logica visual del canvas. Mitigacion: preview es simbolico por CSS, no intenta replicar `drawBackground()`.
- Riesgo: textos sin traducir. Mitigacion: agregar claves en `es` y `en` y cubrir con tests.

## Validacion Del Plan Con Skill

Se cargo y aplico `karpathy-guidelines` antes de finalizar el plan.

Revision aplicada:

- La solucion es minima y visual.
- No agrega dependencias ni build step.
- No modifica reglas de combate.
- Los criterios de aceptacion son verificables con tests y smoke manual.

## Criterios De Aceptacion

- El menu muestra preview de arena seleccionada.
- El preview cambia al seleccionar otra arena.
- El preview respeta idioma `es`/`en`.
- El README refleja que la actividad fue completada.
- Validacion automatica completa pasa.

## Commit Y Push

- Commit requerido por instruccion del usuario al terminar esta actividad.
- Commit sugerido: `Add arena menu preview`.
- No hacer push salvo pedido explicito.

## Estado De Ejecucion

- Implementado localmente.
- Validacion automatica ejecutada: `48 passed`, `0 failed`.
- Pendiente de commit al momento de esta actualizacion.
