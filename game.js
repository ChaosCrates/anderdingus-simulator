let scene, camera, renderer, controls;
let objects = [];
let items = [];
let enemy;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let canMove = false;
let keys = {};

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 1, 40);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // LIGHTING (this is what makes it NOT trash anymore)
  const light = new THREE.PointLight(0xaaaaaa, 1);
  light.position.set(0, 10, 0);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0x222222));

  // CONTROLS (first person)
  controls = new THREE.PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  document.body.addEventListener("click", () => controls.lock());

  controls.addEventListener("lock", () => canMove = true);
  controls.addEventListener("unlock", () => canMove = false);

  // FLOOR
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // SIMPLE MAZE WALLS
  createWall(0, 1, -5, 10);
  createWall(5, 1, 0, 10);
  createWall(-5, 1, 5, 10);

  // ITEMS
  createItem(2, 1, 2, "key");
  createItem(-3, 1, -2, "battery");

  // EXIT DOOR
  const exit = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  exit.position.set(0, 1.5, -15);
  exit.name = "exit";
  scene.add(exit);

  objects.push(exit);

  // ANDERDINGUS (enemy)
  enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  enemy.position.set(5, 1, 5);
  scene.add(enemy);

  // INPUT
  document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "e") interact();
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  window.addEventListener("resize", onResize);
}

function createWall(x, y, z, size) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(size, 3, 1),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  wall.position.set(x, y, z);
  scene.add(wall);
  objects.push(wall);
}

function createItem(x, y, z, type) {
  const item = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: type === "key" ? 0xffff00 : 0x00ffff })
  );
  item.position.set(x, y, z);
  item.userData.type = type;
  scene.add(item);
  items.push(item);
}

let inventory = [];

function interact() {
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);

  const hits = ray.intersectObjects(items);

  if (hits.length > 0) {
    const obj = hits[0].object;
    inventory.push(obj.userData.type);

    document.getElementById("msg").innerText =
      "Picked up: " + obj.userData.type;

    scene.remove(obj);
    items = items.filter(i => i !== obj);
  }

  const exitHit = ray.intersectObjects(objects);
  if (exitHit.length > 0 && exitHit[0].object.name === "exit") {
    if (inventory.includes("key")) {
      document.getElementById("msg").innerText =
        "YOU ESCAPED ANDERDINGUS 💀";
    } else {
      document.getElementById("msg").innerText =
        "Need a KEY first.";
    }
  }
}

function enemyAI() {
  const dir = new THREE.Vector3();
  dir.subVectors(controls.getObject().position, enemy.position);
  dir.normalize();
  enemy.position.addScaledVector(dir, 0.03);
}

function movePlayer() {
  if (!canMove) return;

  direction.z = Number(keys["w"]) - Number(keys["s"]);
  direction.x = Number(keys["d"]) - Number(keys["a"]);
  direction.normalize();

  controls.moveRight(direction.x * 0.1);
  controls.moveForward(direction.z * 0.1);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  movePlayer();
  enemyAI();

  renderer.render(scene, camera);
}
