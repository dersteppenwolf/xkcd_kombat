# Exec Plan: Intro VS Arcade

## Objetivo

Implementar una intro `VS` arcade al iniciar cada round, mostrando `P1`, `AI`, dificultad y arena.

La experiencia cambia en que el combate tiene anticipacion visual antes de empezar. Queda fuera del alcance cambiar reglas, balance, hitboxes, IA, controles, duracion de rounds o persistencia.

## Contexto Actual

- `startRound()` crea luchadores y pone `gameState = 'playing'`.
- `draw()` ya renderiza fondo, luchadores, HUD y mensajes.
- `update()` es el punto que avanza fisica/IA/timer durante `playing`.
- `getDifficultyLabel()` y `getArenaLabel()` ya devuelven textos traducidos.
- `tests/game.test.js` puede inspeccionar `textCalls` y estado expuesto.

## Diseño Propuesto

- Agregar `vsIntroTimer` frame-based.
- `startRound()` inicializa `vsIntroTimer` con una duracion corta.
- Mientras `vsIntroTimer > 0`, `update()` solo reduce el timer y actualiza efectos, sin mover luchadores ni timer de round.
- `draw()` muestra overlay `P1 VS AI`, dificultad, arena y round sobre el canvas.
- Respetar `Reducir movimiento` usando la misma duracion pero sin animacion compleja.
- No agregar nuevos estados de `gameState` para evitar romper flujo y controles.

## Archivos A Modificar

- `src/game.js`: timer y render del overlay VS.
- `tests/game.test.js`: exponer `vsIntroTimer` y validar overlay/bloqueo de simulacion.
- `Readme.md`: documentar intro VS y mover actividad del backlog alto a completado.
- `plans/plan_0016_intro_vs_arcade.md`: este plan.

## Plan De Implementacion

1. Agregar `vsIntroTimer` y duracion constante local.
2. Inicializarlo en `startRound()`.
3. Bloquear avance de simulacion en `update()` mientras el timer este activo.
4. Dibujar `drawVsIntro()` durante `draw()`.
5. Agregar pruebas y actualizar README.
6. Ejecutar validacion completa.
7. Hacer commit de esta actividad.

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

- Iniciar partida y confirmar overlay `P1 VS AI`.
- Confirmar que muestra dificultad y arena actuales.
- Confirmar que el round empieza despues de la intro.
- Confirmar que pausa/menu siguen funcionando.

## Documentacion

- `Readme.md`: actualizar funcionalidades, backlog priorizado y completado.
- `AGENTS.md`: no requiere cambios.

## Riesgos Y Mitigaciones

- Riesgo: romper tests que esperan `gameState = playing`. Mitigacion: no introducir nuevo estado.
- Riesgo: timer de round corre durante intro. Mitigacion: `update()` retorna antes de `updateRoundTimer()`.
- Riesgo: overlay tapa HUD. Mitigacion: es temporal y se dibuja con alpha.

## Validacion Del Plan Con Skill

Se cargo y aplico `karpathy-guidelines` antes de finalizar el plan.

Revision aplicada:

- Cambio visual y acotado.
- Sin dependencias ni nuevos estados persistentes.
- Criterios verificables por tests y smoke manual.

## Criterios De Aceptacion

- Iniciar round muestra `P1 VS AI`.
- Intro incluye dificultad y arena.
- Simulacion/timer no avanzan durante intro.
- Validacion automatica completa pasa.

## Commit Y Push

- Commit requerido al terminar esta actividad.
- Commit sugerido: `Add arcade VS intro`.

## Estado De Ejecucion

- Implementado localmente.
- Validacion automatica ejecutada: `49 passed`, `0 failed`.
- Pendiente de commit al momento de esta actualizacion.
