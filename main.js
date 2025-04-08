// Check if Three.js is loaded
console.log('Three.js version:', THREE ? THREE.REVISION : 'not loaded');

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111); // Darker background for better contrast

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
// Set initial camera position
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
console.log('Camera initialized:', camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
console.log('Renderer initialized:', renderer);

const container = document.getElementById('container');
console.log('Container element:', container);
container.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 50;

// Create a 3D curve with points in all dimensions
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2, -2, 0),
    new THREE.Vector3(-1, 2, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, 2, 0),
    new THREE.Vector3(2, -2, 0)
]);

// Create geometry from the curve with many points for smoothness
const points = curve.getPoints(500);
const geometry = new THREE.BufferGeometry().setFromPoints(points);

// Create multiple lines with slight offsets for better visibility
const createOffsetLine = (offset) => {
    const material = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        linewidth: 1,
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
const offsets = [];
const numLines = 20; // More lines for better visibility
const offsetStep = 0.05; // Larger offset
for (let i = 0; i < numLines; i++) {
    offsets.push(i * offsetStep);
    if (i > 0) offsets.push(-i * offsetStep);
}

offsets.forEach(offset => {
    lineGroup.add(createOffsetLine(offset));
});

// No need for additional scaling since we made the curve bigger
lineGroup.scale.set(1, 1, 1);
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

// Function to calculate screen projection for visibility adjustments
function calculateScreenProjection() {
    const curvePoints = curve.getPoints(100);
    const screenPoints = [];
    
    curvePoints.forEach(point => {
        const vector = point.clone();
        // Transform point to world space
        vector.applyMatrix4(lineGroup.matrixWorld);
        vector.project(camera);
        screenPoints.push(new THREE.Vector2(
            (vector.x + 1) * window.innerWidth / 2,
            (-vector.y + 1) * window.innerHeight / 2
        ));
    });
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    screenPoints.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    });
    
    return {
        width: maxX - minX,
        height: maxY - minY,
        center: new THREE.Vector2((minX + maxX) / 2, (minY + maxY) / 2),
        minX, maxX, minY, maxY
    };
}

// Function to update curve visibility
function updateCurveVisibility() {
    const projection = calculateScreenProjection();
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const visibleSize = Math.max(projection.width, projection.height);
    const screenPercentage = visibleSize / screenSize;
    const baseOpacity = Math.min(1, Math.max(0.3, 1 - screenPercentage));
    
    lineGroup.children.forEach((line, index) => {
        const layerFactor = 1 - (index / lineGroup.children.length) * 0.3;
        line.material.opacity = baseOpacity * layerFactor;
    });
}

// Function to center and scale the curve
function centerCurveInCameraSpace() {
    const projection = calculateScreenProjection();
    const targetScreenCoverage = 0.5;
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const currentSize = Math.max(projection.width, projection.height);
    const scale = (screenSize * targetScreenCoverage) / currentSize;
    
    lineGroup.scale.multiplyScalar(scale);
    
    const center = new THREE.Vector3(
        (projection.center.x / window.innerWidth) * 2 - 1,
        -(projection.center.y / window.innerHeight) * 2 + 1,
        0
    );
    center.unproject(camera);
    lineGroup.position.sub(center);
    
    controls.target.copy(lineGroup.position);
    controls.update();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    centerCurveInCameraSpace();
});

// Create HTML overlay for screen-space indicators
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '20px';
overlay.style.left = '50%';
overlay.style.transform = 'translateX(-50%)';
overlay.style.padding = '15px 25px';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
overlay.style.border = '2px solid rgba(255, 255, 255, 0.5)';
overlay.style.color = 'white';
overlay.style.fontFamily = 'Arial, sans-serif';
overlay.style.fontSize = '18px';
overlay.style.fontWeight = 'bold';
overlay.style.borderRadius = '8px';
overlay.style.zIndex = '1000';
overlay.style.pointerEvents = 'none';
container.appendChild(overlay);

// Create a frame to show screen bounds
const createScreenFrame = () => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
        depthTest: false,
        linewidth: 2
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    return line;
};

const screenFrame = createScreenFrame();

// Function to update screen-space indicators
function updateScreenSpaceIndicators(projection) {
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const visibleSize = Math.max(projection.width, projection.height);
    const screenPercentage = (visibleSize / screenSize) * 100;
    
    overlay.innerHTML = `Screen Coverage: ${screenPercentage.toFixed(1)}%<br>Size: ${Math.round(projection.width)} × ${Math.round(projection.height)}px`;
    
    // Update screen frame
    const positions = [];
    const framePoints = [
        new THREE.Vector3(projection.minX, projection.minY, 0),
        new THREE.Vector3(projection.maxX, projection.minY, 0),
        new THREE.Vector3(projection.maxX, projection.maxY, 0),
        new THREE.Vector3(projection.minX, projection.maxY, 0),
        new THREE.Vector3(projection.minX, projection.minY, 0)
    ];
    
    framePoints.forEach(point => {
        const vector = new THREE.Vector3(
            (point.x / window.innerWidth) * 2 - 1,
            -(point.y / window.innerHeight) * 2 + 1,
            0
        );
        vector.unproject(camera);
        positions.push(vector.x, vector.y, vector.z);
    });
    
    screenFrame.geometry.setAttribute('position', 
        new THREE.Float32BufferAttribute(positions, 3));
    screenFrame.geometry.attributes.position.needsUpdate = true;
}

// Update the animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    const projection = calculateScreenProjection();
    updateCurveVisibility();
    updateScreenSpaceIndicators(projection);
    
    renderer.render(scene, camera);
}

// Initial setup
centerCurveInCameraSpace();
animate(); 