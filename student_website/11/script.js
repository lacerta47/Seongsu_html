// --- HTML Element References ---
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const judgmentDisplay = document.getElementById('judgment-display');
const gameMusic = document.getElementById('game-music');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');

// --- Game State ---
let score = 0;
let combo = 0;
let activeNotes = [];
let nextNoteIndex = 0;
let gameStarted = false;

// --- Key Mappings ---
const keyMapping = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };
const validKeys = Object.keys(keyMapping);

// --- Game Constants ---
const NOTE_SPEED = 10; // Pixels per frame
const TARGET_LINE_Y = 650; // Must match CSS (800 - 150)
const NOTE_SPAWN_Y = 0;
const NOTE_DESPAWN_Y = 800;

// --- Judgment Tiers (distance in pixels from target line) ---
const judgments = {
    PERFECT: { window: 10, score: 20 },
    GREAT: { window: 20, score: 15 },
    GOOD: { window: 35, score: 10 },
    BAD: { window: 50, score: 5 }
};

// --- Beatmap ---
// time: in seconds when the note should be HIT
// lane: 0-3
const beatmap = [
    // Faster intro
    { time: 1.7, lane: 0 }, { time: 1.9, lane: 1 }, { time: 2.1, lane: 2 }, { time: 2.3, lane: 3 },
    { time: 2.5, lane: 0 }, { time: 2.6, lane: 1 }, { time: 2.7, lane: 2 }, { time: 2.8, lane: 3 },
    { time: 3.0, lane: 0 }, { time: 3.0, lane: 2 }, // Chord
    { time: 3.3, lane: 1 }, { time: 3.3, lane: 3 }, // Chord
    { time: 3.6, lane: 0 }, { time: 3.7, lane: 1 }, { time: 3.8, lane: 0 }, { time: 3.9, lane: 1 },

    // More complex main part
    { time: 4.2, lane: 2 }, { time: 4.2, lane: 3 },
    { time: 4.6, lane: 0 }, { time: 4.6, lane: 1 },
    { time: 5.1, lane: 0 }, { time: 5.3, lane: 3 }, { time: 5.5, lane: 1 }, { time: 5.7, lane: 2 },
    { time: 5.9, lane: 0 }, { time: 5.9, lane: 3 },
    { time: 6.3, lane: 1 }, { time: 6.3, lane: 2 },
    { time: 6.7, lane: 0 }, { time: 6.9, lane: 1 }, { time: 7.1, lane: 2 }, { time: 7.3, lane: 3 },
    { time: 7.5, lane: 0 }, { time: 7.6, lane: 1 }, { time: 7.7, lane: 0 }, { time: 7.8, lane: 1 },
    { time: 8.0, lane: 2 }, { time: 8.1, lane: 3 }, { time: 8.2, lane: 2 }, { time: 8.3, lane: 3 },

    // Faster bridge
    { time: 8.8, lane: 0 }, { time: 8.95, lane: 1 }, { time: 9.1, lane: 2 }, { time: 9.25, lane: 3 },
    { time: 9.6, lane: 0 }, { time: 9.6, lane: 2 },
    { time: 10.0, lane: 1 }, { time: 10.0, lane: 3 },
    { time: 10.4, lane: 0 }, { time: 10.55, lane: 2 }, { time: 10.7, lane: 1 }, { time: 10.85, lane: 3 },
    { time: 11.2, lane: 0 }, { time: 11.2, lane: 1 }, { time: 11.2, lane: 2 },
    { time: 11.6, lane: 1 }, { time: 11.6, lane: 2 }, { time: 11.6, lane: 3 },

    // Ending stream
    { time: 12.5, lane: 0 }, { time: 12.6, lane: 1 }, { time: 12.7, lane: 2 }, { time: 12.8, lane: 3 },
    { time: 12.9, lane: 2 }, { time: 13.0, lane: 1 }, { time: 13.1, lane: 0 },
    { time: 13.5, lane: 3 }, { time: 13.6, lane: 2 }, { time: 13.7, lane: 1 }, { time: 13.8, lane: 0 },
    { time: 13.9, lane: 1 }, { time: 14.0, lane: 2 }, { time: 14.1, lane: 3 },
    { time: 14.5, lane: 0 }, { time: 14.5, lane: 1 },
    { time: 14.8, lane: 2 }, { time: 14.8, lane: 3 },
    { time: 15.1, lane: 0 }, { time: 15.25, lane: 1 }, { time: 15.4, lane: 2 }, { time: 15.55, lane: 3 },
    { time: 15.7, lane: 0 }, { time: 15.85, lane: 1 }, { time: 16.0, lane: 2 }, { time: 16.15, lane: 3 },
    { time: 16.3, lane: 0 }, { time: 16.45, lane: 1 }, { time: 16.6, lane: 2 }, { time: 16.75, lane: 3 },
    { time: 17.0, lane: 0 }, { time: 17.0, lane: 1 }, { time: 17.0, lane: 2 }, { time: 17.0, lane: 3 },
];

