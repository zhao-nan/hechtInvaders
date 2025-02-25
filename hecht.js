// let audio = new Audio('Cantina.mp3');
// audio.play();
console.log('May the force be with you!');
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
        this.lastDiscTime = 0;
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
        if (this.y < 20)
            this.y = 20;
    }
    moveDown() {
        this.y += this.speed;
        if (this.y + this.height > canvas.height - 10)
            this.y = canvas.height - this.height - 10;
    }
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= 1000 / this.dakka) {
            this.bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, this.boom + 1, 1 + this.dakka, true, false, this.boom));
            this.lastShotTime = currentTime;
        }
    }
    throwDisc() {
        const currentTime = Date.now();
        if (currentTime - this.lastDiscTime >= 200) {
            if (this.inventory.some(item => item.type === GameObjectType.DISC)) {
                this.bullets.push(new Bullet(this.x + this.width, this.y + this.height / 2, 10, 1 + this.dakka, true, true, 50 + this.boom * 5));
                const discIndex = this.inventory.findIndex(item => item.type === GameObjectType.DISC);
                if (discIndex !== -1) {
                    this.inventory.splice(discIndex, 1);
                }
                this.lastDiscTime = currentTime;
            }
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
                case GameObjectType.DISC:
                    this.inventory.push(obj);
                    break;
            }
        }
    }
    isHitBy(bullet) {
        return this.x < bullet.x + bullet.radius &&
            this.x + this.width > bullet.x &&
            this.y < bullet.y + bullet.radius &&
            this.y + this.height > bullet.y;
    }
    update() {
        if (this.lives <= 0)
            lose();
        // Update bullets
        this.bullets.forEach(bullet => {
            bullet.x += bullet.speed;
        });
        // Update explosions
        explosions.forEach(explosion => explosion.update());
        explosions = explosions.filter(explosion => explosion.frame < 300);
        // Remove bullets that are off-screen
        this.bullets = this.bullets.filter(bullet => bullet.x < canvas.width);
        // Check for collisions with enemies
        enemies.forEach(enemy => {
            if (enemy.isCollidingWith(this)) {
                if (this.shields > 0) {
                    if (enemy.type === EnemyType.STARDESTROYER)
                        this.shields = 0;
                    this.shields -= 1;
                    this.shieldFlash = true;
                    setTimeout(() => this.shieldFlash = false, 100);
                }
                else {
                    this.lives -= 1;
                }
                if (enemy.type === EnemyType.STARDESTROYER) {
                    this.lives = 0;
                }
                else {
                    enemies.splice(enemies.indexOf(enemy), 1);
                    const explosion = new Explosion(enemy.x, enemy.y, enemy.width, enemy.height);
                    explosions.push(explosion);
                }
            }
            enemy.bullets.forEach(bullet => {
                if (this.isHitBy(bullet)) {
                    if (this.shields > 0) {
                        this.shields -= 1;
                        this.shieldFlash = true;
                        setTimeout(() => this.shieldFlash = false, 100);
                    }
                    else {
                        this.lives -= 1;
                    }
                    enemy.bullets.splice(enemy.bullets.indexOf(bullet), 1);
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
            });
            this.bullets.forEach(bullet => {
                if (enemy.isHitBy(bullet)) {
                    enemy.lives -= bullet.damage;
                    if (enemy.lives <= 0) {
                        // Remove enemy if lives are 0
                        enemies.splice(enemies.indexOf(enemy), 1);
                        this.points += Math.floor(enemy.strength);
                        explosions.push(new Explosion(enemy.x, enemy.y, enemy.width, enemy.height));
                        if (enemy.type === EnemyType.VADER) {
                            win();
                        }
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
        this.bullets.forEach(bullet => bullet.draw(ctx));
        // Draw shield flash
        if (this.shieldFlash) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 10, 0, 2 * Math.PI);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}
class Bullet {
    constructor(x, y, radius, speed, friendly, disc, damage = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.friendly = friendly;
        this.disc = disc;
        this.damage = damage;
    }
    update() {
        this.x += this.speed;
    }
    draw(ctx) {
        if (this.disc) {
            let img = new Image();
            img.src = 'img/disc.png';
            ctx.drawImage(img, this.x, this.y, this.radius, this.radius);
        }
        else {
            ctx.fillStyle = this.friendly ? 'teal' : 'red';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
var EnemyType;
(function (EnemyType) {
    EnemyType[EnemyType["STORMTROOPER"] = 0] = "STORMTROOPER";
    EnemyType[EnemyType["TIEFIGHTER"] = 1] = "TIEFIGHTER";
    EnemyType[EnemyType["STARDESTROYER"] = 2] = "STARDESTROYER";
    EnemyType[EnemyType["VADER"] = 3] = "VADER";
})(EnemyType || (EnemyType = {}));
class Enemy {
    constructor(type, x, y, width, height, speed, lives) {
        this.bullets = [];
        this.lastShotTime = 0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.yspeed = 0;
        this.initLives = lives;
        this.lives = lives;
        this.strength = lives * speed * 10;
        this.lastShotTime = Date.now();
        this.bullets = [];
        this.type = type;
        this.image = new Image();
        switch (this.type) {
            case EnemyType.STORMTROOPER:
                this.image.src = 'img/stormtrooper.png';
                break;
            case EnemyType.TIEFIGHTER:
                this.image.src = 'img/Tie.png';
                break;
            case EnemyType.STARDESTROYER:
                this.image.src = 'img/star-destroyer.png';
                break;
            case EnemyType.VADER:
                this.image.src = 'img/darth-vader.png';
                break;
        }
    }
    update() {
        this.x -= this.speed;
        if (this.type === EnemyType.TIEFIGHTER) {
            this.shoot();
            let rand = Math.floor(Math.random() * 3);
            if (rand == 0 && this.y < canvas.height - this.height && this.yspeed < 2) {
                this.yspeed += 0.1;
            }
            else if (rand == 1 && this.y > 25 && this.yspeed > -2) {
                this.yspeed -= 0.1;
            }
            if (this.y > canvas.height - this.height) {
                this.yspeed = -0.3;
            }
            if (this.y < 25) {
                this.yspeed = 0.3;
            }
            this.y += this.yspeed;
        }
        this.bullets.forEach(bullet => bullet.update());
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.drawLifeBar(ctx);
    }
    drawLifeBar(ctx) {
        const barWidth = this.width;
        const barHeight = 5;
        const barX = this.x;
        const barY = this.y + this.height + 2; // Position the bar below the enemy
        // Draw the background of the life bar
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        // Draw the foreground of the life bar
        const lifePercentage = this.lives / this.initLives; // Assuming max lives is 10
        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, barWidth * lifePercentage, barHeight);
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime > Math.random() * 1000 + 1750) {
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height, 5, this.speed * (-1) - 3, false, false, 1);
            this.bullets.push(bullet);
            this.lastShotTime = now;
        }
    }
    isCollidingWith(player) {
        return this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y;
    }
    isHitBy(bullet) {
        return this.x < bullet.x + bullet.radius &&
            this.x + this.width > bullet.x &&
            this.y < bullet.y + bullet.radius &&
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
    GameObjectType[GameObjectType["DISC"] = 8] = "DISC";
})(GameObjectType || (GameObjectType = {}));
const rareObjectTypes = [GameObjectType.YODA, GameObjectType.R2D2, GameObjectType.LEIA, GameObjectType.SABER];
const normalObjectTypes = [GameObjectType.DISC, GameObjectType.SCHNAPPS, GameObjectType.BLASTER, GameObjectType.SPEEDUP, GameObjectType.SHIELD, GameObjectType.DISC];
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
            case GameObjectType.DISC:
                this.image.src = 'img/disc.png';
                break;
        }
    }
    update() {
        this.x -= 2; // Move objects to the left
    }
    isOutOfScreen() {
        return this.x < 0;
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
class Explosion {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.frame = 0;
    }
    update() {
        this.frame += 1;
    }
    draw(ctx) {
        const colors = ['red', 'orange', 'yellow', 'white'];
        const duration = 5;
        colors.forEach((color, index) => {
            if (this.frame < (4 - index) * duration) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 5 + (5 - index) * 5, this.height / 5 + (5 - index) * 5, 0, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }
}
// Initialize the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = new Player(50, canvas.height / 2 - 25, 60, 35, 5);
let lastSDSpawnTime = 0;
let lastSTSpawnTime = 0;
let lastTieSpawnTime = 0;
let lastObjectSpawnTime = 0;
let gameStartTime = Date.now();
// Initialize stars
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push(new Star(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, Math.random() * 2 + 1));
}
let explosions = [];
// Initialize enemies
let enemies = [];
function spawnEnemy(t) {
    let lives, speed, width, height;
    if (t === EnemyType.STORMTROOPER) {
        lives = Math.floor(Math.random() * 5) + 1;
        speed = Math.random() * 2 + 1;
        width = 20 + lives * 5;
        height = 20 + lives * 5;
    }
    else if (t === EnemyType.TIEFIGHTER) {
        lives = Math.floor(Math.random() * 10) + 1;
        speed = Math.random() * 5 + 1;
        width = 30;
        height = 30;
    }
    else if (t === EnemyType.STARDESTROYER) {
        lives = Math.floor(Math.random() * 100) + 50;
        speed = 2;
        width = 100;
        height = 100;
    }
    else if (t === EnemyType.VADER) {
        lives = 150;
        speed = 0.1;
        width = 100;
        height = 100;
    }
    const x = canvas.width;
    const y = Math.random() * (canvas.height - height - 25) + 25;
    enemies.push(new Enemy(t, x, y, width, height, speed, lives));
}
// Initialize objects
let objects = [];
function spawnObject() {
    const width = 30;
    const height = 30;
    const x = canvas.width;
    const y = Math.random() * (canvas.height - height - 25) + 25;
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
    if (keysPressed.has('d')) {
        player.throwDisc();
    }
    player.update();
    const currentTime = Date.now();
    const elapsedTime = currentTime - gameStartTime;
    if (currentTime - lastSTSpawnTime >= 5000 + Math.random() * 5000) {
        spawnEnemy(EnemyType.STORMTROOPER);
        lastSTSpawnTime = currentTime;
    }
    if (elapsedTime > 0 && currentTime - lastTieSpawnTime >= 5000 + Math.random() * 5000) {
        spawnEnemy(EnemyType.TIEFIGHTER);
        lastTieSpawnTime = currentTime;
    }
    if (elapsedTime > 60000 && currentTime - lastSDSpawnTime >= 5000 + Math.random() * 5000) {
        spawnEnemy(EnemyType.STARDESTROYER);
        lastSDSpawnTime = currentTime;
    }
    if (elapsedTime > 120000
        && !enemies.some(e => e.type === EnemyType.VADER)
        && player.inventory.some(item => item.type === GameObjectType.LEIA)
        && player.inventory.some(item => item.type === GameObjectType.SABER)
        && player.inventory.some(item => item.type === GameObjectType.R2D2)
        && player.inventory.some(item => item.type === GameObjectType.YODA)
        && player.points > 5000) {
        spawnEnemy(EnemyType.VADER);
    }
    if (currentTime - lastObjectSpawnTime >= 5000 + Math.random() * 5000) {
        spawnObject();
        lastObjectSpawnTime = currentTime;
    }
    // Move objects and enemies
    objects.forEach(obj => obj.update());
    // Catch your Disc!
    const outObj = objects.filter(obj => obj.isOutOfScreen());
    if (outObj.some(obj => obj.type === GameObjectType.DISC)) {
        player.lives -= 1;
    }
    objects = objects.filter(obj => !obj.isOutOfScreen());
    enemies.forEach(enemy => enemy.update());
    enemies = enemies.filter(enemy => enemy.x + enemy.width > 0);
}
// Draw game objects
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.draw(ctx));
    explosions.forEach(explosion => explosion.draw(ctx));
    player.draw(ctx);
    // Draw objects
    objects.forEach(o => o.draw(ctx));
    // Draw enemies
    enemies.forEach(e => e.draw(ctx));
    // Draw status bar
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText("❤️ ".repeat(player.lives), 10, 20);
    ctx.fillText(`        Points: ${player.points}`, 100, 20);
    player.inventory.forEach((item, index) => {
        ctx.drawImage(item.image, 500 + index * 40, 5, 30, 30);
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
function win() {
    alert('You have defeated Darth Vader! You win!');
    player.x = 50;
    player.y = canvas.height / 2 - 25;
    player.lives = 3;
    player.points = 0;
}
function lose() {
    alert('You have been defeated! Game over!');
    player.x = 50;
    player.y = canvas.height / 2 - 25;
    player.lives = 3;
    player.points = 0;
}
// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// Start the game loop
gameLoop();
//# sourceMappingURL=hecht.js.map