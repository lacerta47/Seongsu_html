const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

// --- 오디오 컨텍스트 설정 (사운드용) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'shoot') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(784, audioCtx.currentTime); // G5
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'explosion') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(164, audioCtx.currentTime); // E3
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'hit') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.15);
    }
}

// --- 게임 변수 초기화 함수 ---
let player, bullets, enemies, particles, gameOver, gameWon, score, time, enemySpawnRate, stars, enemyBullets, powerUps;

function init() {
    player = {
        x: canvas.width / 2 - 20,
        y: canvas.height - 50,
        width: 40,
        height: 40,
        color: '#0095DD',
        speed: 5,
        hp: 10,
        hitTimer: 0,
        shieldTimer: 0
    };
    bullets = [];
    enemyBullets = [];
    enemies = [];
    powerUps = [];
    particles = [];
    gameOver = false;
    gameWon = false;
    score = 0;
    time = 0;
    enemySpawnRate = 0.02;

    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 1 + 0.2
        });
    }

    restartButton.style.display = 'none';
}

// --- 키보드 & 마우스 입력 ---
const keys = { right: false, left: false, up: false, down: false };
function handleKeyEvent(e, isDown) {
    if (e.key === 'ArrowRight' || e.key === 'Right') keys.right = isDown;
    else if (e.key === 'ArrowLeft' || e.key === 'Left') keys.left = isDown;
    else if (e.key === 'ArrowUp' || e.key === 'Up') keys.up = isDown;
    else if (e.key === 'ArrowDown' || e.key === 'Down') keys.down = isDown;
}

document.addEventListener('keydown', (e) => handleKeyEvent(e, true));
document.addEventListener('keyup', (e) => handleKeyEvent(e, false));
canvas.addEventListener('click', shoot);
restartButton.addEventListener('click', () => {
    init();
    update();
});

function shoot(e) {
    if (gameOver) return;
    bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, color: 'white' });
    playSound('shoot');
}

// --- 그리기 함수들 ---
function drawPlayer() {
    // 쉴드 효과 그리기
    if (player.shieldTimer > 0) {
        ctx.fillStyle = 'rgba(3, 169, 244, 0.3)'; // 쉴드 색상 (투명도)
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
        ctx.fill();
    }

    // 피격 시 깜빡임 효과
    if (player.hitTimer > 0) {
        ctx.globalAlpha = 0.5 + (Math.sin(Date.now() / 10) * 0.5);
    }
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawEnemyBullets() {
    ctx.fillStyle = '#FFEB3B';
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawPowerUps() {
    powerUps.forEach(p => {
        if (p.type === 'shield') {
            ctx.fillStyle = '#03A9F4'; // 밝은 파란색
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // 쉴드 아이콘 'S'
            ctx.fillStyle = 'white';
            ctx.font = 'bold 15px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('S', p.x, p.y);
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.hitTimer > 0 ? 'white' : enemy.color; // 맞았을 때 하얗게, 이제 적의 색상 속성을 사용합니다.
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.closePath();
        ctx.fill();
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
}

function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`잡은 적: ${score} / 10`, 10, 25);
    ctx.fillText(`HP: ${player.hp}`, canvas.width - 100, 25);
    if (player.hitTimer > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gameWon ? 'gold' : 'red';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameWon ? '승리!' : '패배!', canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block';
}

// --- 업데이트 및 이동 함수들 ---
function updateAndMove() {
    // 플레이어
    if (keys.right && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.left && player.x > 0) player.x -= player.speed;
    if (keys.up && player.y > 0) player.y -= player.speed;
    if (keys.down && player.y < canvas.height - player.height) player.y += player.speed;
    if (player.hitTimer > 0) player.hitTimer--;
    if (player.shieldTimer > 0) player.shieldTimer--;

    // 총알
    bullets.forEach((b, i) => { b.y -= 7; if (b.y < 0) bullets.splice(i, 1); });

    // 적군 총알
    enemyBullets.forEach((b, i) => { b.y += 4; if (b.y > canvas.height) enemyBullets.splice(i, 1); });

    // 적군
    enemies.forEach((e, i) => { 
        e.y += 2; 
        if (e.y > canvas.height) enemies.splice(i, 1); 
        if (e.hitTimer > 0) e.hitTimer--; 

        // 슈터 적군 발사 로직
        if (e.type === 'shooter') {
            e.shootCooldown--;
            if (e.shootCooldown <= 0) {
                enemyBullets.push({
                    x: e.x + e.width / 2 - 2.5,
                    y: e.y + e.height,
                    width: 5,
                    height: 10,
                    color: '#FFEB3B' // 노란색 총알
                });
                e.shootCooldown = Math.random() * 100 + 100; // 다음 발사 쿨다운
            }
        }
    });

    // 파티클
    particles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; if (p.life <= 0) particles.splice(i, 1); });

    // 파워업
    powerUps.forEach((p, i) => { p.y += 1; if (p.y > canvas.height) powerUps.splice(i, 1); });

    // 난이도 조절
    time++;
    if (time % 300 === 0) enemySpawnRate += 0.005;

    // 적 생성
    if (Math.random() < enemySpawnRate) {
        const isShooter = Math.random() < 0.3; // 30% 확률로 슈터 적 생성
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: 0,
            width: 40,
            height: 40,
            hp: isShooter ? 3 : 2,
            hitTimer: 0,
            type: isShooter ? 'shooter' : 'normal',
            color: isShooter ? '#9C27B0' : '#E53935', // 보라색 vs 빨간색
            shootCooldown: isShooter ? Math.random() * 100 + 50 : 0
        });
    }
}

