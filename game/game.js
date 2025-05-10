const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const darkModeToggle = document.getElementById('darkModeToggle');

// Set initial volume (0.5 = 50%)
bgMusic.volume = 0.05;

// Add click event listener to start music
let musicStarted = false;
let isMusicOn = true; // Moved outside of click event

// Initialize music state based on button state if it exists
if (musicToggle) {
    isMusicOn = true; // Устанавливаем музыку в активное состояние
    musicToggle.classList.add('active'); // Добавляем класс active к кнопке
    bgMusic.play().catch(error => {
        console.log('Music playback failed:', error);
    });
}

canvas.addEventListener('click', () => {
    if (!musicStarted) {
        bgMusic.play().catch(error => {
            console.log('Music playback failed:', error);
        });
        musicStarted = true;
    }
});

// Music toggle functionality
musicToggle.addEventListener('click', () => {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
        bgMusic.play();
        musicToggle.classList.add('active');
    } else {
        bgMusic.pause();
        musicToggle.classList.remove('active');
    }
});

// Dark mode functionality
let isDarkMode = false;
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    document.querySelector('.game-container').classList.toggle('dark-mode');
    document.getElementById('gameCanvas').classList.toggle('dark-mode');
    document.getElementById('score').classList.toggle('dark-mode');
    document.getElementById('gameOver').classList.toggle('dark-mode');
    
    // Update button styles
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.classList.toggle('dark-mode');
    });
    
    darkModeToggle.classList.toggle('active');
});

// Set canvas size
canvas.width = 800;
// Set canvas height to window height minus some padding for UI elements
canvas.height = window.innerHeight - 100;

// Center the canvas on the page
canvas.style.position = 'absolute';
canvas.style.left = '50%';
canvas.style.top = '50%';
canvas.style.transform = 'translate(-50%, -50%)';

// Add window resize handler
window.addEventListener('resize', () => {
    if (isMobileDevice()) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Only reinitialize platforms if game is not over
        if (!gameOver) {
            initPlatforms();
        }
    } else {
        canvas.width = 800;
        canvas.height = window.innerHeight - 100;
        // Only reinitialize platforms if game is not over
        if (!gameOver) {
            initPlatforms();
        }
    }
});

// Game variables
let score = 0;
let gameOver = false;
let platforms = [];
const platformCount = Math.ceil(canvas.height / 100); 
const platformWidth = 100;
const platformHeight = 20;
const platformGap = canvas.height / platformCount;
const startPlatformWidth = 200;

// Player variables
const player = {
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    speed: 5,
    jumpForce: -15,
    gravity: 0.4,
    image: null
};

// Load player image
function loadPlayerImage() {
    const img = new Image();
    img.src = 'святпнг.png'; // Make sure to create a player.png file in the same directory
    img.onload = () => {
        player.image = img;
    };
}

