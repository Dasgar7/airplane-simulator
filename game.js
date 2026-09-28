import * as THREE from 'three';

const SAVE_KEY = 'airsim-save-v1';
const WORLD = 2400;

const NATIONS = [
  { id: 'usa', name: 'United States', x: -720, z: -180, color: 0x3d7a4a, need: 'medical kits', pay: 420 },
  { id: 'can', name: 'Canada', x: -700, z: -520, color: 0xd24a4a, need: 'winter supplies', pay: 380 },
  { id: 'bra', name: 'Brazil', x: -420, z: 420, color: 0x2f9e4f, need: 'vaccines', pay: 510 },
  { id: 'gbr', name: 'United Kingdom', x: 40, z: -420, color: 0x4a6ad2, need: 'engine parts', pay: 360 },
  { id: 'fra', name: 'France', x: 80, z: -360, color: 0x3b6fd2, need: 'art crates', pay: 340 },
  { id: 'deu', name: 'Germany', x: 160, z: -390, color: 0x555555, need: 'machine tools', pay: 400 },
  { id: 'nga', name: 'Nigeria', x: 80, z: 160, color: 0x1f7a3a, need: 'solar panels', pay: 470 },
  { id: 'egy', name: 'Egypt', x: 260, z: 20, color: 0xc2a15a, need: 'water filters', pay: 390 },
  { id: 'ind', name: 'India', x: 560, z: 40, color: 0xd27a2a, need: 'textbooks', pay: 440 },
  { id: 'chn', name: 'China', x: 780, z: -160, color: 0xd23a3a, need: 'circuit boards', pay: 530 },
  { id: 'jpn', name: 'Japan', x: 980, z: -140, color: 0xe8e8f0, need: 'sensor packs', pay: 500 },
  { id: 'aus', name: 'Australia', x: 900, z: 520, color: 0xc9a24a, need: 'fire gear', pay: 480 },
  { id: 'zaf', name: 'South Africa', x: 220, z: 540, color: 0x6aa84f, need: 'clinic tents', pay: 410 },
  { id: 'mex', name: 'Mexico', x: -780, z: 40, color: 0x3aa86a, need: 'relief food', pay: 360 },
  { id: 'arg', name: 'Argentina', x: -400, z: 680, color: 0x5aa0d2, need: 'grain samples', pay: 430 },
];

const PEOPLE = ['Amara', 'Luis', 'Mei', 'Omar', 'Sofia', 'Kenji', 'Aisha', 'Noah', 'Priya', 'Elena'];

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch { return {}; }
}
function save(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ cash: state.cash, jobs: state.jobsDone }));
}

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6eb7ff);
scene.fog = new THREE.Fog(0x9ecfff, 400, 1800);
const camera = new THREE.PerspectiveCamera(62, 1, 0.4, 4000);

const hemi = new THREE.HemisphereLight(0xcfe9ff, 0x3a5a28, 1.05);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff3d0, 1.35);
sun.position.set(400, 600, 200);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(WORLD * 2.2, WORLD * 2.2, 80, 80),
  new THREE.MeshLambertMaterial({ color: 0x1b4f8a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const gpos = ground.geometry.attributes.position;
for (let i = 0; i < gpos.count; i++) {
  gpos.setZ(i, Math.sin(gpos.getX(i) * 0.01) * 2 + Math.cos(gpos.getY(i) * 0.01) * 2);
}

NATIONS.forEach((n) => {
  const land = new THREE.Mesh(
    new THREE.CircleGeometry(90 + Math.random() * 50, 24),
    new THREE.MeshLambertMaterial({ color: n.color })
  );
  land.rotation.x = -Math.PI / 2;
  land.position.set(n.x, 0.6, n.z);
  land.receiveShadow = true;
  scene.add(land);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.2, 18, 8), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
  tower.position.set(n.x, 9, n.z);
  tower.castShadow = true;
  scene.add(tower);
  const beacon = new THREE.Mesh(new THREE.ConeGeometry(6, 14, 8), new THREE.MeshStandardMaterial({ color: 0xffee66, emissive: 0x665500 }));
  beacon.position.set(n.x + 18, 7, n.z + 10);
  n.beacon = beacon;
  scene.add(beacon);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(16, 20), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(n.x + 18, 1.2, n.z + 10);
  scene.add(pad);
});

function makePlane() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.1, 6.2, 6, 12), new THREE.MeshStandardMaterial({ color: 0xf2f6ff, metalness: 0.2, roughness: 0.35 }));
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  g.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(10, 0.18, 2.1), new THREE.MeshStandardMaterial({ color: 0x0e5aa0 }));
  wing.castShadow = true;
  g.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 1.4), new THREE.MeshStandardMaterial({ color: 0x0e5aa0 }));
  tail.position.set(-3.4, 1.1, 0);
  g.add(tail);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.9), new THREE.MeshStandardMaterial({ color: 0x0e5aa0 }));
  stab.position.set(-3.3, 0.4, 0);
  g.add(stab);
  const prop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.18), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  prop.position.set(3.6, 0, 0);
  g.add(prop);
  g.userData.prop = prop;
  return g;
}

const plane = makePlane();
plane.position.set(-720, 40, -180);
scene.add(plane);

