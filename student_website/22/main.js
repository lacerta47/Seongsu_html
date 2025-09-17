
// v4: 전통적인 스크립트 방식으로 변경, 사용자 요청 기능 추가

// --- 전역 변수 설정 ---
let camera, scene, renderer, controls, room;
let windowGroup, isDragging = false;
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -4.95);
const INITIAL_POSITION = { x: 0, y: 0, z: -4.95 };

// --- 초기화 함수 ---
function init() {
    // 1. 장면
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    // 2. 카메라
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    // 3. 렌더러 (그림자 활성화)
    const canvas = document.querySelector('#bg');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // 그림자 기능 활성화!

    // 4. 조명 (그림자 설정 추가)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true; // 이 조명은 그림자를 만듭니다!
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // 5. 방 (노란색, 그림자 받기)
    const roomGeometry = new THREE.BoxGeometry(10, 10, 10);
    const roomMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.BackSide });
    room = new THREE.Mesh(roomGeometry, roomMaterial);
    room.receiveShadow = true; // 이 방은 그림자를 받습니다!
    scene.add(room);

    // 6. 창문 (갈색 프레임, 그림자 드리우기)
    windowGroup = new THREE.Group();
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const frameWidth = 2.5, frameHeight = 3.5, thickness = 0.1, barSize = 0.15;

    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, barSize, thickness), frameMaterial);
    topFrame.position.y = frameHeight / 2 - barSize / 2;
    topFrame.castShadow = true; topFrame.receiveShadow = true;

    const bottomFrame = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, barSize, thickness), frameMaterial);
    bottomFrame.position.y = -frameHeight / 2 + barSize / 2;
    bottomFrame.castShadow = true; bottomFrame.receiveShadow = true;

    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(barSize, frameHeight - 2 * barSize, thickness), frameMaterial);
    leftFrame.position.x = -frameWidth / 2 + barSize / 2;
    leftFrame.castShadow = true; leftFrame.receiveShadow = true;

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(barSize, frameHeight - 2 * barSize, thickness), frameMaterial);
    rightFrame.position.x = frameWidth / 2 - barSize / 2;
    rightFrame.castShadow = true; rightFrame.receiveShadow = true;

    windowGroup.add(topFrame, bottomFrame, leftFrame, rightFrame);
    scene.add(windowGroup);

    // 7. 컨트롤
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 9;

    // 8. 이벤트 리스너
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.getElementById('saveBtn').addEventListener('click', savePosition);
    document.getElementById('newBtn').addEventListener('click', resetPosition);

    // 9. 초기 위치 로드
    loadPosition();
}

// --- 애니메이션 루프 ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// --- 이벤트 핸들러 & 기능 함수 ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateMousePosition(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(windowGroup.children);
    if (intersects.length > 0) {
        isDragging = true;
        controls.enabled = false;
    }
}

function onMouseMove(event) {
    if (isDragging) {
        updateMousePosition(event);
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(wallPlane, intersectPoint);

        const wallLimitX = 4.8 - (2.5 / 2);
        const wallLimitY = 4.8 - (3.5 / 2);
        intersectPoint.x = THREE.MathUtils.clamp(intersectPoint.x, -wallLimitX, wallLimitX);
        intersectPoint.y = THREE.MathUtils.clamp(intersectPoint.y, -wallLimitY, wallLimitY);
        
        windowGroup.position.set(intersectPoint.x, intersectPoint.y, -4.95);
    }
}

function onMouseUp() {
    isDragging = false;
    controls.enabled = true;
}

function savePosition() {
    localStorage.setItem('windowPosition_v4', JSON.stringify(windowGroup.position));
    alert('창문 위치가 저장되었습니다!');
}

function loadPosition() {
    const savedPosition = localStorage.getItem('windowPosition_v4');
    if (savedPosition) {
        windowGroup.position.copy(JSON.parse(savedPosition));
    } else {
        windowGroup.position.set(INITIAL_POSITION.x, INITIAL_POSITION.y, INITIAL_POSITION.z);
    }
}

function resetPosition() {
    if (confirm('정말로 처음 상태로 되돌리시겠어요?')) {
        localStorage.removeItem('windowPosition_v4');
        loadPosition();
    }
}

// --- 실행 ---
init();
animate();
