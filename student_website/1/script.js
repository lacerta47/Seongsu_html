document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const gameOverEl = document.getElementById('game-over');
    const victoryEl = document.getElementById('victory');
    const restartButton = document.getElementById('restart-button');
    const restartButtonVictory = document.getElementById('restart-button-victory');

    const TILE_SIZE = 20;
    const ROWS = 21;
    const COLS = 19;
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;

    let score, pacman, ghosts, map, logicIntervalId, scareTimeoutId, audioCtx, bgmIntervalId;

    const originalMap = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
        [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
        [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
        [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
        [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
        [1, 3, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 3, 1],
        [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
        [1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    function initAudio() {
        if (!audioCtx) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) { console.error("AudioContext not supported."); }
        }
    }

    function playSound(freq, duration, type = 'square') {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    }

    function playPowerUpBGM() {
        if (!audioCtx) return;
        stopPowerUpBGM();
        const notes = [523, 392, 523, 392];
        let noteIndex = 0;
        bgmIntervalId = setInterval(() => {
            playSound(notes[noteIndex % notes.length], 0.1, 'triangle');
            noteIndex++;
        }, 120);
    }

    function stopPowerUpBGM() { clearInterval(bgmIntervalId); }

    class Pacman {
        constructor(x, y) {
            this.x = x; this.y = y; this.radius = TILE_SIZE / 2.5;
            this.dx = 0; this.dy = 0; this.stopped = true;
            this.mouthOpen = 0.2; this.mouthOpening = true; this.rotation = 0;
        }
        draw() {
            if (this.mouthOpening) { this.mouthOpen += 0.02; if (this.mouthOpen >= 0.4) this.mouthOpening = false; }
            else { this.mouthOpen -= 0.02; if (this.mouthOpen <= 0) this.mouthOpening = true; }
            ctx.save();
            ctx.translate(this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2);
            ctx.rotate(this.rotation);
            ctx.fillStyle = 'yellow'; ctx.beginPath();
            ctx.arc(0, 0, this.radius, this.mouthOpen * Math.PI, (2 - this.mouthOpen) * Math.PI);
            ctx.lineTo(0, 0); ctx.fill(); ctx.restore();
        }
        update() {
            if (this.stopped) return;
            const newX = this.x + this.dx; const newY = this.y + this.dy;
            if (!isWall(newX, newY)) { this.x = newX; this.y = newY; }
            if (this.x < -1) this.x = COLS; if (this.x > COLS) this.x = -1;
            this.stopped = true;
        }
    }

    class Ghost {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.radius = TILE_SIZE / 2.5; this.dx = 1; this.dy = 0;
            this.isScared = false; this.isEaten = false;
            this.homeX = 9; this.homeY = 9;
        }
        draw() {
            const centerX = this.x * TILE_SIZE + TILE_SIZE / 2, centerY = this.y * TILE_SIZE + TILE_SIZE / 2;
            if (this.isEaten) {
                ctx.fillStyle = 'white'; ctx.beginPath();
                ctx.arc(centerX - TILE_SIZE / 4, centerY - TILE_SIZE / 8, TILE_SIZE / 6, 0, 2 * Math.PI); ctx.fill();
                ctx.beginPath(); ctx.arc(centerX + TILE_SIZE / 4, centerY - TILE_SIZE / 8, TILE_SIZE / 6, 0, 2 * Math.PI); ctx.fill();
            } else {
                ctx.fillStyle = this.isScared ? '#2121DE' : this.color;
                ctx.beginPath(); ctx.arc(centerX, centerY, this.radius, Math.PI, 0);
                ctx.lineTo(centerX + this.radius, centerY + this.radius); ctx.lineTo(centerX - this.radius, centerY + this.radius); ctx.fill();
                const eyeOffsetX = this.radius / 2.5, eyeOffsetY = -this.radius / 5, eyeRadius = this.radius / 3, pupilRadius = this.radius / 6;
                ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, 2 * Math.PI); ctx.fill();
                ctx.beginPath(); ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, 2 * Math.PI); ctx.fill();
                const pupilLookX = this.dx * (eyeRadius / 2), pupilLookY = this.dy * (eyeRadius / 2);
                ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(centerX - eyeOffsetX + pupilLookX, centerY + eyeOffsetY + pupilLookY, pupilRadius, 0, 2 * Math.PI); ctx.fill();
                ctx.beginPath(); ctx.arc(centerX + eyeOffsetX + pupilLookX, centerY + eyeOffsetY + pupilLookY, pupilRadius, 0, 2 * Math.PI); ctx.fill();
            }
        }
        update() {
            if (this.isEaten) {
                const dx = Math.sign(this.homeX - this.x), dy = Math.sign(this.homeY - this.y);
                const canMoveX = dx !== 0 && !isWall(this.x + dx, this.y), canMoveY = dy !== 0 && !isWall(this.x, this.y + dy);
                if (canMoveX && canMoveY) { if (Math.abs(this.x - this.homeX) > Math.abs(this.y - this.homeY)) this.x += dx; else this.y += dy; }
                else if (canMoveX) { this.x += dx; } else if (canMoveY) { this.y += dy; }
                else { const [newDx, newDy] = [[0, 1], [0, -1], [1, 0], [-1, 0]][Math.floor(Math.random() * 4)]; if (!isWall(this.x + newDx, this.y + newDy)) { this.x += newDx; this.y += newDy; } }
                if (this.x === this.homeX && this.y === this.homeY) { this.isEaten = false; this.isScared = false; }
            } else {
                const newX = this.x + this.dx, newY = this.y + this.dy;
                if (isWall(newX, newY) || Math.random() < 0.2) {
                    const [newDx, newDy] = [[0, 1], [0, -1], [1, 0], [-1, 0]][Math.floor(Math.random() * 4)];
                    this.dx = newDx; this.dy = newDy;
                } else { this.x = newX; this.y = newY; }
                if (this.x < -1) this.x = COLS; if (this.x > COLS) this.x = -1;
            }
        }
    }

    function isWall(x, y) { return map[y] && map[y][x] === 1; }

    function drawMap() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                ctx.fillStyle = '#000'; ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                if (map[y][x] === 1) { ctx.fillStyle = '#0000FF'; ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); }
                else if (map[y][x] === 2) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6, 0, 2 * Math.PI); ctx.fill(); }
                else if (map[y][x] === 3) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, 2 * Math.PI); ctx.fill(); }
            }
        }
    }

    function checkCollisions() {
        if (map[pacman.y][pacman.x] === 2) { map[pacman.y][pacman.x] = 0; score += 10; scoreEl.innerText = score; playSound(900, 0.05); }
        if (map[pacman.y][pacman.x] === 3) { map[pacman.y][pacman.x] = 0; score += 50; scoreEl.innerText = score; playPowerUpBGM(); scareGhosts(); }
        ghosts.forEach(ghost => { if (ghost.x === pacman.x && ghost.y === pacman.y) { if (ghost.isScared && !ghost.isEaten) { score += 200; scoreEl.innerText = score; ghost.isEaten = true; playSound(300, 0.3, 'triangle'); } else if (!ghost.isScared) { endGame(false); } } });
    }

    function checkWin() {
        for (let i = 0; i < map.length; i++) { for (let j = 0; j < map[i].length; j++) { if (map[i][j] === 2 || map[i][j] === 3) return; } }
        endGame(true);
    }

    function scareGhosts() {
        clearTimeout(scareTimeoutId);
        ghosts.forEach(ghost => { if (!ghost.isEaten) ghost.isScared = true; });
        scareTimeoutId = setTimeout(() => { ghosts.forEach(ghost => { ghost.isScared = false; }); stopPowerUpBGM(); }, 8000);
    }

    function updateGame() { if (!pacman) return; pacman.update(); ghosts.forEach(ghost => ghost.update()); checkCollisions(); checkWin(); }

    function renderLoop() { ctx.clearRect(0, 0, canvas.width, canvas.height); drawMap(); if (pacman) { pacman.draw(); ghosts.forEach(ghost => ghost.draw()); } requestAnimationFrame(renderLoop); }

    function endGame(isVictory) {
        if (!logicIntervalId) return;
        clearInterval(logicIntervalId); logicIntervalId = null;
        clearTimeout(scareTimeoutId); stopPowerUpBGM();
        if (isVictory) { victoryEl.classList.remove('hidden'); } else { gameOverEl.classList.remove('hidden'); }
    }

    function init() {
        clearTimeout(scareTimeoutId); stopPowerUpBGM();
        map = originalMap.map(arr => [...arr]);
        score = 0; scoreEl.innerText = score;
        gameOverEl.classList.add('hidden'); victoryEl.classList.add('hidden');
        pacman = new Pacman(9, 15);
        ghosts = [ new Ghost(8, 9, 'red'), new Ghost(9, 9, 'pink'), new Ghost(10, 9, 'cyan'), new Ghost(9, 8, 'orange') ];
        if (logicIntervalId) clearInterval(logicIntervalId);
        logicIntervalId = setInterval(updateGame, 180);
    }

    window.addEventListener('keydown', (e) => { if(logicIntervalId) { initAudio(); if (e.key === 'ArrowUp') { pacman.dx = 0; pacman.dy = -1; pacman.stopped = false; pacman.rotation = 1.5 * Math.PI; } else if (e.key === 'ArrowDown') { pacman.dx = 0; pacman.dy = 1; pacman.stopped = false; pacman.rotation = 0.5 * Math.PI; } else if (e.key === 'ArrowLeft') { pacman.dx = -1; pacman.dy = 0; pacman.stopped = false; pacman.rotation = Math.PI; } else if (e.key === 'ArrowRight') { pacman.dx = 1; pacman.dy = 0; pacman.stopped = false; pacman.rotation = 0; } } });
    restartButton.addEventListener('click', init);
    restartButtonVictory.addEventListener('click', init);

    init();
    renderLoop();
});
