import * as THREE from 'three';
import { MazeGenerator } from './maze.js';
import { Controls } from './controls.js';

class Game {
    constructor() {
        // 로딩 화면
        this.loadingScreen = document.getElementById('loading-screen');
        
        // 씬, 카메라, 렌더러
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl-canvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb); // 하늘색 배경

        // 플레이어
        this.player = new THREE.Object3D();
        this.player.position.set(1.5, 0.5, 1.5); // 플레이어 시작 위치
        this.camera.position.set(0, 0, 0); // 카메라는 플레이어에 상대적이므로 0,0,0
        this.player.add(this.camera);
        this.scene.add(this.player);

        // 조명
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 50, 50);
        this.scene.add(dirLight);

        // 컨트롤
        this.controls = new Controls(this.camera, document.getElementById('joystick'));

        // 게임 상태
        this.mazeData = null;
        this.mazeObjects = [];
        this.clock = new THREE.Clock();
        this.gameState = 'menu'; // menu, playing, paused, gameover, clear
        this.stamina = 100;
        this.timeLimit = 300; // 5분

        this.initDOM();
        this.animate();
    }

    initDOM() {
        // UI 요소
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameClearScreen = document.getElementById('game-clear-screen');
        this.timerElement = document.getElementById('timer');
        this.staminaBar = document.getElementById('stamina-bar');
        this.mapCanvas = document.getElementById('map-canvas');
        this.mapCtx = this.mapCanvas.getContext('2d');

        // 버튼 이벤트
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('run-button').addEventListener('mousedown', () => this.controls.run = true);
        document.getElementById('run-button').addEventListener('mouseup', () => this.controls.run = false);
        document.getElementById('run-button').addEventListener('touchstart', () => this.controls.run = true);
        document.getElementById('run-button').addEventListener('touchend', () => this.controls.run = false);
        
        const restartBtns = ['restart-from-game-over-button', 'restart-from-game-clear-button'];
        restartBtns.forEach(id => document.getElementById(id).addEventListener('click', () => window.location.reload()));

        window.addEventListener('resize', () => this.onWindowResize());
        
        // 초기 화면 설정
        this.menuScreen.classList.add('active');
        this.loadingScreen.classList.remove('active');
    }

    startGame() {
        this.gameState = 'playing';
        this.menuScreen.classList.remove('active');
        this.gameScreen.style.display = 'block';
        document.body.requestPointerLock();

        this.timeLimit = 300;
        this.stamina = 100;
        this.player.position.set(1.5, 0.5, 1.5);

        this.generateAndBuildMaze();
    }

    generateAndBuildMaze() {
        // 기존 미로 제거
        this.mazeObjects.forEach(obj => this.scene.remove(obj));
        this.mazeObjects = [];

        const mazeGenerator = new MazeGenerator(21); // 21x21 크기 미로
        this.mazeData = mazeGenerator.generate();

        const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 });

        for (let y = 0; y < this.mazeData.length; y++) {
            for (let x = 0; x < this.mazeData[y].length; x++) {
                if (this.mazeData[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
                    wall.material.color.setHSL(Math.random(), 0.6, 0.6); // 알록달록한 벽
                    wall.position.set(x + 0.5, 0.5, y + 0.5);
                    this.scene.add(wall);
                    this.mazeObjects.push(wall);
                }
            }
        }
        
        // 바닥 생성
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.mazeData.length, this.mazeData.length),
            new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(this.mazeData.length / 2, 0, this.mazeData.length / 2);
        this.scene.add(floor);
        this.mazeObjects.push(floor);

        this.drawMap();
    }

    update(delta) {
        if (this.gameState !== 'playing') return;

        // 타이머 및 체력 업데이트
        this.updateTimer(delta);
        this.updateStamina(delta);

        // 플레이어 이동
        const moveSpeed = this.controls.run && this.stamina > 0 ? 5 : 2;
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();

        direction.z = this.controls.moveState.forward - this.controls.moveState.backward;
        direction.x = this.controls.moveState.right - this.controls.moveState.left;
        direction.normalize();

        if (this.controls.moveState.forward || this.controls.moveState.backward) {
            velocity.z -= direction.z * moveSpeed * delta;
        }
        if (this.controls.moveState.left || this.controls.moveState.right) {
            velocity.x -= direction.x * moveSpeed * delta;
        }

        // 충돌 감지 전 플레이어의 다음 위치 계산
        const oldPosition = this.player.position.clone();
        this.player.translateX(velocity.x);
        this.player.translateZ(velocity.z);

        // 충돌 처리
        this.checkCollisions(oldPosition);

        // 맵 업데이트
        this.drawMap();
        
        // 탈출 확인
        if (this.player.position.z > this.mazeData.length - 1) {
            this.gameState = 'clear';
            this.gameClearScreen.classList.add('active');
            document.exitPointerLock();
        }
    }
    
    updateTimer(delta) {
        this.timeLimit -= delta;
        const minutes = Math.floor(this.timeLimit / 60);
        const seconds = Math.floor(this.timeLimit % 60);
        this.timerElement.textContent = `시간: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (this.timeLimit <= 0) {
            this.gameState = 'gameover';
            this.gameOverScreen.classList.add('active');
            document.exitPointerLock();
        }
    }

    updateStamina(delta) {
        if (this.controls.run && (this.controls.moveState.forward || this.controls.moveState.backward || this.controls.moveState.left || this.controls.moveState.right)) {
            this.stamina = Math.max(0, this.stamina - 20 * delta);
        } else {
            this.stamina = Math.min(100, this.stamina + 10 * delta);
        }
        this.staminaBar.style.width = this.stamina + '%';
        this.staminaBar.style.backgroundSize = `${(this.stamina / 100) * 200}% 100%`;
    }

    checkCollisions(oldPosition) {
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            this.player.position,
            new THREE.Vector3(0.5, 0.5, 0.5) // 플레이어 충돌 박스 크기
        );

        for (const wall of this.mazeObjects) {
            if (!wall.geometry.boundingBox) wall.geometry.computeBoundingBox();
            const wallBox = wall.geometry.boundingBox.clone().translate(wall.position);

            if (playerBox.intersectsBox(wallBox)) {
                // 충돌 시 이전 위치로 되돌림 (간단한 처리)
                this.player.position.copy(oldPosition);
                return;
            }
        }
    }

    drawMap() {
        const size = this.mazeData.length;
        const mapSize = this.mapCanvas.width;
        const cellSize = mapSize / size;
        this.mapCtx.fillStyle = '#333';
        this.mapCtx.fillRect(0, 0, mapSize, mapSize);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (this.mazeData[y][x] === 0) {
                    this.mapCtx.fillStyle = '#fff';
                    this.mapCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // 플레이어 위치 표시
        const playerX = this.player.position.x / size * mapSize;
        const playerY = this.player.position.z / size * mapSize;
        this.mapCtx.fillStyle = '#ff0000';
        this.mapCtx.beginPath();
        this.mapCtx.arc(playerX, playerY, cellSize, 0, 2 * Math.PI);
        this.mapCtx.fill();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
}

// 게임 시작
window.onload = () => new Game();