const clouds = new THREE.Group();
for (let i = 0; i < 40; i++) {
  const c = new THREE.Mesh(new THREE.SphereGeometry(18 + Math.random() * 20, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
  c.position.set((Math.random() - 0.5) * WORLD * 1.6, 90 + Math.random() * 80, (Math.random() - 0.5) * WORLD * 1.6);
  c.scale.x = 1.8;
  clouds.add(c);
}
scene.add(clouds);

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

const stick = { x: 0, y: 0 };
const stickEl = document.getElementById('stick');
const knob = document.getElementById('knob');
function bindStick(el) {
  const set = (cx, cy) => {
    const r = el.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const max = r.width * 0.38;
    const m = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, max / m);
    stick.x = (dx * k) / max;
    stick.y = (dy * k) / max;
    knob.style.left = (39 + stick.x * 34) + 'px';
    knob.style.top = (39 + stick.y * 34) + 'px';
  };
  const end = () => { stick.x = 0; stick.y = 0; knob.style.left = '39px'; knob.style.top = '39px'; };
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); set(e.clientX, e.clientY); });
  el.addEventListener('pointermove', (e) => { if (e.buttons || e.pressure) set(e.clientX, e.clientY); });
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
bindStick(stickEl);

let throttle = 0.55;
const thrEl = document.getElementById('thr');
const thrKnob = document.getElementById('thrKnob');
function setThr(v) {
  throttle = THREE.MathUtils.clamp(v, 0.05, 1);
  thrKnob.style.bottom = (8 + throttle * 80) + 'px';
}
thrEl.addEventListener('pointerdown', (e) => { thrEl.setPointerCapture(e.pointerId); moveThr(e); });
thrEl.addEventListener('pointermove', (e) => { if (e.buttons) moveThr(e); });
function moveThr(e) {
  const r = thrEl.getBoundingClientRect();
  setThr(1 - (e.clientY - r.top) / r.height);
}

const saved = loadSave();
const state = { cash: saved.cash || 120, jobsDone: saved.jobs || 0, vel: 38, pitch: 0, roll: 0, yaw: 0.4, job: null };
let visitCool = 0;

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.opacity = 1;
  setTimeout(() => { el.style.opacity = 0; }, 2200);
}

function newJob() {
  const dest = NATIONS[Math.floor(Math.random() * NATIONS.length)];
  const person = PEOPLE[Math.floor(Math.random() * PEOPLE.length)];
  state.job = { dest, person, text: person + ' in ' + dest.name + ' needs ' + dest.need + '. Pay $' + dest.pay + '.' };
  document.getElementById('job').innerHTML = '<strong>Contract</strong><br>' + state.job.text;
}

function nearestNation() {
  let best = NATIONS[0], d = Infinity;
  for (const n of NATIONS) {
    const dd = plane.position.distanceTo(new THREE.Vector3(n.x + 18, plane.position.y, n.z + 10));
    if (dd < d) { d = dd; best = n; }
  }
  return { n: best, d };
}

function tryVisit() {
  if (visitCool > 0) return;
  visitCool = 0.8;
  if (!state.job) newJob();
  const { n, d } = nearestNation();
  if (d > 55 || plane.position.y > 28) {
    toast('Get lower and closer to the gold beacon.');
    return;
  }
  if (n.id !== state.job.dest.id) {
    toast('Wrong country — ' + state.job.person + ' is waiting in ' + state.job.dest.name + '.');
    return;
  }
  state.cash += n.pay;
  state.jobsDone += 1;
  save(state);
  toast('Delivered to ' + state.job.person + '! +$' + n.pay);
  newJob();
}

document.getElementById('visit').addEventListener('click', tryVisit);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
newJob();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.033, clock.getDelta());
  visitCool = Math.max(0, visitCool - dt);
  if (keys.ShiftLeft || keys.ShiftRight) setThr(throttle + dt * 0.6);
  if (keys.ControlLeft || keys.ControlRight) setThr(throttle - dt * 0.6);
  if (keys.Space) tryVisit();

  const ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x;
  const iy = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + stick.y;
  state.roll = THREE.MathUtils.damp(state.roll, THREE.MathUtils.clamp(ix, -1, 1) * 0.55, 6, dt);
  state.pitch = THREE.MathUtils.damp(state.pitch, THREE.MathUtils.clamp(iy, -1, 1) * 0.42, 6, dt);
  state.yaw -= state.roll * dt * 1.35;
  const target = 18 + throttle * 92;
  state.vel = THREE.MathUtils.damp(state.vel, target, 2.2, dt);
  const forward = new THREE.Vector3(Math.cos(state.yaw), 0, Math.sin(state.yaw));
  plane.position.addScaledVector(forward, state.vel * dt);
  plane.position.y += -state.pitch * state.vel * dt * 0.55;
  plane.position.y = THREE.MathUtils.clamp(plane.position.y, 4, 220);
  plane.position.x = THREE.MathUtils.clamp(plane.position.x, -WORLD, WORLD);
  plane.position.z = THREE.MathUtils.clamp(plane.position.z, -WORLD, WORLD);
  plane.rotation.set(state.pitch, -state.yaw + Math.PI / 2, -state.roll);
  plane.userData.prop.rotation.x += dt * (8 + throttle * 40);
  NATIONS.forEach((n) => {
    const pulse = 0.7 + Math.sin(performance.now() * 0.006 + n.x) * 0.3;
    n.beacon.scale.setScalar(state.job && state.job.dest.id === n.id ? 1.15 * pulse : 0.7);
  });
  const back = forward.clone().multiplyScalar(-18);
  camera.position.lerp(new THREE.Vector3(plane.position.x + back.x, plane.position.y + 7, plane.position.z + back.z), 1 - Math.pow(0.001, dt));
  camera.lookAt(plane.position.x + forward.x * 20, plane.position.y + 1, plane.position.z + forward.z * 20);
  document.getElementById('cash').textContent = '$' + state.cash;
  document.getElementById('alt').textContent = Math.round(plane.position.y * 28);
  document.getElementById('spd').textContent = Math.round(state.vel * 4.2);
  document.getElementById('jobs').textContent = state.jobsDone;
  renderer.render(scene, camera);
}
loop();
