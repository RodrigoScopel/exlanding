let scene, camera, renderer;
let pointCloud;
let frameIndex = 1; // we'll test just one frame

init();
loadAndShowFrame();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 0, 1); // very close
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

async function loadAndShowFrame() {
  const filename = `/frames/frame.${frameIndex}.0.json`;
  try {
    const res = await fetch(filename);
    const array = await res.json();
    const buffer = new Float32Array(array);

    console.log(`Loaded frame ${frameIndex}`, buffer.length / 3, "points");
    console.log("Sample point:", buffer[0], buffer[1], buffer[2]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(buffer, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff00ff,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    animate();
  } catch (e) {
    console.error("Could not load frame", filename, e);
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
