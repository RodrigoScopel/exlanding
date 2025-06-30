let scene, camera, renderer;
let pointCloud;
let frameIndex = 0;
const totalFrames = 240;
const frameData = [];

init();
loadAllFrames().then(() => {
  console.log("✅ All frames loaded");
  animate();
});

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 300);  // Adjust based on your point cloud range
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

async function loadAllFrames() {
  for (let i = 1; i <= totalFrames; i++) {
    const filename = `/frames/frame.${String(i).padStart(4, '0')}.0.json`;
    try {
      const res = await fetch(filename);
      const data = await res.json();
      frameData.push(new Float32Array(data));
    } catch (e) {
      console.warn(`⚠️ Failed to load ${filename}`, e);
    }
  }
}

function updatePointCloud(buffer) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(buffer, 3));

  const material = new THREE.PointsMaterial({
    size: 2.0,
    color: 0x00ffff,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  if (pointCloud) scene.remove(pointCloud);
  pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);
}

function animate() {
  requestAnimationFrame(animate);

  const buffer = frameData[frameIndex];
  if (buffer) {
    updatePointCloud(buffer);
    frameIndex = (frameIndex + 1) % frameData.length;
  }

  renderer.render(scene, camera);
}
