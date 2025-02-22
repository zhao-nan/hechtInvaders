class Player {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.bullets = [];
        this.isGrabbing = false;
        this.lastShotTime = 0;
    }
    moveUp() {
        this.y -= this.speed;
        if (this.y < 0)
            this.y = 0;
    }
    moveDown() {
        this.y += this.speed;
        if (this.y + this.height > canvas.height)
            this.y = canvas.height - this.height;
    }
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= 500) {
            this.bullets.push({ x: this.x + this.width, y: this.y + this.height / 2, width: 5, height: 2, speed: 5 });
            this.lastShotTime = currentTime;
        }
    }
    grab() {
        this.isGrabbing = true;
    }
    release() {
        this.isGrabbing = false;
    }
    update() {
        // Update bullets
        this.bullets.forEach(bullet => {
            bullet.x += bullet.speed;
        });
        // Remove bullets that are off-screen
        this.bullets = this.bullets.filter(bullet => bullet.x < canvas.width);
    }
    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw bullets
        ctx.fillStyle = 'yellow';
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        // Draw grabbing indicator
        if (this.isGrabbing) {
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
class Star {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
    }
    update() {
        this.x -= this.speed;
        if (this.x < 0) {
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
        }
    }
    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}
// Initialize the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = new Player(50, canvas.height / 2 - 25, 50, 50, 5);
// Initialize stars
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push(new Star(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, Math.random() * 2 + 1));
}
// Define game variables
let objects = [];
let enemies = [];
// Update game objects
function update() {
    stars.forEach(star => star.update());
    if (keysPressed.has('ArrowUp')) {
        player.moveUp();
    }
    if (keysPressed.has('ArrowDown')) {
        player.moveDown();
    }
    if (keysPressed.has(' ')) {
        player.shoot();
    }
    if (keysPressed.has('g')) {
        player.grab();
    }
    else {
        player.release();
    }
    player.update();
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
    stars.forEach(star => star.draw(ctx));
    player.draw(ctx);
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
// Set to store currently pressed keys
const keysPressed = new Set();
// Event listeners for key presses
window.addEventListener('keydown', (e) => {
    keysPressed.add(e.key);
});
window.addEventListener('keyup', (e) => {
    keysPressed.delete(e.key);
});
// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// Start the game loop
gameLoop();
//# sourceMappingURL=hecht.js.map