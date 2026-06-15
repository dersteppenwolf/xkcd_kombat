# Exec Plan: Agacharse

Estado: Cerrado en `3a6cdc1 Add crouch controls`.

## Objetivo

Implementar la accion `agacharse` para que el jugador pueda bajar su postura, reducir su hitbox vertical y esquivar algunos golpes altos.

La experiencia del jugador cambia asi: el jugador puede moverse tambien con flechas (`ArrowLeft`, `ArrowRight`, `ArrowUp`) ademas de `A`, `D`, `W`; mantener `C`, `ArrowDown` o el boton tactil `CROUCH` pone al luchador en estado agachado mientras esta en el suelo. Al agacharse, no avanza ni ataca, pero puede evitar golpes altos; si recibe una patada o especial que intersecta la hitbox baja, recibe dano normal.

Queda fuera del alcance agregar ataques agachados, barridas, bloqueo bajo, IA que use agacharse, cambios de energia o nuevos sistemas de animacion.

Suposicion: `agacharse` debe ser una accion nueva y distinta de `bloquear`. No se reutiliza `S` porque actualmente `S` es bloqueo y cambiarlo romperia controles existentes. Las flechas deben funcionar como controles alternativos completos de movimiento: `ArrowLeft` para atras/izquierda, `ArrowRight` para adelante/derecha y `ArrowUp` para saltar.

## Contexto Actual

- `src/fighter.js` controla movimiento, salto, bloqueo, ataques, IA, hitboxes y dibujo del luchador.
- Actualmente el teclado usa `A`, `D` y `W` para moverse y saltar; las flechas no estan mapeadas para el jugador salvo que un control tactil escriba claves logicas como `left`, `right` o `jump`.
- `S` y el boton tactil `BLOCK` activan `state = 'block'` y reducen dano en `takeHit()`.
- `getBodyBox()` siempre devuelve la misma hitbox de cuerpo, sin considerar postura.
- `getAttackBox()` ya usa coordenadas logicas `1000x500` y ataques con cajas rectangulares.
- `attack()` y `handleAttackCommand()` solo bloquean ataques cuando `state === 'block'` o hay cooldown.
- `draw()` ya cambia pose para `walk`, `hit`, `punch`, `kick`, `special` y `block`.
- `src/game.js` registra teclas genericas por `e.key.toLowerCase()` y mapea controles tactiles con claves logicas como `jump`, `block`, `punch`, `kick` y `special`.
- `src/index.html` y `src/styles.css` definen el boton tactil `BLOCK`; no hay boton para agacharse.
- `tests/game.test.js` puede instanciar `Fighter`, invocar controles y comprobar estados, hitboxes indirectas por dano, bloqueo y flujo de juego.
- `Readme.md` y `AGENTS.md` documentan controles y smoke test manual.

## Diseño Propuesto

- Agregar estado visual/logico `crouch`.
- Control de teclado: `ArrowLeft` y `ArrowRight` replican movimiento horizontal, `ArrowUp` replica salto, y `C`/`ArrowDown` activan agacharse.
- Control tactil: agregar boton `CROUCH` con clave logica `crouch`.
- Mantener `S` como bloqueo. Si bloqueo y agacharse estan presionados al mismo tiempo, bloqueo gana para conservar la defensa actual.
- Permitir agacharse solo si el luchador esta en el suelo, sin hitstun y sin ataque activo.
- Mientras `crouch` esta activo, `velX = 0`; no se puede caminar ni atacar.
- Modificar `getBodyBox()` para devolver una hitbox mas baja y corta cuando `state === 'crouch'`.
- Balance inicial de hitbox: el cuerpo agachado debe evitar punetazos altos normales si el posicionamiento lo permite, pero seguir siendo vulnerable a patadas y especiales.
- Dibujar una pose agachada en `draw()` con torso bajo, cabeza mas cerca del suelo y piernas flexionadas, sin crear un sistema de animacion nuevo.
- No modificar `gameState`; fuera de `playing`, la simulacion ya no actualiza controles ni combate.
- No agregar persistencia.

## Archivos A Modificar

- `src/fighter.js`: agregar entrada de agacharse, estado `crouch`, hitbox baja, bloqueo de ataques mientras se esta agachado y pose visual.
- `src/fighter.js`: agregar soporte de flechas para movimiento y salto junto con la entrada de agacharse.
- `src/game.js`: registrar boton tactil `btn-crouch` en `setupMobileControls()`.
- `src/index.html`: documentar `C / ArrowDown` y agregar boton tactil `CROUCH`.
- `src/styles.css`: posicionar y hacer responsive el boton tactil nuevo.
- `tests/game.test.js`: cubrir estado agachado, reduccion de hitbox y vulnerabilidad a patadas.
- `Readme.md`: actualizar controles, funcionalidades y smoke test.
- `AGENTS.md`: actualizar smoke test manual con agacharse.

## Plan De Implementacion

