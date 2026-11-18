/* © 2026, Rommina Dolorier todos los derechos reservados.
"Creado para OFF, Chelas y código creativo"

–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
*/

// Espacio horizontal entre letras, en píxeles. Usa 0 para que se toquen.
const espaciadoLetras = 0;

// Intensidad del estirado: 0 = sin efecto, 0.3 = sutil, 1 = dramático.
const intensidadEstirado = 1.2;

// El print, el target y la textura AR deben conservar estas mismas dimensiones.
const anchoPrint = 1080;
const altoPrint = 1440;

// Tiempo para estirar hacia una esquina y volver al centro, en milisegundos.
const duracionPorEsquina = 2400;
// Recorre las esquinas en sentido horario, empezando por la superior izquierda.
const esquinas = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
let img;
let Tipografia;
let limitesLetra;
let inicioAnimacion = 0;
let resolverTipografia;
window.tipografiaLista = new Promise((resolve) => {
  resolverTipografia = resolve;
});

function preload() {
  Tipografia = loadFont('assets/ABCCameraTrial-RegularItalic.otf');
  img = loadImage('assets/gradient-02.svg');
}

// Solo se ejecuta una vez al inicio del programa.

function setup() {
  pixelDensity(1);
  const lienzo = createCanvas(anchoPrint, altoPrint);
  lienzo.parent('preview');
  textFont(Tipografia);
  textSize(349);
  textAlign(LEFT, BASELINE);
  limitesLetra = Tipografia.textBounds('a', 0, 0, 330);
  noLoop();
  renderizarAnimacion(0);
  resolverTipografia({
    canvas: lienzo.elt,
    renderizar: renderizarAnimacion,
    iniciar() {
      inicioAnimacion = millis();
      loop();
    },
    pausar() {
      noLoop();
      renderizarAnimacion(0);
    },
  });
}

function draw() {
  renderizarAnimacion(millis() - inicioAnimacion);
}

// Un tiempo explícito permite exportar exactamente el mismo primer frame.
function renderizarAnimacion(tiempoMs) {
  background('#000000');
  // Reserva un marco fijo: sus textos únicos permiten reconocer la retícula repetida.
  push();
  translate(width * 0.05, height * 0.05);
  scale(0.9);
  fill('#ffffff');
  noStroke();
  imageMode(CENTER);
  
  // Estira hacia una esquina y vuelve suavemente al centro antes de la siguiente.
  const tiempo = tiempoMs / duracionPorEsquina;
  const esquina = esquinas[floor(tiempo) % esquinas.length];
  const progreso = tiempo % 1;
  const estirado = (1 - cos(TWO_PI * progreso)) / 2;
  const posicionX = lerp(0.5, esquina[0], estirado);
  const posicionY = lerp(0.5, esquina[1], estirado);

  // Conserva la cantidad de columnas y filas de la retícula original de 180 px.
  const columnas = max(1, ceil((width - 30) / 180));
  const filas = max(1, ceil(height / 180));
  let y = 0;

  for (let fila = 0; fila < filas; fila++) {
    const alto = tamanoCelda(height, filas, fila, posicionY);
    let x = 0;

    for (let columna = 0; columna < columnas; columna++) {
      const ancho = tamanoCelda(width, columnas, columna, posicionX);

      // Ajusta cada letra a su celda, estirando ambos ejes por separado.
      push();
      translate(x, y);
      scale(max(1, ancho - espaciadoLetras) / limitesLetra.w, alto / limitesLetra.h);
      text('a', -limitesLetra.x, -limitesLetra.y);
      pop();

      x += ancho;
    }

    y += alto;
    blendMode(EXCLUSION);
    image(img, width / 2, height / 2, width, height);
    blendMode(BLEND);
  }
  pop();

  // El marco forma parte tanto del primer frame como del print y la textura AR.
  push();
  fill('#ffffff');
  noStroke();
  textFont(Tipografia);
  textSize(30);
  textAlign(LEFT, CENTER);
  text('OFF / CHELAS Y CÓDIGO', width * 0.05, height * 0.025);
  textAlign(RIGHT, CENTER);
  text('ROMMINA DOLORIER · 2026', width * 0.95, height * 0.975);
  pop();
}

function tamanoCelda(total, cantidad, indice, posicion) {
  const peso = cantidad === 1 ? 0 : map(indice, 0, cantidad - 1, -1, 1);
  // Mantiene un tamaño positivo incluso con la intensidad al máximo.
  const intensidad = constrain(intensidadEstirado, 0, 0.98);
  // Un lado se ensancha y el opuesto se comprime, manteniendo el tamaño total.
  return (total / cantidad) * (1 + peso * (posicion - 0.5) * 2 * intensidad);
}

// El canvas conserva su formato al girar el móvil; CSS ajusta su tamaño visible.
