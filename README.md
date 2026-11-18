# Print tipográfico AR

La animación de p5.js se dibuja como textura de un plano Three.js anclado al print con MindAR 1.2.5. Al reconocer el print, el loop empieza desde el primer frame. Si se pierde el target, la superposición se oculta; al recuperarlo, vuelve a empezar.

## Probar

1. Abre esta carpeta con Live Server, o ejecuta `python3 -m http.server 8000` y abre `http://localhost:8000`.
2. Abre `print.html` e imprime el target completo, sin recortarlo ni alterar sus proporciones. También está disponible en `assets/print-target.png`.
3. En la página principal pulsa **Activar cámara**, permite el acceso y apunta al print. **Volver a la animación** apaga la cámara.

Para probar desde un móvil, sirve la página mediante **HTTPS**; una dirección HTTP de la red local no permite acceder a la cámara. Las librerías se cargan desde CDN y requieren conexión a Internet. No se envían imágenes de la cámara a un servidor: MindAR procesa el vídeo en el navegador.

## Print y primer frame

El print y la animación usan un lienzo fijo de **1080 × 1440 px (3:4)**. CSS lo adapta a la pantalla sin cambiar la retícula. Un marco fijo con los textos de OFF y la autoría aporta detalles únicos para el reconocimiento de la retícula repetida. Forma parte del print y de todos los frames. `assets/print-target.png` es el frame en tiempo 0, y `assets/print-target.mind` contiene los datos de reconocimiento de esa misma imagen.

La repetición de letras puede dificultar el reconocimiento: prueba el print con buena luz, sin reflejos y con todos los bordes visibles. La estabilidad final debe comprobarse con una impresión física y la cámara del dispositivo.

Si cambias la tipografía, el gradiente, el formato o cualquier aspecto del primer frame, abre `tools/compile-target.html`, pulsa **Generar print y target** y guarda ambos archivos en `assets/`, reemplazando los anteriores. No es necesario recompilar al cambiar únicamente la duración del loop.

## Referencias

- [Instalación de MindAR](https://hiukim.github.io/mind-ar-js-doc/installation/)
- [Compilación de targets](https://hiukim.github.io/mind-ar-js-doc/quick-start/compile/)
- [Integración oficial con Three.js, versión 1.2.5](https://github.com/hiukim/mind-ar-js/blob/v1.2.5/src/image-target/three.js)

Three.js se fija en 0.147.0 porque el módulo publicado de MindAR 1.2.5 importa `sRGBEncoding`, disponible en esa versión.
