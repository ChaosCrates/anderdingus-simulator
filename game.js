let scene, camera, renderer;
let player, enemy;
let speed = 0.15;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 5, 25);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // FLOOR
  const floorGeo = new THREE.BoxGeometry(50, 1, 50);
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -1;
  scene.add(floor);

  // PLAYER
  const playerGeo = new THREE.BoxGeometry(1, 1, 1);
  const playerMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
  player = new THREE.Mesh(playerGeo, playerMat);
  scene.add(player);

  // ENEMY (ANDERDINGUS)
  const enemyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const enemyMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  enemy = new THREE.Mesh(enemyGeo, enemyMat);
  enemy.position.set(5, 0, 5);
  scene.add(enemy);

  camera.position.z = 5;
  camera.position.y = 2;

  window.addEventListener("resize", onWindowResize);

  document.addEventListener("keydown", keyMove);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// PC CONTROLS
function keyMove(e) {
  if (e.key === "w") player.position.z -= speed;
  if (e.key === "s") player.position.z += speed;
  if (e.key === "a") player.position.x -= speed;
  if (e.key === "d") player.position.x += speed;
}

// MOBILE CONTROLS
window.move = function(dir) {
  if (dir === "forward") player.position.z -= speed;
  if (dir === "back") player.position.z += speed;
  if (dir === "left") player.position.x -= speed;
  if (dir === "right") player.position.x += speed;
};

// SIMPLE ENEMY AI
function enemyAI() {
  const dx = player.position.x - enemy.position.x;
  const dz = player.position.z - enemy.position.z;

  enemy.position.x += dx * 0.01;
  enemy.position.z += dz * 0.01;
}

// BASIC SOUND (heartbeat vibe)
function playSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.frequency.value = 60;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

setInterval(playSound, 3000);

// GAME LOOP
function animate() {
  requestAnimationFrame(animate);

  enemyAI();

  // camera follow
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5;
  camera.lookAt(player.position);

  // lose condition
  const dist = player.position.distanceTo(enemy.position);
  if (dist < 1) {
    document.getElementById("status").innerText =
      "YOU GOT CAUGHT BY ANDERDINGUS 💀 REFRESH TO RESTART";
  }

  renderer.render(scene, camera);
}
