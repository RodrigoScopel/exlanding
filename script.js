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
  const testGeo = new THREE.BufferGeometry();
  testGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const testMat = new THREE.PointsMaterial({ size: 10.0, color: 0xff0000 });
  scene.add(new THREE.Points(testGeo, testMat));
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
      console.log(`✅ Loaded: ${filename} → ${data.length / 3} points`);
      frameData.push(new Float32Array(data));
    } catch (e) {
      console.warn(`❌ Failed to load: ${filename}`, e);
    }
  }
}

function updatePointCloud(buffer) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(buffer, 3));

  const material = new THREE.PointsMaterial({
    size: 5.0,                  // ⬅️ large points
    color: 0x00ffff,            // ⬅️ bright color
    transparent: true,
    opacity: 1.0,
    depthTest: false,           // ⬅️ always render
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  // optional debug log
  console.log(`🎯 Rendering frame with ${buffer.length / 3} points`);

  if (pointCloud) {
    scene.remove(pointCloud);
    pointCloud.geometry.dispose();
    pointCloud.material.dispose();
  }

  pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);
}

function animate() {
  console.log("🔁 Animate loop running", frameIndex);
  requestAnimationFrame(animate);

  const buffer = frameData[frameIndex];
  if (buffer) {
    updatePointCloud(buffer);
    frameIndex = (frameIndex + 1) % frameData.length;
  }

  renderer.render(scene, camera);
}
