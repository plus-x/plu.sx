import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loaderGLTF = new GLTFLoader();

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2e2e2e);

// Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Create materials with textures
const loader = new THREE.TextureLoader();
const texturePlus = loader.load('public/+.png');
const textureCross = loader.load('public/x.png');

const materialPlus = new THREE.MeshBasicMaterial({ map: texturePlus });
const materialCross = new THREE.MeshBasicMaterial({ map: textureCross });

// Create geometries
const geometryPlus = new THREE.PlaneGeometry(2, 2);
const geometryCross = new THREE.PlaneGeometry(2, 2);

// Create meshes
const meshPlus = new THREE.Mesh(geometryPlus, materialPlus);
const meshCross = new THREE.Mesh(geometryCross, materialCross);

// Position the meshes
meshPlus.position.x = -1.5;
meshCross.position.x = 1.5;

// Add meshes to the scene
scene.add(meshPlus);
scene.add(meshCross);

// Animation function
function animate() {
	requestAnimationFrame(animate);

	// Optional: rotate the meshes
	meshPlus.rotation.z += 0.01;
	meshCross.rotation.z += 0.01;

	controls.update();
	renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate();