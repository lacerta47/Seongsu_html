console.log("리듬 게임 스크립트가 로드되었습니다!");

// --- 화면 요소 가져오기 ---
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const resultScreen = document.getElementById('result-screen');
const restartButton = document.getElementById('restart-button');

const playArea = document.getElementById('play-area');
const receptors = document.querySelectorAll('.receptor');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const judgmentText = document.getElementById('judgment-text');

const finalScoreDisplay = document.getElementById('final-score');
const maxComboDisplay = document.getElementById('max-combo');
const clearStatusDisplay = document.getElementById('clear-status');

// --- 게임 설정 및 상태 변수 ---
const keyMapping = { 's': 0, 'd': 1, 'f': 2, 'j': 3, 'k': 4, 'l': 5 };
const lanes = document.querySelectorAll('.lane');
const noteSpeed = 300;
const PERFECT_WINDOW = 25;
const GREAT_WINDOW = 50;
const GOOD_WINDOW = 80;
const GAME_DURATION = 30000; // 30초

let score = 0;
let combo = 0;
let maxCombo = 0;
let notes = [];
let lastFrameTime = 0;
let gameTimer = null;
let gameEndTimer = null;
let animationFrameId = null;

// --- 게임 핵심 함수 ---

function startGame() {
    console.log("게임 시작!");
    // 초기화
    score = 0;
    combo = 0;
    maxCombo = 0;
    notes = [];
    scoreDisplay.textContent = 0;
    comboDisplay.textContent = 0;
    if (gameTimer) clearInterval(gameTimer);
    if (gameEndTimer) clearTimeout(gameEndTimer);

    document.querySelectorAll('.note').forEach(note => note.remove());

    // 화면 전환
    startScreen.classList.add('hidden');
    resultScreen.style.display = 'none';
    gameContainer.classList.remove('hidden');

    lastFrameTime = performance.now();

    // 노트 생성 및 게임 종료 타이머 설정
    gameTimer = setInterval(() => {
        const randomLane = Math.floor(Math.random() * 6);
        // 30% 확률로 롱노트 생성
        if (Math.random() < 0.3) {
            createNote(randomLane, 'long', 500); // 0.5초 길이의 롱노트
        } else {
            createNote(randomLane, 'click');
        }
    }, 800);
    gameEndTimer = setTimeout(endGame, GAME_DURATION);

    animationFrameId = requestAnimationFrame(update);
}

function endGame() {
    console.log("게임 종료!");
    clearInterval(gameTimer);
    cancelAnimationFrame(animationFrameId);

    // 결과 계산
    finalScoreDisplay.textContent = score;
    maxComboDisplay.textContent = maxCombo;
    if (score >= 2000) {
        clearStatusDisplay.textContent = "CLEAR!";
        clearStatusDisplay.style.color = '#3498db';
    } else {
        clearStatusDisplay.textContent = "FAILED...";
        clearStatusDisplay.style.color = '#e74c3c';
    }

    // 화면 전환
    gameContainer.classList.add('hidden');
    resultScreen.style.display = 'block';
}

function createNote(laneIndex, type = 'click', duration = 0) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';

    const note = {
        element: noteElement,
        lane: laneIndex,
        y: 0, // 초기 y 위치
        type: type,
        duration: duration,
        isBeingHeld: false // 롱노트 홀드 상태
    };

    if (type === 'long') {
        noteElement.classList.add('long');
        // 노트 길이(height) = 노트 시간(ms) * 속도(px/s) / 1000
        const height = duration * noteSpeed / 1000;
        noteElement.style.height = `${height}px`;
        note.y = -30 - height; // 노트 길이만큼 위에서 시작
    } else {
        note.y = -30; // 일반 노트 시작 위치
    }
    
    lanes[laneIndex].appendChild(noteElement);
    notes.push(note);
}


function update(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    const receptorY = playArea.clientHeight - 60;

    for (let i = notes.length - 1; i >= 0; i--) {
        const note = notes[i];
        note.y += noteSpeed * deltaTime;
        note.element.style.top = `${note.y}px`;

        // 롱노트의 끝부분이 판정선을 지났을 때 Miss 처리
        const noteBottomY = note.type === 'long' ? note.y + (note.duration * noteSpeed / 1000) : note.y;

        if (noteBottomY > receptorY + GOOD_WINDOW && !note.isBeingHeld) {
            handleJudgment('Miss');
            note.element.remove();
            notes.splice(i, 1);
        }
    }

    animationFrameId = requestAnimationFrame(update);
}

function handleKeyPress(key) {
    if (!keyMapping.hasOwnProperty(key)) return;

    const laneIndex = keyMapping[key];
    receptors[laneIndex].classList.add('active');

    const receptorY = playArea.clientHeight - 60;

    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (note.lane === laneIndex) {
            const distance = Math.abs(note.y - receptorY);
            let judgment = null;

            if (distance <= PERFECT_WINDOW) judgment = 'Perfect';
            else if (distance <= GREAT_WINDOW) judgment = 'Great';
            else if (distance <= GOOD_WINDOW) judgment = 'Good';

            if (judgment) {
                // 지금은 롱노트도 일반 노트처럼 시작 부분만 판정합니다.
                handleJudgment(judgment);
                note.element.remove();
                notes.splice(i, 1);
                break; 
            }
        }
    }
}

function handleJudgment(judgment) {
    switch (judgment) {
        case 'Perfect':
            score += 100;
            combo++;
            break;
        case 'Great':
            score += 50;
            combo++;
            break;
        case 'Good':
            score += 10;
            combo = 0;
            break;
        case 'Miss':
            combo = 0;
            break;
    }

    maxCombo = Math.max(maxCombo, combo);

    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;

    judgmentText.textContent = judgment;
    judgmentText.classList.remove('judged');
    void judgmentText.offsetWidth;
    judgmentText.classList.add('judged');
}

// --- 이벤트 리스너 ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
    handleKeyPress(event.key.toLowerCase());
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (keyMapping.hasOwnProperty(key)) {
        receptors[keyMapping[key]].classList.remove('active');
    }
});
