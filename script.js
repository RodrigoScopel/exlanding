let scene, camera, renderer;
let geometry, material, pointCloud;
let frameData = {}; // store loaded frames
let frameCount = 240; // total frames you have
let currentFrame = 1;
let lastRenderTime = 0;
const frameDuration = 1000 / 60; // 60 FPS

init();
loadFramesInBackground();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 500);
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

function loadFramesInBackground() {
  for (let i = 1; i <= frameCount; i++) {
    const filename = `/frames/frame.${String(i).padStart(4, '0')}.0.json`;

    fetch(filename)
      .then(res => res.json())
      .then(data => {
        frameData[i] = new Float32Array(data);
        if (i === 1) {
          setupPointCloud(frameData[i]); // render first frame immediately
        }
        console.log(`✅ Loaded: ${filename}`);
      })
      .catch(err => {
        console.warn(`❌ Failed to load ${filename}`, err);
      });
  }
}

function setupPointCloud(buffer) {
  geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(buffer, 3));

  material = new THREE.PointsMaterial({
    size: 5.0,
    color: 0xff00ff,
    transparent: true,
    opacity: 1.0,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  pointCloud = new THREE.Points(geometry, material);
  scene.add(pointCloud);
}

function updatePointCloud(buffer) {
  geometry.attributes.position.array.set(buffer);
  geometry.attributes.position.needsUpdate = true;
}

function animate(timestamp) {
  requestAnimationFrame(animate);

  if (!lastRenderTime || timestamp - lastRenderTime >= frameDuration) {
    const buffer = frameData[currentFrame];
    if (buffer) {
      updatePointCloud(buffer);
      currentFrame++;
      if (currentFrame > frameCount) currentFrame = 1;
    } else {
      // wait until frame is loaded
      console.log(`⏳ Waiting for frame ${currentFrame}`);
    }
    lastRenderTime = timestamp;
  }

  renderer.render(scene, camera);
}
