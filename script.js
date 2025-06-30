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
  const filename = `https://raw.githubusercontent.com/RodrigoScopel/exlanding/main/frames/frame.${frameIndex}.0.json`;
  try {
    const res = await fetch(filename);
    const array = await res.json();

    console.log(`✅ Loaded frame: ${filename}`);
    console.log(`→ Total floats: ${array.length}`);
    console.log(`→ First point: [${array[0]}, ${array[1]}, ${array[2]}]`);

    if (array.length < 3) {
      console.warn("⚠️ Frame is empty or invalid");
      return;
    }

    const buffer = new Float32Array(array);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(buffer, 3));

    const material = new THREE.PointsMaterial({
      size: 5.0,               // very large for visibility
      color: 0xff0000,         // bright red
      transparent: false,
      opacity: 1.0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);
    const testGeo = new THREE.BufferGeometry();
    testGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const testMat = new THREE.PointsMaterial({ size: 10.0, color: 0x00ff00 });
    const testPoint = new THREE.Points(testGeo, testMat);
    scene.add(testPoint);

    console.log("✅ PointCloud added to scene");
    animate();
  } catch (e) {
    console.error("❌ Could not load frame", filename, e);
  }
}

function animate() {
  console.log("🔄 Animate loop running");
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
