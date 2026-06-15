# Exec Plan: Visualizacion De Combos

Estado: Cerrado en `aa9d665 Improve combo visual feedback`.

## Objetivo

Mejorar la lectura visual de los combos para que el jugador entienda cuando esta construyendo una secuencia y cuando un combo se ejecuto correctamente.

La experiencia del jugador cambia asi: al presionar el primer golpe de una secuencia aparece una pista breve de ventana de combo; al completar `J, J`, `J, K` o `K, K`, el juego muestra un texto especifico y un efecto visual diferenciado cerca del luchador/impacto.

Queda fuera del alcance cambiar reglas de dano, cooldown, hitboxes, controles, IA, audio o agregar animaciones complejas por ataque.

Suposicion: mejorar visualizacion significa mejorar claridad de feedback, no redisenar sprites ni crear un sistema nuevo de animacion.

## Contexto Actual

- `src/config.js` define `ATTACKS`; los combos `comboPunch`, `comboKick` y `backKick` usan `animation: 'punch'` o `animation: 'kick'`.
- `src/fighter.js` detecta combos en `handleAttackCommand()` con `comboBuffer` y `comboTimer`.
- `src/fighter.js` ejecuta ataques en `attack(type, opponent)`, pero no conserva el `type` visual del ataque despues de traducirlo a `state`.
- `src/fighter.js` dibuja poses segun `state`; por eso `comboPunch` se ve como `punch`, y `comboKick`/`backKick` se ven como `kick`.
- `src/game.js` ya tiene `showStatusMessage()` para textos centrales como `ROUND`, `BLOCK`, `K.O.` y `TIME`.
- `src/effects.js` tiene `FloatingText` e `ImpactParticle`, utiles para textos/particulas sin dependencias nuevas.
- `triggerImpactFeedback()` genera particulas iguales para impactos normales y bloqueos, pero no diferencia combos.
- `tests/game.test.js` ya cubre combos y expone `floatingTexts`, `impactParticles`, `statusMessage`, `screenShake` y `hitStopFrames`.
- `Readme.md` reconoce una limitacion actual: las animaciones de combos reutilizan poses base y se diferencian principalmente por dano/rango/feedback.

## Diseño Propuesto

- Agregar un campo ligero en `Fighter`, por ejemplo `lastAttackType`, para saber si el ataque visual actual fue `comboPunch`, `comboKick`, `backKick`, `special`, `punch` o `kick`.
- Agregar un temporizador corto, por ejemplo `comboFlashTimer`, que se active solo cuando se completa un combo.
- En `handleAttackCommand()`, cuando el primer input queda esperando continuacion, mostrar una pista discreta cerca del jugador: `J...` o `K...`.
- Al completar un combo, mostrar un `FloatingText` especifico cerca del atacante o del impacto:
  - `J,J` -> `COMBO x2`
  - `J,K` -> `PUNCH+KICK`
  - `K,K` -> `BACK KICK`
- En `draw()`, si `comboFlashTimer > 0`, dibujar un halo/trail sencillo alrededor del brazo o pierna usando el `lastAttackType`.
- Mantener el cambio en Canvas y JS nativo, sin CSS nuevo salvo que la ayuda/documentacion lo requiera.
- No cambiar `showStatusMessage()` para cada combo por defecto, para no competir con `ROUND`, `BLOCK`, `K.O.` y `TIME`.
- No agregar nuevas clases si `FloatingText` e `ImpactParticle` alcanzan; solo considerar helpers pequenos si el dibujo queda repetido o dificil de leer.
- Mantener coordenadas logicas `1000x500`.

## Archivos A Modificar

- `src/fighter.js`: guardar tipo de ataque, activar feedback de combo, dibujar halo/trail de combo y pista de ventana.
- `src/effects.js`: opcionalmente permitir variaciones menores en `FloatingText` si hace falta distinguir combos sin crear clase nueva.
- `src/game.js`: opcionalmente agregar helper pequeno para feedback de combo si no conviene hacerlo en `Fighter`.
- `tests/game.test.js`: cubrir que completar combos genera feedback visible y no rompe ataques normales.
- `Readme.md`: actualizar limitaciones/funcionalidades si la visualizacion de combos deja de ser una limitacion.
- `AGENTS.md`: actualizar smoke test manual para validar que los combos se distinguen visualmente.

## Plan De Implementacion

