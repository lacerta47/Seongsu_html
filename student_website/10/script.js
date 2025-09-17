
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 가져오기 ---
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    const scoreEl = document.getElementById('score');
    const timeEl = document.getElementById('time');
    const livesEl = document.getElementById('lives');
    const finalScoreEl = document.getElementById('final-score');

    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const mobileControls = document.getElementById('mobile-controls');

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');

    const collisionSound = document.getElementById('collision-sound');
    const gameoverSound = document.getElementById('gameover-sound');
    const levelupSound = document.getElementById('levelup-sound');

    // --- 게임 변수 설정 ---
    let player, obstacles, score, lives, gameTime, gameInterval, obstacleInterval, difficultyInterval;
    let gameRunning = false;
    let keys = {}; // 키보드 입력 상태 저장

    // --- 게임 초기화 함수 ---
    function init() {
        // 캔버스 크기 설정
        const container = document.getElementById('game-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // 플레이어 설정
        player = {
            x: canvas.width / 2 - 20,
            y: canvas.height - 50,
            width: 40,
            height: 40,
            speed: 8,
            dx: 0 // 이동 방향
        };

        // 게임 상태 초기화
        obstacles = [];
        score = 0;
        lives = 3;
        gameTime = 0;
        
        scoreEl.textContent = score;
        livesEl.textContent = lives;
        timeEl.textContent = '0초';

        // 화면 표시
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        if (isMobile()) {
            mobileControls.classList.remove('hidden');
        }
    }

    // --- 게임 시작 함수 ---
    function startGame() {
        init();
        gameRunning = true;

        // 1초마다 시간과 점수 업데이트
        gameInterval = setInterval(() => {
            gameTime++;
            score += 10; // 1초당 10점
            timeEl.textContent = `${gameTime}초`;
            scoreEl.textContent = score;
        }, 1000);

        // 1초마다 장애물 생성
        obstacleInterval = setInterval(spawnObstacle, 1000);

        // 10초마다 난이도 상승
        difficultyInterval = setInterval(increaseDifficulty, 10000);

        // 게임 루프 시작
        gameLoop();
    }

    // --- 게임 종료 함수 ---
    function endGame() {
        gameRunning = false;
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        clearInterval(difficultyInterval);
        
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
        mobileControls.classList.add('hidden');
        
        playSound(gameoverSound);
    }

    // --- 게임 루프 ---
    function gameLoop() {
        if (!gameRunning) return;

        update(); // 상태 업데이트
        draw();   // 그리기
        requestAnimationFrame(gameLoop); // 다음 프레임 요청
    }

    // --- 상태 업데이트 함수 ---
    function update() {
        // 플레이어 이동
        player.x += player.dx;

        // 화면 경계 처리
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }

        // 장애물 이동 및 충돌 감지
        obstacles.forEach((obstacle, index) => {
            obstacle.y += obstacle.speed;

            // 장애물이 화면 밖으로 나갔을 때
            if (obstacle.y > canvas.height) {
                obstacles.splice(index, 1);
            }

            // 충돌 감지
            if (isColliding(player, obstacle)) {
                obstacles.splice(index, 1);
                handleCollision();
            }
        });
    }

    // --- 그리기 함수 ---
    function draw() {
        // 캔버스 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 플레이어 그리기 (흰색 사각형)
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // 장애물 그리기 (색상 적용)
        obstacles.forEach(obstacle => {
            ctx.beginPath();
            ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
            ctx.fillStyle = obstacle.color;
            ctx.fill();
        });
    }

    // --- 장애물 생성 및 종류 결정 함수 ---
    const obstacleTypes = {
        blue:   { color: '#3498db', speed: { min: 2, max: 4 } },
        yellow: { color: '#f1c40f', speed: { min: 4, max: 6 } },
        red:    { color: '#e74c3c', speed: { min: 6, max: 8 } }
    };

    function getObstacleType() {
        // 게임 시간에 따라 확률 조정 (최대 2분까지 점진적 변화)
        const timeFactor = Math.min(gameTime / 120, 1);

        // 시간이 지남에 따라 파란색 확률은 줄고, 노란색/빨간색 확률은 증가
        const blueChance = 0.7 - (0.5 * timeFactor);   // 70% -> 20%
        const yellowChance = 0.25 + (0.25 * timeFactor); // 25% -> 50%
        // redChance는 나머지: 5% -> 30%

        const rand = Math.random();

        if (rand < blueChance) {
            return 'blue';
        } else if (rand < blueChance + yellowChance) {
            return 'yellow';
        } else {
            return 'red';
        }
    }

    function spawnObstacle() {
        const type = getObstacleType();
        const properties = obstacleTypes[type];

        const radius = Math.random() * 10 + 10; // 10 ~ 20
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const speed = Math.random() * (properties.speed.max - properties.speed.min) + properties.speed.min;

        obstacles.push({ x, y: -radius, radius, speed, color: properties.color });
    }

    // --- 충돌 처리 함수 ---
    function handleCollision() {
        lives--;
        livesEl.textContent = lives;
        playSound(collisionSound);

        if (lives <= 0) {
            endGame();
        }
    }

    // --- 충돌 감지 로직 ---
    function isColliding(rect, circle) {
        const distX = Math.abs(circle.x - rect.x - rect.width / 2);
        const distY = Math.abs(circle.y - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + circle.radius)) { return false; }
        if (distY > (rect.height / 2 + circle.radius)) { return false; }

        if (distX <= (rect.width / 2)) { return true; } 
        if (distY <= (rect.height / 2)) { return true; }

        const dx = distX - rect.width / 2;
        const dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    // --- 난이도 상승 함수 ---
    function increaseDifficulty() {
        playSound(levelupSound);
        // 장애물 생성 간격 줄이기 (최소 0.2초)
        if (obstacleInterval > 200) {
            clearInterval(obstacleInterval);
            // 기존보다 좀 더 완만하게 간격을 줄입니다.
            const newInterval = Math.max(200, 1000 - (gameTime / 10) * 20);
            obstacleInterval = setInterval(spawnObstacle, newInterval);
        }
        // 개별 장애물 속도 증가는 제거 (색상별 속도 고정)
    }
    
    // --- 사운드 재생 함수 ---
    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("사운드 재생 오류:", e));
    }

    // --- 모바일 기기 확인 ---
    function isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    // --- 이벤트 리스너 ---
    // 키보드 입력
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            player.dx = -player.speed;
        } else if (e.key === 'ArrowRight') {
            player.dx = player.speed;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            player.dx = 0;
        }
    });

    // 버튼 클릭
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // 모바일 터치
    leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = -player.speed; });
    leftButton.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
    rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); player.dx = player.speed; });
    rightButton.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
    
    // 창 크기 조절 시 캔버스 크기 재설정
    window.addEventListener('resize', () => {
        if (!gameRunning) {
            const container = document.getElementById('game-container');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    });
});
