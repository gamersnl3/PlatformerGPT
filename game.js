function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 1;

const playerImage = new Image();
playerImage.src = 'resources/cat.png';  // Player image path

const player = {
  x: 100,
  y: canvas.height - 150,
  width: 50,
  height: 38,  // Updated height
  speed: 5,
  dx: 0,
  dy: 0,
  jumping: false,
  crouching: false,
  originalHeight: 38,  // Updated original height
  crouchHeight: 19,  // Updated crouch height to half the original height
  facingRight: true,
  grounded: false, // New property to check if player is grounded
  maxHeight: Number.MAX_SAFE_INTEGER,
  newPlatformThreshold: canvas.height + 300 - randomIntFromInterval(100,150),
  prevPlatfromX: 200,
  prevPlatformWidth: canvas.width,
  currentHeight: 0 // New property to track the current height
};

let highScore = localStorage.getItem('highScore') || 0;

// Function to play audio
function playSound(soundId) {
  const sound = document.getElementById(soundId).cloneNode();
  sound.play();
}

// Function to play a random meow sound
function playRandomMeow() {
  const randomIndex = randomIntFromInterval(0, 8);
  const soundId = `meow${randomIndex}`;
  console.log(soundId)
  playSound(soundId);
}

var platforms = [
  { x: 0, y: canvas.height - 10, width: canvas.width, height: 20 },
  { x: 1000, y: canvas.height - 210, width: 200, height: 20 },
  { x: 600, y: canvas.height - 210 - 150, width: 200, height: 20 }
];

// Camera object
const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  follow: function (player) {
    // Horizontal camera movement
    if (player.x < this.x + 200) {
      this.x = player.x - 200;
    } else if (player.x + player.width > this.x + this.width - 200) {
      this.x = player.x + player.width - this.width + 200;
    }

    // Vertical camera movement
    if (player.y < this.y + 200) {
      this.y = player.y - 200;
    } else if (player.y + player.height > this.y + this.height - 200) {
      this.y = player.y + player.height - this.height + 200;
    }
  }
};

// Function to set the canvas size and adjust the camera
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.width = canvas.width;
  camera.height = canvas.height;
}

resizeCanvas();  // Initial call to set the canvas size

function drawPlayer() {
  ctx.save();

  if (player.facingRight) {
    if (player.crouching) {
      ctx.drawImage(playerImage, player.x, player.y, player.width, player.crouchHeight);
    } else {
      ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    }
  } else {
    ctx.scale(-1, 1);
    if (player.crouching) {
      ctx.drawImage(playerImage, -player.x - player.width, player.y, player.width, player.crouchHeight);
    } else {
      ctx.drawImage(playerImage, -player.x - player.width, player.y, player.width, player.height);
    }
  }

  ctx.restore();
}

function drawPlatforms() {
  platforms.forEach(platform => {
    ctx.fillStyle = platform.height < 20 ? 'red' : 'green';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

function drawScore() {
  ctx.save();
  ctx.font = '24px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText(`Height: ${Math.max(0, canvas.height - player.y)}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);
  ctx.restore();
}

function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  // Update current height
  player.currentHeight = canvas.height - player.y;

  // Check and update the high score
  if (player.currentHeight > highScore) {
    highScore = player.currentHeight;
    localStorage.setItem('highScore', highScore);
  }

  if (player.y < player.maxHeight) player.maxHeight = player.y;

  if (player.maxHeight < player.newPlatformThreshold) {
    player.newPlatformThreshold = player.newPlatformThreshold - randomIntFromInterval(100,150);
    console.log(player.maxHeight);
    width = randomIntFromInterval(100,500);
    x = player.prevPlatfromX + randomIntFromInterval(-200 - width, 200 + player.prevPlatformWidth);
    y = player.newPlatformThreshold - 200;
    player.prevPlatfromX = x;
    player.prevPlatformWidth = width;
    platforms = platforms.concat({ x: x, y: y, width: width, height: Math.floor(Math.random() * 2) * Math.floor(Math.random() * 2) == 1 ? 19 : 20 });
  }

  if (player.y + player.height < canvas.height) {
    player.dy += gravity;
    player.grounded = false;
  } else {
    if(player.dy > 30) playRandomMeow();  // Play random meow sound if falling fast
    player.dy = 0;
    player.jumping = false;
    player.grounded = true;
    player.y = canvas.height - player.height;
  }

  platforms.forEach(platform => {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height < platform.y + platform.height &&
      player.y + player.height + player.dy >= platform.y
    ) {
      if(player.dy > 30) playRandomMeow();  // Play random meow sound if falling fast
      player.dy = 0;
      player.jumping = false;
      player.grounded = true;
      player.y = platform.y - player.height;
    }
  });
}

function movePlayer() {
  if (keys['ArrowRight'] || keys['touchRight']) {
    player.dx = player.speed;
    player.facingRight = true;
  } else if (keys['ArrowLeft'] || keys['touchLeft']) {
    player.dx = -player.speed;
    player.facingRight = false;
  } else {
    player.dx = 0;
  }

  if ((keys['ArrowUp'] || keys['touchUp']) && !player.jumping && player.grounded && !player.crouching) {
    player.dy = -20;
    player.jumping = true;
    player.grounded = false;
    playSound('jumpSound');  // Play jump sound
  }

  if ((keys['ArrowDown'] || keys['touchDown']) && !player.jumping) {
    if (!player.crouching) player.y = player.y + 19; // Keep player on ground when crouching starts
    player.crouching = true;
    player.height = player.crouchHeight;
  } else {
    player.crouching = false;
    player.height = player.originalHeight;
  }
}

const keys = {};

function keyDown(e) {
  keys[e.key] = true;
}

function keyUp(e) {
  keys[e.key] = false;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Touch control handlers
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');

function preventDefaultTouch(e) {
  e.preventDefault();
}

leftButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchLeft'] = true; });
leftButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchLeft'] = false; });

rightButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchRight'] = true; });
rightButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchRight'] = false; });

upButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchUp'] = true; });
upButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchUp'] = false; });

downButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchDown'] = true; });
downButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchDown'] = false; });

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  clear();

  // Update camera position to follow the player
  camera.follow(player);

  // Translate the canvas context based on the camera position
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawPlayer();
  drawPlatforms();
  updatePlayer();
  movePlayer();

  ctx.restore();

  drawScore(); // Draw the score after restoring the context

  requestAnimationFrame(update);
}

playerImage.onload = function () {
  update();
}

// Event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);
