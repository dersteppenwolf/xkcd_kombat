# Exec Plan: Back Kick

Estado: Cerrado en `9a6201f Add back kick combo`.

## Objetivo

Implementar una nueva accion de combate `backKick` como combo simple `K, K`.

La experiencia del jugador cambia asi: si presiona dos patadas dentro de la ventana de combo actual, ejecuta una patada mas fuerte y lenta que la patada normal.

Queda fuera del alcance agregar una tecla nueva, un boton tactil nuevo, cambios de IA para que la CPU use este combo, nuevas dependencias o una refactorizacion del sistema de combate.

Suposicion: `back kick` significa una variante/combo de patada activada con `K, K`, no un golpe hacia atras que impacte detras del luchador. Si se requiere golpear hacia atras, este plan debe ajustarse antes de implementar.

## Contexto Actual

- `src/config.js` define `ATTACKS` con `punch`, `kick`, `comboPunch`, `comboKick` y `special`.
- `src/fighter.js` mantiene `comboBuffer` y `comboTimer`; `handleAttackCommand()` detecta `punch,punch` y `punch,kick`.
- `src/fighter.js` usa `attack.animation` para definir `state`; los ataques de patada comparten la animacion/estado `kick`.
- `src/fighter.js` calcula hitboxes en `getAttackBox()` para `kick` y `comboKick` de forma similar.
- `src/game.js` ya conecta teclado y controles tactiles a las claves logicas `punch`, `kick` y `special`; no hace falta agregar input nuevo para `K, K`.
- `tests/game.test.js` ya cubre `K`, combos simples, especial, hitboxes y bloqueo con mocks.
- `Readme.md` y `AGENTS.md` documentan los combos actuales `J, J` y `J, K`.

## Diseño Propuesto

- Agregar `backKick` a `ATTACKS` en `src/config.js`.
- Activar `backKick` desde `handleAttackCommand()` cuando el buffer sea `kick,kick`.
- Reutilizar la animacion visual existente `kick` mediante `animation: 'kick'` para mantener el cambio quirurgico.
- Reutilizar la rama de hitbox de patadas agregando `backKick` junto a `kick` y `comboKick`.
- Balance propuesto inicial: mas dano que `comboKick`, cooldown mayor que `comboKick`, alcance parecido o levemente menor para compensar.
- Mantener compatibilidad con coordenadas logicas `1000x500`; la nueva hitbox usa los mismos campos `range`, `height`, `yOffset` y `xOffset`.
- No cambiar `gameState`; la accion queda bloqueada automaticamente cuando no hay actualizacion de combate porque el loop ya detiene simulacion fuera de `playing`.
- No agregar persistencia nueva.

## Archivos A Modificar

- `src/config.js`: agregar configuracion `backKick` en `ATTACKS`.
- `src/fighter.js`: detectar `kick,kick` y reconocer `backKick` como hitbox de patada.
- `tests/game.test.js`: agregar prueba de combo `K, K` con dano/cooldown esperado.
- `Readme.md`: documentar el nuevo combo en estado, controles/smoke test y backlog si aplica.
- `AGENTS.md`: actualizar smoke test manual para incluir `K,K`.

## Plan De Implementacion

1. Agregar `backKick` en `src/config.js` con valores iniciales conservadores.
2. En `src/fighter.js`, extender `handleAttackCommand()` con la rama `kick,kick` antes del `else` generico.
3. En `src/fighter.js`, incluir `backKick` en la rama de hitbox de patadas de `getAttackBox()`.
4. Agregar una prueba en `tests/game.test.js` que simule `K`, libere input, resetee cooldown como las pruebas actuales de combo, y vuelva a presionar `K` dentro de la ventana.
5. Validar que la prueba compruebe dano total y cooldown de `backKick`, sin depender de una animacion nueva.
6. Actualizar `Readme.md` para listar `K, K` como `back kick` y ajustar el smoke test manual.
7. Actualizar `AGENTS.md` para que futuras sesiones recuerden validar `K,K`.
8. Ejecutar validacion automatica completa.
9. Hacer smoke test manual en navegador verificando `K`, `K,K`, `J,J`, `J,K`, `L`, pausa y controles tactiles.

## Pruebas Y Validacion

Validacion automatica:

```powershell
node --check src\config.js
node --check src\audio.js
node --check src\effects.js
node --check src\fighter.js
node --check src\game.js
node --test tests\game.test.js
```

Checklist manual especifico:

- `K` sigue ejecutando patada normal con dano/cooldown existentes.
- `K, K` dentro de la ventana de combo ejecuta `backKick` y se siente mas pesado que `K`.
- `K, K` fuera de la ventana de combo no dispara `backKick`.
- `J, J`, `J, K` y `L` siguen funcionando.
- En tactil, dos pulsaciones de `PATADA` disparan el combo sin boton nuevo.
- Pausa, cambio de round y game over no dejan la accion atrapada en estado incorrecto.

## Documentacion

- `Readme.md`: actualizar estado del proyecto, controles/combo y smoke test manual.
- `AGENTS.md`: actualizar smoke test manual para incluir `K,K`.
- `PLANS.md`: no requiere cambios.

## Riesgos Y Mitigaciones

- Riesgo: el combo puede desbalancear el combate si tiene demasiado dano o alcance. Mitigacion: usar cooldown mayor que `comboKick` y alcance no superior al especial.
- Riesgo: romper los combos existentes al cambiar el orden de deteccion. Mitigacion: agregar solo la rama `kick,kick` y mantener intactas las ramas `punch,punch` y `punch,kick`.
- Riesgo: la IA podria no bloquear `backKick` si se usa un estado visual nuevo. Mitigacion: reutilizar `animation: 'kick'` para conservar la logica actual de bloqueo contra `kick`.
- Riesgo: controles tactiles podrian repetir eventos de forma distinta al teclado. Mitigacion: no agregar input nuevo y probar doble pulsacion del boton `PATADA`.
- Riesgo: documentacion desactualizada. Mitigacion: actualizar `Readme.md` y `AGENTS.md` en el mismo cambio funcional.

## Validacion Del Plan Con Skill

Revisado con `karpathy-guidelines` antes de finalizar:

- El plan evita sobrecomplicar la solucion: no agrega tecla, boton ni refactor.
- Los cambios son quirurgicos: `ATTACKS`, deteccion de combo, hitbox, pruebas y documentacion.
- La suposicion principal esta explicita: `back kick` se interpreta como combo `K, K`.
- Los criterios de aceptacion son comprobables con pruebas unitarias y smoke test manual.
- No introduce dependencias externas.

## Criterios De Aceptacion

- `K, K` activa `backKick` dentro de `COMBO_WINDOW_FRAMES`.
- `backKick` aplica el dano y cooldown configurados.
- `K` normal conserva comportamiento actual.
- `J, J`, `J, K` y `L` no regresan.
- La prueba unitaria nueva pasa junto con las pruebas existentes.
- `Readme.md` y `AGENTS.md` documentan `K,K`.
- La validacion automatica completa pasa.

## Commit Y Push

- Un solo commit funcional para codigo, pruebas y documentacion de `backKick`.
- Ejecutar validacion automatica completa antes del commit.
- Hacer push solo si el usuario lo pide.

## Resultado

- Implementado y publicado en `9a6201f Add back kick combo`.
- Validacion automatica completada con `21` pruebas pasando.
- `K, K` quedo documentado en ayuda, `Readme.md` y `AGENTS.md`.
