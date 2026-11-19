# learning-arithmetics · Cronógrafo Aritmético

Plataforma web interactiva y gamificada para aprender aritmética en español (HTML + CSS + JavaScript puro, sin dependencias ni compilación), inspirada en la arquitectura modular y las visualizaciones interactivas de [`alrobles/atomic-simulation`](https://github.com/alrobles/atomic-simulation).

El primer módulo completo está dedicado a dominar la **división directa en casita (algoritmo saltando pasos)** con divisores de 1 cifra (2–9) hasta dividendos de 5 cifras, tal como se practica en el cuaderno: **sin cero inicial**, haciendo la **resta mentalmente** y resolviendo los **ceros al cociente en la misma fila horizontal** (`0 6 3`, `0 1 8`).

## Las vistas

| Página | Qué ofrece |
|---|---|
| [`index.html`](index.html) | **Portada**: banco cronográfico interactivo reproduciendo en vivo las 3 divisiones canónicas (`45639 ÷ 9`, `6418 ÷ 8`, `3749 ÷ 4`), radar sincronizado de múltiplos, acceso a los cinco talleres, reto *Cuaderno de Papá* y dial circular de dominio por tabla. |
| [`division.html`](division.html) | **Taller de la Casita Directa**: entrada rápida por teclado físico (`0–9`, `X` Rayos-X, `H` pista, `Enter` siguiente), modos *Niveles 1–8*, *Cuaderno de Papá*, *Contrarreloj 90s* y *Modo Libre*, diagnóstico pedagógico en vivo y tres visualizadores sincronizados en Canvas 2D (radar de múltiplos, reparto en Base 10 y comprobación geométrica `d × c + r = D`). |
| [`reparto.html`](reparto.html) | **Laboratorio de Reparto en Base 10**: bloques por orden de magnitud (`10 000`, `1 000`, `100`, `10`, `1`) repartidos en `d` cámaras iguales con desagrupación animada en espejo con la casita. |
| [`tablas.html`](tablas.html) | **Múltiplos y Restas Relámpago**: entrenamiento de velocidad para las tres micro-habilidades del salto mental (*¿cuántas veces cabe?*, *¿cuánto sobra?* y *¡alerta de cero!*), con modo *Sprint 60s* y enfoque automático en las tablas más débiles. |
| [`aventura.html`](aventura.html) | **Campaña de 8 Niveles**: escalera progresiva con estrellas (1–3), rangos horológicos, dial de precisión por divisor (`÷2` a `÷9`), vitrina de 10 medallas grabadas y respaldo JSON del progreso local. |
| [`guia.html`](guia.html) | **Anatomía y Comparación**: diagrama interactivo de `divisor`, `dividendo`, `cociente` y `resto`, comparador lado a lado entre algoritmo largo y directo (mostrando cuántas filas se ahorran) y explorador de la ley euclídea `D = d × c + r`. |

## Estructura

```text
index.html              portada + banco interactivo en vivo
division.html           taller principal de la casita directa
reparto.html            laboratorio visual de reparto en Base 10
tablas.html             entrenador de reflejos mentales (3 micro-habilidades)
aventura.html           campaña de 8 niveles, telemetría y 10 medallas
guia.html               anatomía interactiva y comparador largo vs directo
css/chronograph.css     sistema de diseño Cronógrafo Aritmético
fonts/                  tipografías autoalojadas (STIX Two Text, Manrope, JetBrains Mono)
js/division-engine.js   motor aritmético puro (UMD: navegador + Node)
js/gamification.js      progresión, telemetría y medallas (UMD: navegador + Node)
js/casita-ui.js         controlador interactivo y de teclado de la casita
js/numpad-drag.js       pad numérico con clic instantáneo y arrastre magnético (Pointer Events)
js/visualizers.js       renderizadores Canvas 2D (radar, Base 10, área y dial)
js/sound.js             síntesis táctil Web Audio API sin archivos externos
js/nav.js               sincronización de barra superior y audio
tests/check.js          batería de pruebas en Node (npm test)
```

## Pruebas y uso local

```bash
npm test          # ejecuta 172 aserciones (incluye 2 400 divisiones generadas)
npm run serve     # levanta un servidor estático local en http://localhost:8080
```

También se ejecuta automáticamente en GitHub Actions (`.github/workflows/test.yml`).

## Licencia

MIT — ver [`LICENSE`](LICENSE). © 2026 Ángel Luis Robles Fernández.
