let scene, camera, renderer;
let pointCloud;
let frameIndex = 1;

init();
loadAndShowFrame();

function init() {
  scene = new THREE.Scene();

  // Move camera far enough to see a -100 to +100 range
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,    // near
    1000    // far
  );
  camera.position.set(0, 0, 300); // pulled way back
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const axesHelper = new THREE.AxesHelper(50);
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
    const rows = await res.json();

    // Flatten the rows to [x1, y1, z1, x2, y2, z2, ...]
    const flat = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      flat.push(row["P(0)"], row["P(1)"], row["P(2)"]);
    }

    const buffer = new Float32Array(flat);
    console.log("✅ Parsed", buffer.length / 3, "points");

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(buffer, 3));

    const material = new THREE.PointsMaterial({
      size: 5.0,
      color: 0x00ff00,
      transparent: false,
      opacity: 1.0,
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
    animate();
  } catch (e) {
    console.error("❌ Could not load or parse frame", filename, e);
  }
}

function animate() {
  console.log("🔄 Animate loop running");
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
