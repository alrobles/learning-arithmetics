# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML + CSS + JavaScript puro sin dependencias ni paso de compilación (misma filosofía que `alrobles/atomic-simulation`), con módulos JS puros verificables en Node (`npm test`) y listo para GitHub Pages y uso offline.

## Users

- **Usuario principal:** Un estudiante de 10–13 años que practica aritmética principalmente en computadora (teclado físico rápido, retos exigentes, progreso medible y visualizaciones de alta calidad).
- **Usuario secundario (acompañamiento):** Su padre, quien enseña la división con el algoritmo directo en casita ("saltando pasos") y puede proponer ejercicios personalizados o revisar las estadísticas de dominio por tabla/nivel.

## Product Purpose

Construir una plataforma web interactiva y gamificada de aritmética —empezando con un ecosistema completo para dominar la **división directa en casita (algoritmo saltando pasos)** con divisores de 1 cifra hasta dividendos de 5 cifras y casos difíciles de ceros al cociente— que combine precisión matemática, fluidez de teclado, visualizaciones en tiempo real y progresión exigente sin infantilizar al estudiante.

## Positioning

A diferencia de las apps escolares genéricas que imponen restas largas escritas o pantallas infantiles de opción múltiple, esta plataforma implementa con fidelidad exacta el **algoritmo directo saltando pasos** (cálculo mental de la resta y salto en la misma línea ante ceros al cociente, sin cero inicial), acoplado a visualizaciones interactivas en Canvas 2D (reparto en base 10, radar de múltiplos, comprobación por área y telemetría real de velocidad y dominio por tabla).

## Operating Context

- Uso principal en computadora de escritorio o laptop (teclado numérico y teclas de atajo como entrada principal, con soporte completo de mouse y pantallas táctiles).
- Terminología en español: **divisor**, **dividendo**, **cociente**, **resto**.
- Convención algorítmica confirmada a partir del cuaderno del padre (`45639 ÷ 9 = 5071`, `6418 ÷ 8 = 802`, `3749 ÷ 4 = 937`):
  - Notación de casita (`divisor ⟌ dividendo`) con el cociente alineado columna por columna arriba del dividendo.
  - **Sin cero inicial**: cuando la primera cifra del dividendo es menor que el divisor, se subrayan las dos primeras cifras (marca amarilla) y la primera cifra del cociente se coloca sobre la segunda cifra.
  - **Salto de resta**: la multiplicación y la resta se hacen mentalmente y solo se escribe el resto parcial de una cifra directamente debajo de la columna activa.
  - **Cero al cociente en la misma línea**: cuando al bajar una cifra el número parcial es menor que el divisor (p. ej. `06 < 9` o `01 < 8`), se escribe `0` en el cociente y se baja la siguiente cifra en la misma fila horizontal (`0 6 3`, `0 1 8`), cerrando el resto final con un círculo.
- Foco profundo en divisores de 1 cifra (`2` a `9`) hasta dividendos de 5 cifras, ceros internos, ceros consecutivos y ceros finales.

## Capabilities and Constraints

- Cero dependencias externas en tiempo de ejecución ni en pruebas (`node tests/check.js`).
- Funciona 100 % offline y en GitHub Pages (`https://alrobles.github.io/learning-arithmetics/`).
- Arquitectura modular extensible para incorporar en el futuro otras operaciones aritméticas (multiplicación, fracciones, potencias) sin romper el módulo de división.
- Progreso, rachas, medallas y telemetría de velocidad/precisión por divisor persistidos localmente (`localStorage`), con exportación/reinicio sencillo.
- Diagnóstico inteligente de errores en vivo (pasarse de múltiplo, dejar un resto ≥ divisor, olvidar el cero al cociente, fallo en la resta mental).

## Brand Commitments

- Inspiración de ingeniería, claridad didáctica, rigor visual y estructura de vistas/plantillas de `alrobles/atomic-simulation` (portada editorial + laboratorio de múltiples vistas enlazadas con lenguaje visual coherente y pruebas unitarias en Node).
- Estética y tono de **producto gamificado de alta gama** para un joven de 10–13 años: exigente, nítido, visualmente sorprendente y técnico-táctil (nunca caricaturesco ni infantil).

## Evidence on Hand

- Cuaderno manuscrito del padre con 3 ejemplos canónicos (`45639 ÷ 9`, `3749 ÷ 4`, `6418 ÷ 8`) que sirven como casos de prueba exactos y como reto especial "Cuaderno de Papá".
- Repositorio de referencia local `/home/alrobles/GitHub/atomic-simulation` para aprender patrones de visualización en Canvas 2D, arquitectura multipágina sin build y pruebas en Node.
- Repositorio destino: `https://github.com/alrobles/learning-arithmetics`.

## Product Principles

1. **Fidelidad exacta al método:** Cada celda, subrayado amarillo, salto de cero en la misma línea y resto rodeado reproduce exactamente el algoritmo que el estudiante practica en papel.
2. **Entender para saltar:** Visualizaciones reales (bloques de base 10, radar de múltiplos, modo Rayos-X de resta mental y comprobación geométrica `d × c + r = D`) convierten el "truco" en intuición sólida.
3. **Teclado primero, fricción cero:** En computadora, resolver una división completa debe sentirse tan rápido y táctil como tocar un instrumento.
4. **Progresión exigente y honesta:** Dificultad graduada en 8 niveles con métricas reales (precisión, tiempo por paso, debilidad por tabla del 2 al 9, rachas y rangos), sin recompensas vacías.
5. **Cero dependencias, máxima verificabilidad:** Toda la matemática y los algoritmos viven en módulos JS puros cubiertos por pruebas automáticas en Node.

## Accessibility & Inclusion

- Operable 100 % con teclado (números `0–9`, `Backspace`, `Enter`, atajos para pista/Rayos-X/audio) y también en pantallas táctiles con controles ≥ 44 px.
- Contraste WCAG AA+ y soporte de `prefers-reduced-motion`.
- Retroalimentación sonora sintetizada opcional (Web Audio API) con silencio instantáneo.
