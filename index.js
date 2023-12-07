// console.log(gsap);

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreElement = document.getElementById('scoreElement');
// console.log(scoreElement);
const finalScore = document.getElementById('finalScore');

const highScore = document.getElementById('highScore');

const startGameButton = document.getElementById('startGameButton');

const modal = document.getElementById('modal');

class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }
};

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x; 
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x; 
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
    }
    
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;

class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x; 
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }
    
    draw(){
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
// player.draw();

let projectiles = [];
// const projectile = new Projectile(x, y, 5, 'red', {x:1, y:1});

let enemies = [];

let particles = [];

function init(){
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElement.innerHTML = 0;
    finalScore.innerHTML = 0;
}

function spawnEnemies(){
    setInterval(() => {
        const radius = 5 + Math.random() * 25;
        let x;
        let y;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle) * 0.75,
            y: Math.sin(angle) * 0.75
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1500);
}

let animationId;
let score = 0;
let high = 0;
function animate(){
    animationId = requestAnimationFrame(animate);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // context.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            setTimeout(() => {
                particles.splice(index, 1);
            }, 0);
        }
        else{
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        // console.log(projectile);

        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0)
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if(dist - player.radius - enemy.radius < 1){
            cancelAnimationFrame(animationId);
            modal.style.display = 'flex';
            finalScore.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            if(dist - projectile.radius - enemy.radius < 1){
                // console.log("Enemy removed");

                for(let i = 0; i < 8; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (7 * Math.random()), y: (Math.random() - 0.5) * (7 * Math.random())}));
                }

                if(enemy.radius - 10 > 5){
                    score += 100;
                    scoreElement.innerHTML = score;

                    high = Math.max(high, score);
                    highScore.innerHTML = high;

                    // enemy.radius -= 10;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
                else{
                    score += 250;
                    scoreElement.innerHTML = score;

                    high = Math.max(high, score);
                    highScore.innerHTML = high;

                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);       
                }
            }

        })
    })
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - y, event.clientX - x);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(
        x,
        y,
        5,
        'white',
        velocity
    ));
    // const projectile = new Projectile(x, y, 5, 'red', {x:1, y:1});
    // projectile.draw();
    // console.log(event, projectiles);
})

startGameButton.addEventListener('click', (event) => {
    init();
    animate();
    spawnEnemies();
    modal.style.display = 'none';
})

// animate();
// spawnEnemies();
// console.log(context);