let audio = new Audio('Cantina.mp3');
audio.play();
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
        this.lives = 3;
        this.points = 0;
        this.inventory = [];
        this.canGrab = false;
        this.boom = 1;
        this.dakka = 1;
        this.shields = 0;
        this.shieldFlash = false;
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
        if (currentTime - this.lastShotTime >= 1000 / this.dakka) {
            this.bullets.push({ x: this.x + this.width,
                y: this.y + this.height / 2,
                width: this.boom + 1,
                height: this.boom + 1,
                speed: 1 + this.dakka });
            this.lastShotTime = currentTime;
        }
    }
    grab() {
        this.isGrabbing = true;
    }
    release() {
        this.isGrabbing = false;
    }
    addToInventory(obj) {
        if (rareObjectTypes.some(t => t === obj.type)) {
            this.inventory.push(obj);
        }
        else {
            switch (obj.type) {
                case GameObjectType.SCHNAPPS:
                    if (this.lives < 5)
                        this.lives += 1;
                    break;
                case GameObjectType.BLASTER:
                    this.boom += 1;
                    break;
                case GameObjectType.SPEEDUP:
                    this.dakka += 1 / 10;
                    break;
                case GameObjectType.SHIELD:
                    if (this.shields < 5)
                        this.shields += 1;
                    break;
            }
        }
    }
    update() {
        // Update bullets
        this.bullets.forEach(bullet => {
            bullet.x += bullet.speed;
        });
        // Remove bullets that are off-screen
        this.bullets = this.bullets.filter(bullet => bullet.x < canvas.width);
        // Check for collisions with enemies
        enemies.forEach(enemy => {
            if (enemy.isCollidingWith(this)) {
                if (this.shields > 0) {
                    this.shields -= 1;
                    this.shieldFlash = true;
                    setTimeout(() => this.shieldFlash = false, 100);
                }
                else {
                    this.lives -= 1;
                }
                enemies.splice(enemies.indexOf(enemy), 1);
                if (this.lives <= 0) {
                    // Game over
                    alert('Game Over!');
                    // Reset player position and lives
                    this.x = 50;
                    this.y = canvas.height / 2 - 25;
                    this.lives = 3;
                    this.points = 0;
                }
            }
            this.bullets.forEach(bullet => {
                if (enemy.isHitBy(bullet)) {
                    enemy.lives -= bullet.height;
                    enemy.width = 20 + enemy.lives * 10;
                    enemy.height = 20 + enemy.lives * 10;
                    if (enemy.lives <= 0) {
                        // Remove enemy if lives are 0
                        enemies.splice(enemies.indexOf(enemy), 1);
                        this.points += Math.floor(enemy.strength);
                    }
                    // Remove bullet
                    this.bullets.splice(this.bullets.indexOf(bullet), 1);
                }
            });
        });
        // Grab objects
        this.canGrab = false;
        objects.forEach(obj => {
            if (obj.isCloseEnough(this)) {
                this.canGrab = true;
            }
            if (obj.isCloseEnough(this) && this.isGrabbing) {
                this.addToInventory(obj);
                objects.splice(objects.indexOf(obj), 1);
            }
        });
    }
    draw(ctx) {
        const hechtImage = new Image();
        hechtImage.src = this.isGrabbing ? 'img/hecht-grab.png' : 'img/hecht.png';
        ctx.drawImage(hechtImage, this.x, this.y, this.width, this.height);
        // Draw shield
        for (let i = 0; i < this.shields; i++) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10 + 3 * i, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(50, 50, ${i * 50})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        // Draw bullets
        ctx.fillStyle = 'yellow';
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        // Draw shield flash
        if (this.shieldFlash) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, 2 * Math.PI);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}
