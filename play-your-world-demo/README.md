# Play Your World — MVP

**Concepto:** grabas un video corto de tu entorno real, dibujas superficies y obstáculos con el dedo y después juegas sobre ese mismo video con un personaje pequeño que corre automáticamente y salta con un toque.

## Estado

MVP web/PWA funcional, sin backend y sin dependencias externas. Está pensado para validar el núcleo del producto en Android antes de portar la lógica a Flutter/Flame o encapsularla como app nativa.

### Loop implementado

1. **Grabar video** con la cámara trasera o elegir uno del dispositivo.
2. **Editar** el nivel sobre el video pausado.
3. Dibujar **superficies libres y curvas**.
4. Dibujar **obstáculos**.
5. Colocar **START** y **FINISH**.
6. Elegir velocidad del personaje.
7. **PLAY:** el personaje corre automáticamente, la gravedad funciona y un toque salta.
8. Caídas y obstáculos activan un **crash exagerado**.
9. Guardado local de niveles mediante **IndexedDB**, incluyendo el video.
10. Instalable como **PWA** y con caché offline del shell de la app.

## Cómo probar

La cámara del navegador necesita un contexto seguro: `https://` o `localhost`.

Desde esta carpeta puedes servirla con cualquier servidor estático:

```bash
python3 -m http.server 8080
```

## Controles

- **Editor:** arrastra para dibujar superficies u obstáculos.
- **Inicio/Meta:** selecciona la herramienta y toca el escenario.
- **Juego:** toca cualquier parte para saltar.

## Decisión técnica del MVP

Las líneas físicas son **fijas respecto a la pantalla**. El video funciona como fondo visual y sus objetos no son seguidos automáticamente. Por eso se recomienda grabar con cámara quieta o con movimientos muy suaves.

Esto es deliberado para validar primero el concepto **GRABAR → DIBUJAR → JUGAR** sin introducir visión artificial, tracking ni AR.

## Arquitectura

- `index.html` — pantallas y estructura UI.
- `styles.css` — UI móvil horizontal.
- `app.js` — cámara, MediaRecorder, editor, física, personaje, persistencia local.
- `manifest.webmanifest` — instalación PWA.
- `service-worker.js` — caché offline del shell.
- `icon.svg` — icono provisional.

## Física

El editor guarda todas las coordenadas en valores normalizados `0..1`. Las curvas dibujadas se simplifican y después se usan como cadenas de segmentos. El gameplay calcula soporte bajo los pies del personaje, gravedad, pendientes, huecos, aterrizajes, hazards y meta.

## Limitaciones conocidas

- No hay tracking de objetos del video.
- No hay visión artificial ni detección automática.
- Los videos guardados viven solo en el dispositivo/navegador actual.
- No hay exportación automática de replay a MP4 todavía.
- El personaje es procedural y provisional; no usa sprites finales.
- Los colliders muy verticales se ignoran como suelo para evitar que el personaje “camine por paredes”.

## Siguiente fase

1. Probar sensación del salto y velocidades en Android real.
2. Ajustar física de pendientes/curvas con pruebas reales.
3. Generar replay compartible vertical para TikTok/Reels/Shorts.
4. Añadir armario y cosméticos.
5. Crear tipos `InteractiveSurface` (cuerdas, ganchos, resortes).
6. Tracking de superficies/objetos como versión posterior.
7. Portar a Flutter/Flame o envolver con Capacitor según los resultados de la validación.

> Si una función no hace más rápido o más divertido pasar de **VIDEO REAL** a **JUGAR**, no pertenece al MVP.


## Estado V3 — 27 Sep 2026

La demo pública ahora incluye:

- runner humano simplificado con torso, cabeza, articulaciones, ropa y zapatos;
- cosméticos equipables: gorra, lentes, trail neón y casco;
- tienda prototipo con monedas locales;
- regalo diario y recompensa por completar nivel;
- choque más cómico con ragdoll visual simplificado, partículas y textos BONK/OOF;
- preview visible después de grabar antes de entrar al editor;
- botón Repetir;
- timeline/scrubber para moverse por el video mientras se dibuja;
- cada trazo guarda el segundo del video en el que fue creado para preparar la futura física temporal;
- portada/home más cercana a un juego comercial;
- cache v3 actualizado para evitar servir la versión anterior.

### Próximos saltos grandes

1. Tracking real de superficies/objetos entre frames.
2. Replay exportable 9:16 con CTA/retos compartibles.
3. Física ragdoll completa y animaciones por sprites/esqueleto.
4. Google Play Billing + catálogo remoto + analytics/A-B tests.
5. Rewarded ads opcionales después de validar retención.


## Estado V6 — Replay Engine + viralización

Implementado:

- grabación automática de cada partida como replay vertical;
- composición 720×1280 con branding, gameplay, tiempo y orbes;
- botón final **Compartir video**;
- Web Share API para enviar el archivo a apps compatibles;
- descarga automática del clip como fallback cuando el navegador no permite compartir archivos;
- preferencia por MP4/H.264 si el navegador lo soporta, WebM como respaldo;
- el canvas de gameplay ahora incluye el frame real del video para que el replay contenga escenario + runner;
- ragdoll 2.0: extremidades con movimiento independiente, squash de impacto, partículas, BONK/OOF y shake de cámara;
- coyote time, jump buffer, orbes, combo, XP y misión diaria.

### Próximo bloque

1. tracking ligero/temporal de superficies dibujadas en distintos frames;
2. preview del replay antes de compartir;
3. audio dentro del archivo exportado;
4. retos con ID/enlace para que otra persona juegue el mismo nivel;
5. backend/analytics para retención, shares, conversiones y A/B tests.
