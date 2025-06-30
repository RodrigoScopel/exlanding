import * as THREE from 'https://cdn.skypack.dev/three';

let scene, camera, renderer;
let pointCloud;
let frameIndex = 0;
const totalFrames = 10;
let frameData = [];

init();
loadAllFrames().then(() => {
  animate();
});

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

async function loadAllFrames() {
  for (let i = 0; i < totalFrames; i++) {
    const filename = `pointcloud_frames/frame.${i}.0.json`;
    const res = await fetch(filename);
    const array = await res.json();
    frameData.push(new Float32Array(array));
  }
}

function updatePointCloud(vertexArray) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertexArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
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
    frameIndex = (frameIndex + 1) % totalFrames;
  }

  renderer.render(scene, camera);
}
