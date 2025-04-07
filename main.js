// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); // Darker background for better contrast

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000); // Adjusted near plane
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.01;
controls.maxDistance = 100;

// Create a 3D curve with points in all dimensions
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, -0.05, 0),
    new THREE.Vector3(-0.025, 0.05, 0),
    new THREE.Vector3(0, -0.025, 0),
    new THREE.Vector3(0.025, 0.05, 0),
    new THREE.Vector3(0.05, -0.05, 0)
]);

// Create geometry from the curve with many points for smoothness
const points = curve.getPoints(500);
const geometry = new THREE.BufferGeometry().setFromPoints(points);

// Create multiple lines with slight offsets for better visibility
const createOffsetLine = (offset) => {
    const material = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        linewidth: 3,
        transparent: true,
        opacity: 1,
    });
    const line = new THREE.Line(geometry, material);
    line.position.z = offset;
    return line;
};

// Group the lines together
const lineGroup = new THREE.Group();

// Create multiple offset lines for better visibility
const offsets = [0, 0.00005, -0.00005, 0.0001, -0.0001];
offsets.forEach(offset => {
    lineGroup.add(createOffsetLine(offset));
});

// Apply a fixed small scale
const fixedScale = 0.1;
lineGroup.scale.set(fixedScale, fixedScale, fixedScale);
scene.add(lineGroup);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
scene.add(ambientLight);

// Add multiple directional lights for better coverage
const lights = [
    { position: [1, 1, 1], intensity: 3 },
    { position: [-1, -1, -1], intensity: 3 },
    { position: [1, -1, 1], intensity: 2 },
    { position: [-1, 1, -1], intensity: 2 }
];

lights.forEach(light => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, light.intensity);
    directionalLight.position.set(...light.position);
    scene.add(directionalLight);
});

// Function to center the curve
function centerCurve() {
    // Calculate bounding box
    const boundingBox = new THREE.Box3().setFromObject(lineGroup);
    
    // Calculate center of bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    // Reset position
    lineGroup.position.set(0, 0, 0);
    
    // Position camera to view the entire curve
    camera.position.set(0.1, 0.1, 0.1); // Moved camera closer
    camera.lookAt(0, 0, 0);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    centerCurve();
});

// Center the curve initially
centerCurve();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate(); 