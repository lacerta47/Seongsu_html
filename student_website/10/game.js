
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

const PLAYER_COLOR = 'blue';
const PLATFORM_COLOR = 'green';
const LADDER_COLOR = 'yellow';
const OBSTACLE_COLOR = 'red';
const GOAL_COLOR = 'gold';
const MONSTER_COLOR = 'pink';
const TEXT_COLOR = 'white';

const PLAYER_SPEED = 5;
const JUMP_STRENGTH = 15;
const GRAVITY = 0.8;

let player;
let platforms = [];
let ladders = [];
let obstacles = [];
let monsters = [];
let goal;
let currentStage = 1;
let gameState = 'playing'; // 'playing', 'win', 'game_over', 'final_win'

const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    r: false,
    q: false
};

class Player {
    constructor(x, y) {
        this.width = 30;
        this.height = 40;
        this.x = x;
        this.y = y;
        this.velY = 0;
        this.onGround = false;
        this.onLadder = false;
    }

    reset(x = 50, y = SCREEN_HEIGHT - 80) {
        this.x = x;
        this.y = y;
        this.velY = 0;
        this.onGround = false;
        this.onLadder = false;
    }

    update() {
        // Horizontal movement
        if (keys.left) {
            this.x -= PLAYER_SPEED;
        }
        if (keys.right) {
            this.x += PLAYER_SPEED;
        }

        this.onLadder = this.checkCollisionWith(ladders);

        if (this.onLadder) {
            this.velY = 0;
            if (keys.up) {
                this.y -= PLAYER_SPEED;
            } else if (keys.down) {
                this.y += PLAYER_SPEED;
            }
        } else {
            this.velY += GRAVITY;
            this.y += this.velY;
        }

        this.onGround = false;
        for (const platform of platforms) {
            if (this.isCollidingWith(platform)) {
                if (this.onLadder) {
                    if (keys.down && this.y + this.height > platform.y && this.y < platform.y) {
                        this.y = platform.y - this.height;
                        this.onGround = true;
                    }
                } else {
                    if (this.velY > 0 && this.y + this.height - this.velY <= platform.y) {
                        this.y = platform.y - this.height;
                        this.velY = 0;
                        this.onGround = true;
                    } else if (this.velY < 0) {
                        this.y = platform.y + platform.height;
                        this.velY = 0;
                    }
                }
            }
        }

        // Screen boundaries
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > SCREEN_WIDTH) {
            this.x = SCREEN_WIDTH - this.width;
        }
    }

    jump() {
        if (this.onGround) {
            this.velY = -JUMP_STRENGTH;
        }
    }

    draw() {
        ctx.fillStyle = PLAYER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isCollidingWith(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    checkCollisionWith(group) {
        for (const item of group) {
            if (this.isCollidingWith(item)) {
                return true;
            }
        }
        return false;
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = PLATFORM_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ladder {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = LADDER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = OBSTACLE_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.colorPhase = 0;
    }

    update() {
        this.colorPhase = (this.colorPhase + 5) % 360;
    }

    draw() {
        const r = 128 + 127 * Math.sin(this.colorPhase * Math.PI / 180);
        const g = 128 + 127 * Math.sin((this.colorPhase + 120) * Math.PI / 180);
        const b = 128 + 127 * Math.sin((this.colorPhase + 240) * Math.PI / 180);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Monster {
    constructor(x, y, patrolRange) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.startX = x;
        this.patrolRange = patrolRange;
        this.speed = 2;
    }

    update() {
        this.x += this.speed;
        if (this.x < this.startX || this.x + this.width > this.startX + this.patrolRange) {
            this.speed *= -1;
        }
    }

    draw() {
        ctx.fillStyle = MONSTER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function createLevel(stage) {
    platforms = [];
    ladders = [];
    obstacles = [];
    monsters = [];

    if (stage === 1) {
        // Floor
        platforms.push(new Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40));
        // Platforms, ladders, obstacles
        platforms.push(new Platform(200, 450, 150, 20));
        ladders.push(new Ladder(340, 450, 20, 110));
        platforms.push(new Platform(450, 350, 150, 20));
        obstacles.push(new Obstacle(480, 330, 20, 20));
        platforms.push(new Platform(200, 250, 150, 20));
        ladders.push(new Ladder(210, 250, 20, 200));
        monsters.push(new Monster(200, 220, 120));
        platforms.push(new Platform(50, 150, 100, 20));

        goal = new Goal(60, 110);
    } else if (stage === 2) {
        // Floor
        platforms.push(new Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40));
        // Stage 2 platforms, ladders, obstacles, monsters
        platforms.push(new Platform(100, 400, 120, 20));
        ladders.push(new Ladder(180, 400, 20, 160));
        platforms.push(new Platform(300, 300, 150, 20));
        obstacles.push(new Obstacle(350, 280, 20, 20));
        monsters.push(new Monster(300, 270, 100));
        platforms.push(new Platform(500, 200, 100, 20));
        ladders.push(new Ladder(550, 200, 20, 100));
        platforms.push(new Platform(650, 100, 80, 20));
        obstacles.push(new Obstacle(680, 80, 20, 20));
        monsters.push(new Monster(650, 70, 50));

        goal = new Goal(700, 60);
    }
}

function drawText(text, x, y) {
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '55px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function gameLoop() {
    if (gameState === 'playing') {
        player.update();
        goal.update();
        monsters.forEach(monster => monster.update());

        if (player.checkCollisionWith(obstacles) || player.checkCollisionWith(monsters)) {
            gameState = 'game_over';
        }

        if (player.isCollidingWith(goal)) {
            if (currentStage === 1) {
                currentStage = 2;
                player.reset();
                createLevel(currentStage);
                gameState = 'playing';
            } else {
                gameState = 'final_win';
            }
        }
    }

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    platforms.forEach(p => p.draw());
    ladders.forEach(l => l.draw());
    obstacles.forEach(o => o.draw());
    monsters.forEach(m => m.draw());
    goal.draw();
    player.draw();

    if (gameState === 'win') {
        drawText('You Win!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        drawText('Press R to Restart or Q to Quit', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
    } else if (gameState === 'game_over') {
        drawText('Game Over', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        drawText('Press R to Restart or Q to Quit', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
    } else if (gameState === 'final_win') {
        drawText('Congratulations! You completed all stages!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        drawText('Press R to Restart or Q to Quit', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
    }

    requestAnimationFrame(gameLoop);
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === ' ') keys.space = true;
    if (e.key === 'r') keys.r = true;
    if (e.key === 'q') keys.q = true;

    if (gameState === 'playing') {
        if (keys.space) {
            player.jump();
        }
    } else {
        if (keys.r) {
            currentStage = 1;
            player.reset();
            createLevel(currentStage);
            gameState = 'playing';
        }
        if (keys.q) {
            // In a browser, we can't just quit. We can stop the game loop or close the window.
            // For simplicity, we'll just stop the game by not restarting.
            window.close();
        }
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
    if (e.key === ' ') keys.space = false;
    if (e.key === 'r') keys.r = false;
    if (e.key === 'q') keys.q = false;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

player = new Player(50, SCREEN_HEIGHT - 80);
createLevel(currentStage);
gameLoop();