1. En `src/fighter.js`, aceptar `keys.arrowleft` junto con `keys.a`/`keys.left`, `keys.arrowright` junto con `keys.d`/`keys.right`, y `keys.arrowup` junto con `keys.w`/`keys.jump`.
2. En `src/fighter.js`, detectar `keys.c`, `keys.arrowdown` o `keys.crouch` como `crouchPressed`.
3. Aplicar `state = 'crouch'` y `velX = 0` solo si `onGround`, sin cooldown y sin bloqueo activo.
4. Mantener el bloqueo con precedencia sobre agacharse si `keys.s` o `keys.block` estan activos.
5. Actualizar `handleAttackCommand()` y `attack()` para no atacar mientras `state === 'crouch'`.
6. Ajustar `getBodyBox()` para devolver una caja baja cuando el luchador esta agachado.
7. Agregar la pose `crouch` en `draw()` usando ramas locales dentro del dibujo actual, sin helpers nuevos salvo que el codigo quede dificil de leer.
8. En `src/index.html`, documentar `← / → / ↑` como controles alternativos, agregar `C / ↓` a controles y un boton tactil `CROUCH` en la zona izquierda.
9. En `src/game.js`, agregar `crouch: document.getElementById('btn-crouch')` al mapa de controles tactiles.
10. En `src/styles.css`, ubicar `btn-crouch` sin tapar `LEFT`, `RIGHT`, `JUMP` ni `BLOCK`, y ajustar media query movil.
11. Agregar pruebas unitarias en `tests/game.test.js` para movimiento con flechas, salto con `ArrowUp`, estado `crouch`, bloqueo de movimiento/ataque, punetazo alto que falla contra agachado y patada que conecta.
12. Actualizar `Readme.md` y `AGENTS.md` con los nuevos controles y smoke test.
13. Ejecutar validacion automatica completa.
14. Hacer smoke test manual en navegador para teclado y tactil.

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

- `C` activa agacharse mientras se mantiene presionada.
- `ArrowLeft` y `ArrowRight` mueven al jugador igual que `A` y `D`.
- `ArrowUp` salta igual que `W`.
- `ArrowDown` activa agacharse mientras se mantiene presionada.
- En tactil, `CROUCH` activa agacharse durante la partida.
- Soltar el control vuelve a `idle` si no hay otra accion activa.
- `S` sigue bloqueando y reduciendo dano como antes.
- Si `S` y `C` estan presionados, se mantiene bloqueo.
- Agachado no camina ni ataca.
- Agachado puede evitar un punetazo alto, pero una patada cercana sigue golpeando.
- `J`, `K`, `K,K`, `L`, pausa, rondas y game over siguen funcionando.
- La ayuda y los controles moviles no se desbordan en pantalla pequena.

## Documentacion

- `Readme.md`: actualizar estado, controles de teclado/movil, flechas como alternativa de movimiento, smoke test y funcionalidades implementadas.
- `AGENTS.md`: actualizar smoke test manual con flechas, `C`/`ArrowDown`/`CROUCH`.
- `PLANS.md`: no requiere cambios.

## Riesgos Y Mitigaciones

- Riesgo: conflicto con `S` porque ya bloquea. Mitigacion: usar `C` y `ArrowDown`, mantener `S` sin cambios y dar precedencia al bloqueo.
- Riesgo: `ArrowUp` puede hacer scroll en navegador si no se previene. Mitigacion: extender la prevencion de eventos de teclado para flechas durante el juego si el comportamiento aparece en smoke test.
- Riesgo: hitbox demasiado baja que invalide ataques principales. Mitigacion: hacer que punetazo alto pueda fallar, pero patada y especial sigan conectando en rango.
- Riesgo: controles tactiles se saturen. Mitigacion: agregar un boton pequeno en la zona izquierda y validar responsive en media query existente.
- Riesgo: estado `crouch` permita atacar por accidente. Mitigacion: bloquear ataques en `handleAttackCommand()` y `attack()` mientras `state === 'crouch'`.
- Riesgo: pose visual complicada. Mitigacion: usar dibujo simple dentro de `draw()` y no introducir sistema nuevo de animaciones.
- Riesgo: IA o bloqueo interpretan mal el nuevo estado. Mitigacion: no hacer que la IA use `crouch` en este plan y mantener `block` separado.

## Validacion Del Plan Con Skill

Revisado con `karpathy-guidelines` antes de finalizar:

- El plan evita sobrecomplicar la solucion: no agrega ataques agachados, bloqueo bajo ni IA nueva.
- Los cambios son quirurgicos y trazables a `agacharse`.
- La principal ambiguedad esta explicita: no se reutiliza `S` porque ya es bloqueo, y las flechas se agregan como alternativa completa de movimiento.
- Los criterios de aceptacion son comprobables con pruebas unitarias y smoke test manual.
- No introduce dependencias externas.

## Criterios De Aceptacion

- `ArrowLeft`, `ArrowRight` y `ArrowUp` funcionan como alternativas de `A`, `D` y `W`.
- `C`, `ArrowDown` y `CROUCH` activan `state = 'crouch'` durante `playing`.
- `S` conserva comportamiento de bloqueo.
- Agacharse reduce la hitbox vertical del cuerpo.
- Un punetazo alto puede fallar contra un luchador agachado.
- Una patada cercana sigue pudiendo golpear al luchador agachado.
- No se puede atacar mientras se esta agachado.
- La pose agachada se ve distinta de `idle` y `block`.
- Las pruebas unitarias nuevas pasan junto con las existentes.
- `Readme.md` y `AGENTS.md` documentan el nuevo control.
- La validacion automatica completa pasa.

## Commit Y Push

- Un solo commit funcional para codigo, pruebas y documentacion de `agacharse`.
- Ejecutar validacion automatica completa antes del commit.
- Hacer push solo si el usuario lo pide.

## Resultado

- Implementado controles con flechas para mover y saltar.
- Implementado `crouch` con `C`, `ArrowDown` y boton tactil `CROUCH`.
- Implementada hitbox baja que evita punetazos altos y sigue siendo vulnerable a patadas.
- Documentacion actualizada en ayuda, `Readme.md` y `AGENTS.md`.
- Validacion automatica completada con `25` pruebas pasando.