// Функция для проверки, является ли устройство мобильным
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Инициализация игры
function init() {
    loadPlayerImage();
    
    // Check if device is mobile
    if (isMobileDevice()) {
        // Set canvas size to full screen for mobile
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Make sure canvas doesn't have any transform that could affect its display
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.transform = 'none';
        // Show mobile controls
        document.querySelector('.mobile-controls').style.display = 'flex';
    } else {
        // Desktop settings
        canvas.width = 800;
        canvas.height = window.innerHeight - 100;
        // Center the canvas
        canvas.style.position = 'absolute';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        // Hide mobile controls
        document.querySelector('.mobile-controls').style.display = 'none';
    }
    
    // Initialize player position after canvas size is set
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 100;
    
    // Initialize platforms based on new canvas size
    initPlatforms();
    
    // Try to play music
    if (isMusicOn && !gameOver) {
        bgMusic.play().catch(error => {
            console.log('Music playback failed:', error);
        });
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = 'siski.png';
        // Preload image to get its dimensions
        this.image.onload = () => {
            this.originalHeight = this.image.height;
            this.originalWidth = this.image.width;
        };
    }

    draw() {
        // If image is loaded, use its original dimensions
        if (this.image.complete && this.image.naturalHeight) {
            // Calculate scale based on width to maintain aspect ratio
            const scale = this.width / this.image.width;
            const scaledHeight = this.image.height * scale;
            ctx.drawImage(this.image, this.x, this.y, this.width, scaledHeight);
        } else {
            // Fallback to green rectangle if image isn't loaded yet
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Initialize platforms
function initPlatforms() {
    platforms = [];
    // Create a large starting platform
    const startPlatform = new Platform(
        (canvas.width - startPlatformWidth) / 2,
        canvas.height - 50,
        startPlatformWidth,
        platformHeight
    );
    platforms.push(startPlatform);
    
    // Create remaining platforms
    for (let i = 1; i < platformCount; i++) {
        const x = Math.random() * (canvas.width - platformWidth);
        const y = i * platformGap;
        platforms.push(new Platform(x, y, platformWidth, platformHeight));
    }
}

// Game controls
let leftPressed = false;
let rightPressed = false;

// Add spacebar listener for restart
document.addEventListener('keydown', (e) => {
    // Get the key code for better handling of different layouts
    const keyCode = e.keyCode || e.which;
    
    // Check for left movement keys
    if (keyCode === 37 || // ArrowLeft
       keyCode === 65 || // A
       keyCode === 1040) { // Ф (Russian A)
        leftPressed = true;
    }
    
    // Check for right movement keys
    if (keyCode === 39 || // ArrowRight
       keyCode === 68 || // D
       keyCode === 1042) { // В (Russian D)
        rightPressed = true;
    }
    
    // Check for spacebar to restart game
    if (keyCode === 32 && gameOver) {
        gameOver = false;
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        gameOverElement.classList.add('hidden');
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 100;
        player.velocityY = 0;
        player.velocityX = 0;
        initPlatforms();
    }
});

// Add spacebar release listener
document.addEventListener('keyup', (e) => {
    const keyCode = e.keyCode || e.which;
    
    if (keyCode === 37 || keyCode === 65 || keyCode === 1040) leftPressed = false;
    if (keyCode === 39 || keyCode === 68 || keyCode === 1042) rightPressed = false;
});

// Check collision between player and platform
function checkPlatformCollision() {
    for (let platform of platforms) {
        if (player.velocityY > 0 && 
            player.x + player.width > platform.x && 
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 10) {
            player.velocityY = player.jumpForce;
            return true;
        }
    }
    return false;
}

// Update game state
function update() {
    if (gameOver) return;

    // Player movement
    if (leftPressed) player.velocityX = -player.speed;
    if (rightPressed) player.velocityX = player.speed;
    if (!leftPressed && !rightPressed) player.velocityX = 0;

    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.x += player.velocityX;

    // Screen wrapping
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;

    // Check platform collision
    checkPlatformCollision();

    // Move platforms down when player reaches top
    if (player.y < canvas.height / 2) {
        const diff = canvas.height / 2 - player.y;
        player.y += diff;
        score += Math.floor(diff);
        scoreElement.textContent = `Score: ${score}`;
        
        platforms.forEach(platform => {
            platform.y += diff;
            if (platform.y > canvas.height) {
                platform.y = 0;
                platform.x = Math.random() * (canvas.width - platformWidth);
            }
        });
    }

    // Game over condition
    if (player.y > canvas.height) {
        gameOver = true;
        gameOverElement.classList.remove('hidden');
        finalScoreElement.textContent = score;
    }
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    platforms.forEach(platform => platform.draw());

    // Draw player
    if (player.image) {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    } else {
        // Fallback to cube if image isn't loaded yet
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Update score and dynamic text
    let dynamicText = '';
    if (score >= 100000) {
        dynamicText = 'БОГ СИСЕК!';
    } else if (score >= 50000) {
        dynamicText = 'ГУРУ СЕКСА';
    } else if (score >= 10000) {
        dynamicText = 'ЛЮБИТЕЛЬ';
    } else if (score >= 5000) {
        dynamicText = 'ЛОШОК';
    } else {
        dynamicText = 'Начинающий сиськопрыг';
    }
    
    scoreElement.textContent = `СИСЬКИ: ${score} ${dynamicText}`;
    
    if (gameOver) {
        gameOverElement.classList.remove('hidden');
        finalScoreElement.textContent = score;
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Restart game
restartButton.addEventListener('click', () => {
    gameOver = false;
    score = 0;
    scoreElement.textContent = 'Score: 0';
    gameOverElement.classList.add('hidden');
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    player.velocityX = 0;
    platforms = [];
    initPlatforms();
    
    // Handle music state
    if (isMusicOn && bgMusic.paused) {
        bgMusic.play().catch(error => {
            console.log('Music playback failed:', error);
        });
    }
});

// Добавление обработчиков событий для мобильных кнопок
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    leftPressed = true;
});

leftButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    leftPressed = false;
});

rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    rightPressed = true;
});

rightButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение
    rightPressed = false;
});

// Add these to make mobile controls more responsive
leftButton.addEventListener('mousedown', () => leftPressed = true);
leftButton.addEventListener('mouseup', () => leftPressed = false);
leftButton.addEventListener('mouseleave', () => leftPressed = false);

rightButton.addEventListener('mousedown', () => rightPressed = true);
rightButton.addEventListener('mouseup', () => rightPressed = false);
rightButton.addEventListener('mouseleave', () => rightPressed = false);

// Start the game
init();
gameLoop();