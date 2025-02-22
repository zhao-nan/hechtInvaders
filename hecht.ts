// Initialize the canvas and context
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Define game variables
let player = { x: 50, y: canvas.height / 2, width: 20, height: 20, speed: 5 };
let objects: any[] = [];
let enemies: any[] = [];
let keys: { [key: string]: boolean } = {};

// Handle keyboard input
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Update game objects
function update() {
    // Move player
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

    // Move objects and enemies
    objects.forEach(obj => obj.x -= 2);
    enemies.forEach(enemy => enemy.x -= 3);

    // Remove off-screen objects and enemies
    objects = objects.filter(obj => obj.x + obj.width > 0);
    enemies = enemies.filter(enemy => enemy.x + enemy.width > 0);
}

// Draw game objects
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw objects
    ctx.fillStyle = 'blue';
    objects.forEach(obj => ctx.fillRect(obj.x, obj.y, obj.width, obj.height));

    // Draw enemies
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height));
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();