class Enemy {
    constructor(x, y, width, height, speed, lives) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.lives = lives;
        this.strength = lives * speed * 10;
    }
    update() {
        this.x -= this.speed;
        this.width = 20 + this.lives * 10;
        this.height = 20 + this.lives * 10;
    }
    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    isCollidingWith(player) {
        return this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y;
    }
    isHitBy(bullet) {
        return this.x < bullet.x + bullet.width &&
            this.x + this.width > bullet.x &&
            this.y < bullet.y + bullet.height &&
            this.y + this.height > bullet.y;
    }
}
var GameObjectType;
(function (GameObjectType) {
    GameObjectType[GameObjectType["SCHNAPPS"] = 0] = "SCHNAPPS";
    GameObjectType[GameObjectType["SHIELD"] = 1] = "SHIELD";
    GameObjectType[GameObjectType["LEIA"] = 2] = "LEIA";
    GameObjectType[GameObjectType["SABER"] = 3] = "SABER";
    GameObjectType[GameObjectType["R2D2"] = 4] = "R2D2";
    GameObjectType[GameObjectType["YODA"] = 5] = "YODA";
    GameObjectType[GameObjectType["BLASTER"] = 6] = "BLASTER";
    GameObjectType[GameObjectType["SPEEDUP"] = 7] = "SPEEDUP";
})(GameObjectType || (GameObjectType = {}));
const rareObjectTypes = [GameObjectType.YODA, GameObjectType.R2D2, GameObjectType.LEIA, GameObjectType.SABER];
const normalObjectTypes = [GameObjectType.SCHNAPPS, GameObjectType.BLASTER, GameObjectType.SPEEDUP, GameObjectType.SHIELD];
class GameObject {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.image = new Image();
        switch (this.type) {
            case GameObjectType.SCHNAPPS:
                this.image.src = 'img/schnaps.png';
                break;
            case GameObjectType.SHIELD:
                this.image.src = 'img/shield.png';
                break;
            case GameObjectType.LEIA:
                this.image.src = 'img/leia.png';
                break;
            case GameObjectType.SABER:
                this.image.src = 'img/lightsaber.png';
                break;
            case GameObjectType.R2D2:
                this.image.src = 'img/r2d2.png';
                break;
            case GameObjectType.YODA:
                this.image.src = 'img/yoda.png';
                break;
            case GameObjectType.BLASTER:
                this.image.src = 'img/blaster.png';
                break;
            case GameObjectType.SPEEDUP:
                this.image.src = 'img/speedcannon.png';
                break;
        }
    }
    update() {
        this.x -= 2; // Move objects to the left
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    isCloseEnough(player) {
        const distance = Math.hypot(this.x - player.x, this.y - player.y);
        return distance < 100;
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
const player = new Player(50, canvas.height / 2 - 25, 60, 35, 5);
let lastEnemySpawnTime = 0;
let lastObjectSpawnTime = 0;
// Initialize stars
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push(new Star(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, Math.random() * 2 + 1));
}
// Initialize enemies
const enemies = [];
function spawnEnemy() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - 50);
    const lives = Math.floor(Math.random() * 5) + 1;
    const speed = Math.random() * 2 + 1;
    const width = 20 + lives * 10;
    const height = 20 + lives * 10;
    enemies.push(new Enemy(x, y, width, height, speed, lives));
}
// Initialize objects
const objects = [];
function spawnObject() {
    const x = canvas.width;
    const y = Math.random() * (canvas.height - 50);
    const width = 30;
    const height = 30;
    let type;
    const random = Math.random();
    if (random < 0.1) {
        const availableRareTypes = rareObjectTypes.filter(t => !player.inventory.some(item => item.type === t) &&
            !objects.some(obj => obj.type === t));
        if (availableRareTypes.length > 0) {
            type = availableRareTypes[Math.floor(Math.random() * availableRareTypes.length)];
        }
        else {
            type = normalObjectTypes[Math.floor(Math.random() * normalObjectTypes.length)];
        }
    }
    else {
        type = normalObjectTypes[Math.floor(Math.random() * normalObjectTypes.length)];
    }
    objects.push(new GameObject(x, y, width, height, type));
}
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
    // Check for grabbing objects
    if (keysPressed.has('Enter')) {
        player.grab();
    }
    else {
        player.release();
    }
    player.update();
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawnTime >= 5000 + Math.random() * 5000) {
        spawnEnemy();
        lastEnemySpawnTime = currentTime;
    }
    if (currentTime - lastObjectSpawnTime >= 500 + Math.random() * 1000) {
        spawnObject();
        lastObjectSpawnTime = currentTime;
    }
    // Move objects and enemies
    objects.forEach(obj => obj.update());
    enemies.forEach(enemy => enemy.update());
}
// Draw game objects
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.draw(ctx));
    player.draw(ctx);
    // Draw objects
    objects.forEach(o => o.draw(ctx));
    // Draw enemies
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height));
    // Draw status bar
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText("❤️ ".repeat(player.lives), 10, 20);
    ctx.fillText(`Points: ${player.points}`, 100, 20);
    player.inventory.forEach((item, index) => {
        ctx.drawImage(item.image, 200 + index * 40, 5, 30, 30);
    });
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