---
name: "Cronógrafo Aritmético · learning-arithmetics"
description: "Sistema de diseño de precisión horológica y cuaderno técnico oscuro para el aprendizaje interactivo de la división directa saltando pasos."
colors:
  void-slate: "#0b0e13"
  surface-slate: "#101318"
  surface-chamber: "#161b23"
  surface-chamber-hi: "#1b222c"
  surface-recess: "#0c0f14"
  ink-ivory: "#f2ede2"
  ink-silver: "#c2cad6"
  ink-muted: "#8e98a8"
  brass: "#e5b339"
  brass-bright: "#f5c956"
  sky-blueprint: "#56b6f7"
  emerald-verified: "#38d9a9"
  crimson-remainder: "#e85d56"
typography:
  display:
    fontFamily: "'STIX Two Text', Georgia, serif"
    fontSize: "4.1rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "'STIX Two Text', Georgia, serif"
    fontSize: "2.35rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'STIX Two Text', Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Manrope', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.58
    letterSpacing: "0em"
  numeral:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "18px"
  lg: "28px"
  xl: "44px"
components:
  button-brass:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.surface-slate}"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
  button-brass-hover:
    backgroundColor: "{colors.brass-bright}"
    textColor: "{colors.surface-slate}"
  button-ghost:
    backgroundColor: "{colors.surface-recess}"
    textColor: "{colors.ink-ivory}"
    rounded: "{rounded.sm}"
    padding: "12px 22px"
  chamber:
    backgroundColor: "{colors.surface-chamber}"
    textColor: "{colors.ink-ivory}"
    rounded: "{rounded.lg}"
    padding: "24px"
  recess:
    backgroundColor: "{colors.surface-recess}"
    textColor: "{colors.ink-silver}"
    rounded: "{rounded.md}"
    padding: "16px"
---

## Overview

**Cronógrafo Aritmético** es la identidad visual de `learning-arithmetics`. Traduce el rigor científico sin dependencias de `alrobles/atomic-simulation` al universo de un cronógrafo de precisión en pizarra antracita, latón cepillado y marfil grabado, pensado para estudiantes de 10–13 años en computadora.

Cada elemento visual cumple una función aritmética verificable: las columnas de la casita obedecen una rejilla estricta donde ninguna cifra se desplaza, el latón representa el resaltador amarillo del cuaderno original y el carmesí rodea el resto final.

## Colors

- **Superficies tonales (oscuro de estudio):** `surface-slate` (`#101318`) como plano principal, `surface-chamber` (`#161b23`) para paneles instrumentales elevados y `surface-recess` (`#0c0f14`) para pozos de Canvas 2D y la casita activa.
- **Tinta y legibilidad:** `ink-ivory` (`#f2ede2`) para texto primario (> 14:1 sobre `#101318`), `ink-silver` (`#c2cad6`) para párrafos y `ink-muted` (`#8e98a8`) para etiquetas secundarias (≥ 5.4:1).
- **Roles matemáticos fijos en todas las vistas:**
  - `brass` (`#e5b339`): acción primaria, subrayado continuo de agrupamiento inicial (`45`, `64`, `37`), foco activo de teclado y ceros al cociente.
  - `sky-blueprint` (`#56b6f7`): divisor, bloques de comprobación y vista Rayos-X.
  - `emerald-verified` (`#38d9a9`): cifras verificadas del cociente y comprobación exacta (`resto 0`).
  - `crimson-remainder` (`#e85d56`): resto final no nulo rodeado en círculo, brecha de resto en el radar y alertas pedagógicas.

## Typography

Las tres fuentes se sirven localmente en `fonts/*.woff2` (100 % offline, soporte completo `latin` y `latin-ext` para español):

- **Display y titulares (`STIX Two Text`):** serif matemática/editorial en estilo romano (sin itálicas exageradas en héroe), peso `700`.
- **Interfaz y cuerpo (`Manrope`):** sans geométrica-humanista limpia (`400`, `600`, `700`), medida de lectura `50–65ch`.
- **Datos y rejilla de casita (`JetBrains Mono`):** reservada exclusivamente para cifras, casita, temporizadores y telemetría con `font-variant-numeric: tabular-nums`.

## Layout

- **Barra superior fija (`64px`):** emblema circular `÷`, enlaces planos a las 6 vistas, indicadores de racha/XP/rango y control de sonido.
- **Portada (`index.html`):** composición asimétrica `1.04fr / 1.16fr` en el primer pantallazo (mensaje + banco cronográfico vivo), seguida de una sección de talleres asimétrica (pieza protagonista + cuadrícula `2×2`).
- **Talleres (`division.html`, `reparto.html`, `tablas.html`):** pantalla de trabajo dividida en escena interactiva a la izquierda (`1.24fr`–`1.45fr`) y banda de visualizadores Canvas 2D sincronizados a la derecha (`0.75fr`–`0.96fr`).
- **Adaptación:** en pantallas `≤ 1040px` las columnas apilan limpiamente; en punteros táctiles todos los controles garantizan altura mínima de `44px`.

## Elevation & Depth

La profundidad se construye mediante capas tonales (`#0c0f14` → `#101318` → `#161b23`), bordes de 1 px (`rgba(242, 237, 226, 0.11)` o `rgba(229, 179, 57, 0.36)`) y una única sombra suave con desplazamiento vertical (`0 26px 60px -28px rgba(0, 0, 0, 0.82)`). No se emplean halos de neón sin desplazamiento ni tarjetas anidadas.

## Shapes

- Cámaras principales: `18px`; pozos interiores y tarjetas de nivel: `12px`; botones y teclas numéricas: `8px`; píldoras de telemetría y diales: `999px` / `50%`.
- La casita (`⟌`) se traza en SVG vectorial (`vector-effect="non-scaling-stroke"`, `stroke-width: 3`) sobre la rejilla CSS columnar.

## Components

- **Casita Directa (`.casita-grid`):** rejilla CSS de `54px` (`44px` compacta, `42px` móvil) con subrayado amarillo continuo (`.c-hl`), celda activa en latón con cursor parpadeante, animación descendente al bajar cifras y círculo de tinta sobre el resto final.
- **Tira de prueba Rayos-X (`.xray-strip`):** banda punteada en azul técnico que revela la resta mental antes de confirmarla.
- **Visualizadores Canvas 2D (`js/visualizers.js`):** DPR-aware, sin dependencias; comparten la paleta exacta de `chronograph.css` (`drawMultipleRadar`, `drawBase10Sharing`, `drawAreaProof`, `drawMasteryDial`).
- **Iconografía:** SVG en línea con trazo uniforme de `1.75px` (`stroke-linecap="round"`, `stroke-linejoin="round"`), nunca emojis como sistema de iconos.

## Do's and Don'ts

- **Sí:** mantener el mismo código de color entre la casita y los tres visualizadores Canvas en todas las vistas futuras (multiplicación, fracciones, potencias).
- **Sí:** priorizar la entrada directa por teclado (`0–9`, atajos de una letra) con diagnóstico específico ante cada error.
- **No:** introducir antetítulos/eyebrows encima de encabezados, bordes laterales gruesos de color en tarjetas, texto en degradado ni mascotas caricaturescas infantiles.
- **No:** revelar la respuesta del paso actual dentro de los visualizadores auxiliares mientras el estudiante está resolviendo sin Rayos-X.