// --- Functions ---

function showJudgment(text) {
    judgmentDisplay.textContent = text;
    judgmentDisplay.classList.remove('judgment-anim');
    void judgmentDisplay.offsetWidth; // Trigger reflow to restart animation
    judgmentDisplay.classList.add('judgment-anim');
}

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
}

function updateCombo(judgment) {
    if (judgment === 'MISS' || judgment === 'BAD') {
        combo = 0;
    } else {
        combo++;
    }
    comboDisplay.textContent = combo;
}

function createNoteElement(laneIndex) {
    const note = document.createElement('div');
    note.className = 'note';
    note.style.left = `${laneIndex * 100}px`;
    note.style.top = `${NOTE_SPAWN_Y}px`;
    gameContainer.appendChild(note);
    return note;
}

function gameLoop() {
    if (!gameStarted) return;

    const currentTime = gameMusic.currentTime;

    // 1. Spawn new notes from the beatmap
    while (nextNoteIndex < beatmap.length && beatmap[nextNoteIndex].time <= currentTime + (TARGET_LINE_Y / (NOTE_SPEED * 60))) { // Predict ahead
        const noteData = beatmap[nextNoteIndex];
        const noteElement = createNoteElement(noteData.lane);
        activeNotes.push({
            element: noteElement,
            lane: noteData.lane,
            time: noteData.time,
            isHit: false
        });
        nextNoteIndex++;
    }

    // 2. Move active notes and check for misses
    for (let i = activeNotes.length - 1; i >= 0; i--) {
        const note = activeNotes[i];
        const expectedPosition = TARGET_LINE_Y - (note.time - currentTime) * (NOTE_SPEED * 60);
        note.element.style.top = `${expectedPosition}px`;

        // Check for miss (note passed the BAD window)
        if (!note.isHit && expectedPosition > TARGET_LINE_Y + judgments.BAD.window) {
            showJudgment('MISS');
            updateCombo('MISS');
            note.element.remove();
            activeNotes.splice(i, 1);
        }
        // Clean up notes that are way off-screen
        else if (expectedPosition > NOTE_DESPAWN_Y) {
             note.element.remove();
             activeNotes.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

function handleKeyPress(event) {
    if (!gameStarted || !validKeys.includes(event.key.toLowerCase())) {
        return;
    }

    const laneIndex = keyMapping[event.key.toLowerCase()];
    const currentTime = gameMusic.currentTime;
    let bestHit = null;

    // Find the closest un-hit note in the correct lane
    for (const note of activeNotes) {
        if (note.lane === laneIndex && !note.isHit) {
            const distance = Math.abs(TARGET_LINE_Y - parseFloat(note.element.style.top));
            if (distance <= judgments.BAD.window) {
                 if (bestHit === null || distance < bestHit.distance) {
                     bestHit = { note, distance };
                 }
            }
        }
    }

    if (bestHit) {
        const { note, distance } = bestHit;
        let judgmentText = 'MISS'; // Default to miss

        if (distance <= judgments.PERFECT.window) judgmentText = 'PERFECT';
        else if (distance <= judgments.GREAT.window) judgmentText = 'GREAT';
        else if (distance <= judgments.GOOD.window) judgmentText = 'GOOD';
        else if (distance <= judgments.BAD.window) judgmentText = 'BAD';

        if (judgmentText !== 'MISS') {
            updateScore(judgments[judgmentText].score);
            showJudgment(judgmentText);
            note.isHit = true;
            note.element.remove(); // Or animate it out
            // The note will be fully removed from the array by the cleanup logic in gameLoop
        }
        updateCombo(judgmentText);
    }
}

function startGame() {
    // Reset state
    score = 0;
    combo = 0;
    nextNoteIndex = 0;
    activeNotes.forEach(note => note.element.remove());
    activeNotes = [];
    scoreDisplay.textContent = '0';
    comboDisplay.textContent = '0';

    // Start music and game loop
    gameMusic.currentTime = 0;
    gameMusic.play();
    gameStarted = true;
    requestAnimationFrame(gameLoop);
}

// --- Event Listeners ---
document.addEventListener('keydown', handleKeyPress);

startButton.addEventListener('click', () => {
    if (gameStarted) return;

    // Hide button and show loading message
    startButton.style.display = 'none';
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = "음악 로딩 중...";
    loadingMessage.style.color = 'white';
    loadingMessage.style.fontSize = '24px';
    gameContainer.before(loadingMessage);

    // Check if music is already loaded
    if (gameMusic.readyState >= 4) { // HAVE_ENOUGH_DATA
        loadingMessage.remove();
        startGame();
    } else {
        gameMusic.addEventListener('canplaythrough', () => {
            loadingMessage.remove();
            startGame();
        }, { once: true });
    }
}, { once: true });
