const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('score-board');

// --- 사운드 설정 ---
const shootSound = new Audio('shoot.wav');
const explosionSound = new Audio('explosion.wav');

// --- 게임 설정 ---
let score = 0;
let gameOver = false;
let lastShotTime = 0;
const shootCooldown = 250; // 0.25초 쿨다운

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    color: 'cyan',
    speed: 8,
};

const bullets = [];
const bulletSpeed = 10;

const enemies = [];
const enemyRows = 3;
const enemyCols = 10; // 크기가 작아져서 열 추가
let enemySpeedX = 1;
let enemyDirection = 1;
const enemyDownStep = 10;

// --- 적군 생성 ---
for (let i = 0; i < enemyRows; i++) {
    for (let j = 0; j < enemyCols; j++) {
        enemies.push({
            x: 50 + j * 60, // 간격 조정
            y: 40 + i * 40, // 간격 조정
            width: 40,      // 크기 축소
            height: 24,     // 크기 축소
            color: 'magenta',
        });
    }
}

// --- 키 입력 처리 ---
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

function shoot() {
    // 총알이 플레이어 중앙에서 나가도록 조정
    bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 15,
        color: 'yellow',
    });
    shootSound.currentTime = 0;
    shootSound.play();
}

function update() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('게임 오버', canvas.width / 2, canvas.height / 2);
        return;
    }

    // --- 입력 및 로직 업데이트 ---
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['Space']) {
        const now = Date.now();
        if (now - lastShotTime > shootCooldown) {
            shoot();
            lastShotTime = now;
        }
    }

    // 총알 이동
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // 적군 이동
    let changeDirection = false;
    enemies.forEach(enemy => {
        enemy.x += enemySpeedX * enemyDirection;
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            changeDirection = true;
        }
        if (enemy.y + enemy.height > player.y) {
            gameOver = true;
        }
    });

    if (changeDirection) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            enemy.y += enemyDownStep;
        });
    }

    // 충돌 감지
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                explosionSound.currentTime = 0;
                explosionSound.play();
                score += 10;
                scoreBoard.textContent = `점수: ${score}`;
            }
        });
    });

    // --- 그리기 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    requestAnimationFrame(update);
}

// 게임 시작
update();