function checkCollisions() {
    // 총알 vs 적
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const b = bullets[i];
            const e = enemies[j];
            if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                bullets.splice(i, 1);
                e.hp--;
                e.hitTimer = 5; // 5프레임 동안 깜빡임
                if (e.hp <= 0) {
                    playSound('explosion');
                    for (let k = 0; k < 15; k++) { // 폭발 파티클 생성
                        particles.push({ x: e.x + e.width / 2, y: e.y + e.height / 2, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, size: Math.random() * 3 + 1, life: 1 });
                    }
                    enemies.splice(j, 1);
                    score++;

                    // 15% 확률로 쉴드 아이템 드랍
                    if (Math.random() < 0.15) {
                        powerUps.push({
                            x: e.x + e.width / 2,
                            y: e.y + e.height / 2,
                            size: 15,
                            type: 'shield'
                        });
                    }
                }
                break; // 다음 총알로 넘어감
            }
        }
    }

    // 플레이어 vs 적
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (player.x < e.x + e.width && player.x + player.width > e.x && player.y < e.y + e.height && player.y + player.height > e.y) {
            // 쉴드 상태가 아닐 때만 데미지를 받음
            if (player.shieldTimer <= 0) {
                playSound('hit');
                player.hp--;
                player.hitTimer = 30; // 30프레임 동안 무적 및 깜빡임
                if (player.hp <= 0) gameOver = true;
            }
            enemies.splice(i, 1); // 쉴드 상태여도 적은 부딪히면 사라짐
        }
    }

    // 플레이어 vs 적군 총알
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        if (player.x < b.x + b.width && player.x + player.width > b.x && player.y < b.y + b.height && player.y + player.height > b.y) {
            // 쉴드 상태가 아닐 때만 데미지를 받음
            if (player.shieldTimer <= 0) {
                playSound('hit');
                player.hp--;
                player.hitTimer = 30; // 30프레임 동안 무적 및 깜빡임
                if (player.hp <= 0) gameOver = true;
            }
            enemyBullets.splice(i, 1); // 쉴드 상태여도 총알은 부딪히면 사라짐
        }
    }

    // 플레이어 vs 파워업
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        // 원형 충돌 감지
        const dist = Math.hypot(player.x + player.width / 2 - p.x, player.y + player.height / 2 - p.y);
        if (dist < player.width / 2 + p.size) {
            if (p.type === 'shield') {
                player.shieldTimer = 300; // 5초 (60fps 기준)
            }
            powerUps.splice(i, 1);
        }
    }

    // 승리 조건
    if (score >= 10) {
        gameOver = true;
        gameWon = true;
    }
}

// --- 메인 게임 루프 ---
function update() {
    if (!gameOver) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        updateStars();
        drawStars();

        updateAndMove();
        checkCollisions();
        drawEnemies();
        drawPlayer();
        drawBullets();
        drawEnemyBullets();
        drawParticles();
        drawPowerUps();
        drawUI();
        requestAnimationFrame(update);
    } else {
        drawGameOverScreen();
    }
}

// --- 게임 시작 ---
init();
update();
