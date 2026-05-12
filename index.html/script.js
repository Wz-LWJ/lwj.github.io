const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = { x: 15, y: 8 };
let score = 0;
let speed = 5;
let gameInterval = null;
let gameState = "stopped"; // stopped, running, paused

function randomPosition() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  food = randomPosition();
  score = 0;
  speed = 5;
  updateInfo();
  setMessage("按空格键开始");
  clearInterval(gameInterval);
  gameInterval = null;
  gameState = "stopped";
  draw();
}

function setMessage(text, warn = false) {
  messageEl.textContent = text;
  messageEl.style.color = warn ? "#f87171" : "var(--accent)";
}

function updateInfo() {
  scoreEl.textContent = score;
  speedEl.textContent = speed;
}

function startGame() {
  if (gameState === "running") return;
  gameState = "running";
  setMessage("游戏进行中...");
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / speed);
}

function pauseGame() {
  if (gameState !== "running") return;
  gameState = "paused";
  clearInterval(gameInterval);
  gameInterval = null;
  setMessage("已暂停，按空格键继续");
}

function gameOver() {
  gameState = "stopped";
  clearInterval(gameInterval);
  gameInterval = null;
  setMessage(`游戏结束，得分 ${score}。按重置重新开始`, true);
}

function gameLoop() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score % 50 === 0 && speed < 15) {
      speed += 1;
      setMessage(`速度提升到 ${speed}`);
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 1000 / speed);
    }
    food = randomPosition();
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
      food = randomPosition();
    }
  } else {
    snake.pop();
  }

  updateInfo();
  draw();
}

function draw() {
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e2e8f0";
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#4ade80" : "#22c55e";
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });

  ctx.fillStyle = "#f97316";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  ctx.strokeStyle = "#2d2d2d";
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function handleKey(event) {
  const key = event.key;
  if (key === " " || key === "Spacebar") {
    event.preventDefault();
    if (gameState === "running") {
      pauseGame();
    } else {
      startGame();
    }
    return;
  }

  const rotation = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (!rotation[key]) return;

  const next = rotation[key];
  if (next.x === -direction.x && next.y === -direction.y) return;

  direction = next;
}

startBtn.addEventListener("click", () => startGame());
pauseBtn.addEventListener("click", () => pauseGame());
resetBtn.addEventListener("click", () => resetGame());
window.addEventListener("keydown", handleKey);

resetGame();
