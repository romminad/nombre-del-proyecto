const preview = document.querySelector('#preview');
const container = document.querySelector('#ar-container');
const status = document.querySelector('#status');
const startButton = document.querySelector('#start-ar');
const stopButton = document.querySelector('#stop-ar');
const guide = document.querySelector('#scan-guide');

const tipografia = await window.tipografiaLista;
tipografia.iniciar();
status.textContent = 'Imprime el target y activa la cámara para verlo animado.';
startButton.disabled = false;

let mindar;
let textura;
let iniciando = false;
let activo = false;
let detectado = false;
let inicio = 0;
let solicitud = 0;

async function prepararAR() {
  if (mindar) return;
  // Carga las librerías al activar AR para mantener ligera la vista previa.
  const [THREE, { MindARThree }, target] = await Promise.all([
    import('three'),
    import('mindar-image-three'),
    fetch('assets/print-target.mind').then((response) => {
      if (!response.ok) throw new Error('No se pudo cargar el target del print.');
      return response.blob();
    }),
  ]);
  const targetURL = URL.createObjectURL(target);
  mindar = new MindARThree({
    container,
    imageTargetSrc: targetURL,
    maxTrack: 1,
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
  });
  mindar.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  textura = new THREE.CanvasTexture(tipografia.canvas);
  textura.encoding = THREE.sRGBEncoding;
  textura.minFilter = THREE.LinearFilter;
  textura.generateMipmaps = false;
  const material = new THREE.MeshBasicMaterial({ map: textura, toneMapped: false });
  const plano = new THREE.Mesh(
    new THREE.PlaneGeometry(1, tipografia.canvas.height / tipografia.canvas.width),
    material,
  );
  const anchor = mindar.addAnchor(0);
  anchor.group.add(plano);

  anchor.onTargetFound = () => {
    if (!activo) return;
    detectado = true;
    inicio = performance.now();
    tipografia.renderizar(0);
    textura.needsUpdate = true;
    guide.hidden = true;
    status.textContent = 'Print reconocido · animación en loop';
  };
  anchor.onTargetLost = () => {
    detectado = false;
    guide.hidden = !activo;
    if (activo) status.textContent = 'Apunta la cámara al print completo.';
  };
}

function liberarCamara() {
  mindar?.renderer.setAnimationLoop(null);
  // También libera el stream si el arranque falló antes de crear el controller.
  mindar?.controller?.stopProcessVideo();
  mindar?.video?.srcObject?.getTracks().forEach((track) => track.stop());
  mindar?.video?.remove();
  if (mindar) {
    mindar.video = null;
    for (const anchor of mindar.anchors) {
      anchor.group.visible = false;
      anchor.visible = false;
    }
  }
}

async function activarCamara() {
  if (iniciando || activo) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    status.textContent = 'Abre esta página con HTTPS o en localhost para usar la cámara.';
    return;
  }
  iniciando = true;
  const solicitudActual = ++solicitud;
  startButton.disabled = true;
  status.textContent = 'Preparando la cámara… Permite el acceso cuando lo pida el navegador.';
  try {
    await prepararAR();
    if (solicitudActual !== solicitud) return;
    tipografia.pausar();
    preview.hidden = true;
    container.hidden = false;
    await mindar.start();
    if (solicitudActual !== solicitud) {
      liberarCamara();
      return;
    }
    activo = true;
    detectado = false;
    startButton.hidden = true;
    stopButton.hidden = false;
    guide.hidden = false;
    status.textContent = 'Apunta la cámara al print completo.';
    mindar.renderer.setAnimationLoop(() => {
      if (detectado) {
        tipografia.renderizar(performance.now() - inicio);
        textura.needsUpdate = true;
      }
      mindar.renderer.render(mindar.scene, mindar.camera);
    });
  } catch (error) {
    liberarCamara();
    if (solicitudActual !== solicitud) return;
    container.hidden = true;
    preview.hidden = false;
    tipografia.iniciar();
    status.textContent = error?.message || 'No se pudo iniciar la cámara. Revisa el permiso del navegador y vuelve a intentarlo.';
    console.error('No se pudo iniciar MindAR:', error);
  } finally {
    iniciando = false;
    startButton.disabled = false;
  }
}

function detenerCamara() {
  solicitud++;
  activo = false;
  detectado = false;
  liberarCamara();
  guide.hidden = true;
  container.hidden = true;
  preview.hidden = false;
  stopButton.hidden = true;
  startButton.hidden = false;
  status.textContent = 'Imprime el target y activa la cámara para verlo animado.';
  tipografia.iniciar();
}

startButton.addEventListener('click', activarCamara);
stopButton.addEventListener('click', detenerCamara);
window.addEventListener('pagehide', () => {
  detenerCamara();
  tipografia.pausar();
});
window.addEventListener('pageshow', () => {
  if (!activo && !iniciando) tipografia.iniciar();
});