1. Agregar campos a `Fighter`: `lastAttackType`, `comboFlashTimer` y, si hace falta, `comboHintTimer`.
2. Decrementar esos timers en `update()` junto a `comboTimer`.
3. En `handleAttackCommand()`, detectar cuando el buffer tiene un solo input y activar una pista breve de ventana de combo.
4. En las ramas `punch,punch`, `punch,kick` y `kick,kick`, llamar a una funcion/metodo local de feedback de combo antes o despues de `attack()`.
5. En `attack(type, opponent)`, guardar `lastAttackType = type` para que `draw()` pueda distinguir combos aunque `state` sea `punch` o `kick`.
6. Usar `FloatingText` para textos de combo con colores diferenciados y posicion cercana al atacante o al punto medio del ataque.
7. Agregar en `draw()` un halo/trail simple para combos: lineas rapidas en brazo para `comboPunch`, arco de pierna para `comboKick` y marca mas pesada para `backKick`.
8. Asegurar que ataques normales `J` y `K` no muestren texto de combo ni halo de combo.
9. Agregar pruebas unitarias para `J,J`, `J,K` y `K,K` que verifiquen `floatingTexts`/timers o `lastAttackType` expuesto por instancia.
10. Agregar prueba de ataque normal para confirmar que no genera feedback de combo.
11. Actualizar `Readme.md` y `AGENTS.md`.
12. Ejecutar validacion automatica completa.
13. Hacer smoke test manual: completar cada combo y confirmar que se distingue visualmente sin tapar HUD ni estado central.

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

- Tras presionar `J` o `K`, aparece una pista discreta de ventana de combo.
- `J,J` muestra feedback visual distinto de un `J` normal.
- `J,K` muestra feedback visual distinto de `J` y `K` normales.
- `K,K` muestra `BACK KICK` o efecto equivalente claramente visible.
- Los textos/halos no ocultan barras de vida, energia, timer ni mensajes `ROUND`/`K.O.`.
- `BLOCK`, `FIGHT!`, `TIME!`, pausa y game over siguen visibles correctamente.
- En movil, los efectos siguen dentro del canvas y no dependen del layout de controles tactiles.
- Las pruebas existentes de dano/cooldown de combos siguen pasando.

## Documentacion

- `Readme.md`: actualizar funcionalidades implementadas, limitaciones conocidas y smoke test manual.
- `AGENTS.md`: actualizar smoke test para incluir feedback visual de `J,J`, `J,K` y `K,K`.
- `PLANS.md`: no requiere cambios.

## Riesgos Y Mitigaciones

- Riesgo: sobrecargar visualmente el combate con demasiados textos. Mitigacion: usar textos cortos, vida breve y no usar mensajes centrales para cada combo.
- Riesgo: mezclar feedback de combo con feedback de impacto. Mitigacion: usar colores/posicion diferentes y mantener particulas de impacto existentes.
- Riesgo: introducir estado visual que se desincronice con `attackCooldown`. Mitigacion: timers cortos independientes y reseteados por ataque/combo.
- Riesgo: romper pruebas por dependencia de efectos aleatorios. Mitigacion: testear presencia de texto/timer, no coordenadas exactas ni particulas aleatorias.
- Riesgo: agrandar demasiado `draw()`. Mitigacion: agregar solo bloques pequenos; si se repite mucho, extraer un helper local minimo dentro de `Fighter`.

## Validacion Del Plan Con Skill

Revisado con `karpathy-guidelines` antes de finalizar:

- El plan evita sobrecomplicar la solucion: no agrega sprites, assets, dependencias ni nuevo sistema de animacion.
- Los cambios son quirurgicos y trazables a feedback visual de combos.
- La suposicion principal esta explicita: se busca claridad de feedback, no cambio de mecanicas.
- Los criterios de aceptacion son comprobables con pruebas unitarias y smoke test manual.
- No introduce dependencias externas.

## Criterios De Aceptacion

- `J,J`, `J,K` y `K,K` tienen feedback visual distinto de ataques normales.
- La ventana de combo tiene una pista breve y no invasiva.
- El dano, cooldown, hitboxes y controles de combos no cambian.
- Ataques normales no muestran feedback de combo.
- Mensajes centrales existentes siguen funcionando.
- La visualizacion funciona en coordenadas logicas del canvas.
- Las pruebas unitarias nuevas pasan junto con las existentes.
- `Readme.md` y `AGENTS.md` quedan actualizados.
- La validacion automatica completa pasa.

## Commit Y Push

- Un solo commit funcional para visualizacion de combos, pruebas y documentacion.
- Ejecutar validacion automatica completa antes del commit.
- Hacer push solo si el usuario lo pide.

## Resultado

- Implementada pista breve de ventana de combo (`J...` / `K...`).
- Implementados textos de combo `COMBO x2`, `PUNCH+KICK` y `BACK KICK`.
- Implementado halo/trail breve para `comboPunch`, `comboKick` y `backKick`.
- Agregadas pruebas unitarias para feedback visual de combos.
- Documentacion actualizada en `Readme.md` y `AGENTS.md`.
