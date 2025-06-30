let scene, camera, renderer;
let pointCloud;
let frameIndex = 0;
const totalFrames = 120; // change to match your actual number of frames
let frameData = [];

init();
loadAllFrames().then(() => {
  animate();
});

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.z = 2;
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Axes helper
  const axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

async function loadAllFrames() {
  for (let i = 0; i < totalFrames; i++) {
    const filename = `/frames/frame.${i}.0.json`;
    try {
      const res = await fetch(filename);
      const array = await res.json();
      frameData.push(new Float32Array(array));
    } catch (e) {
      console.warn(`Could not load: ${filename}`);
    }
  }
}

function updatePointCloud(vertexArray) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertexArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.2,
    color: 0x00ff00, // bright green
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });

  if (pointCloud) scene.remove(pointCloud);
  pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);
}

function animate() {
  requestAnimationFrame(animate);

  const points = frameData[frameIndex];
  if (points) {
    updatePointCloud(points);
    frameIndex = (frameIndex + 1) % frameData.length;
  }

  renderer.render(scene, camera);
}
