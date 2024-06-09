function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function getColor(intensity) {
  // Clamp the intensity to the range [0, 80000]
  intensity = Math.max(0, Math.min(10000, intensity));

  // Define the color points for the gradient
  const startColor = { r: 135, g: 206, b: 235 }; // Light blue
  const midColor = { r: 0, g: 0, b: 139 }; // Dark blue
  const thirdColor = { r: 75, g: 0, b: 130 }; // Dark purple
  const endColor = { r: 0, g: 0, b: 0 }; // Black

  // Calculate the ratio of the intensity within the range
  const ratio = intensity / 10000;

  let r, g, b;

  if (ratio < 0.5) {
    // Transition from light blue to dark blue
    const midRatio = ratio * 2;
    r = Math.round(startColor.r * (1 - midRatio) + midColor.r * midRatio);
    g = Math.round(startColor.g * (1 - midRatio) + midColor.g * midRatio);
    b = Math.round(startColor.b * (1 - midRatio) + midColor.b * midRatio);
  } else {
    // Transition from dark blue to dark purple to black
    const midRatio = (ratio - 0.5) * 2;
    if (midRatio < 0.5) {
      // Transition from dark blue to dark purple
      const secondRatio = midRatio * 2;
      r = Math.round(midColor.r * (1 - secondRatio) + thirdColor.r * secondRatio);
      g = Math.round(midColor.g * (1 - secondRatio) + thirdColor.g * secondRatio);
      b = Math.round(midColor.b * (1 - secondRatio) + thirdColor.b * secondRatio);
    } else {
      // Transition from dark purple to black
      const thirdRatio = (midRatio - 0.5) * 2;
      r = Math.round(thirdColor.r * (1 - thirdRatio) + endColor.r * thirdRatio);
      g = Math.round(thirdColor.g * (1 - thirdRatio) + endColor.g * thirdRatio);
      b = Math.round(thirdColor.b * (1 - thirdRatio) + endColor.b * thirdRatio);
    }
  }

  // Return the resulting color in RGB format
  return `rgb(${r}, ${g}, ${b})`;
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
  newPlatformThreshold: canvas.height + 300 - randomIntFromInterval(100, 150),
  prevPlatfromX: canvas.width / 3,
  prevPlatformWidth: 0,
  currentHeight: 0 // New property to track the current height
};

let highScore = localStorage.getItem('highScore') || 0;

let cheatCodeSequence = [];
const cheatCodePattern = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const requiredRepetitions = 5;
let cheatActivated = false;

const clouds = [];
const numClouds = 10;

for (let i = 0; i < numClouds; i++) {
  clouds.push({
    x: Math.random() * canvas.width,
    y: canvas.height - Math.random() * canvas.height,
    width: 100 + Math.random() * 150,
    height: 50 + Math.random() * 50,
    speed: 0.5 + Math.random()
  });
}

const stars = [];
const numStars = 100;

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: canvas.height - Math.random() * canvas.height,
    size: Math.random() * 2
  });
}

// Function to play audio
function playSound(soundId) {
  const sound = document.getElementById(soundId).cloneNode();
  sound.play();
}

// Function to play a random meow sound
function playRandomMeow() {
  const randomIndex = randomIntFromInterval(0, 8);
  const soundId = `meow${randomIndex}`;
  playSound(soundId);
}

var platforms = [
  { x: 0, y: canvas.height - 10, width: canvas.width, height: 20 },
];

// Camera object
const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  follow: function (player) {
    // Horizontal camera movement
    cameraHorizontalThreshold = 300 * canvas.width / 1920;
    if (player.x < this.x + cameraHorizontalThreshold) {
      this.x = player.x - cameraHorizontalThreshold;
    } else if (player.x + player.width > this.x + this.width - cameraHorizontalThreshold) {
      this.x = player.x + player.width - this.width + cameraHorizontalThreshold;
    }
    cameraVerticalThreshold = 200 * canvas.height / 1080;
    // Vertical camera movement
    if (player.y < this.y + cameraVerticalThreshold) {
      this.y = player.y - cameraVerticalThreshold;
    } else if (player.y + player.height > this.y + this.height - cameraVerticalThreshold) {
      this.y = player.y + player.height - this.height + cameraVerticalThreshold;
    }
  }
};

let scale = 1;  // Default scale

function setScale() {
  const minWidth = 800;  // Minimum width before scaling
  const minHeight = 600;  // Minimum height before scaling

  // Calculate the scale based on the canvas size
  if (canvas.width < minWidth || canvas.height < minHeight) {
    scale = Math.min(canvas.width / minWidth, canvas.height / minHeight);
  } else {
    scale = 1;
  }
}

// Function to set the canvas size and adjust the camera
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.width = canvas.width;
  camera.height = canvas.height;
  setScale();  // Set the scale based on the new canvas size
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

function drawClouds() {
  clouds.forEach(cloud => {
    opacity = Math.max(0.5 - Math.max(0, Math.min(10000, Math.max(0, canvas.height - player.y))) / 10000, 0) * 2 * 0.8
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.width < 0) {
      cloud.x = canvas.width;
      cloud.y = canvas.height - Math.random() * canvas.height;
    }
  });
}

function drawStars() {
  stars.forEach(star => {
    opacity = Math.max(Math.max(0, Math.min(10000, Math.max(0, canvas.height - player.y))) / 10000 - 0.3, 0) * (1 / 0.7)
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    star.y += 0.1;  // Stars move slightly to create a parallax effect
    if (star.y > canvas.height) {
      star.y = -star.size;
      star.x = Math.random() * canvas.width;
    }
  });
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
  color = getColor(Math.max(0, canvas.height - player.y)).split(',');
  ctx.fillStyle = `rgb(${255 - color[0].substring(4)},${255 - color[1]},${255 - color[2].substring(0, color[2].length - 1)})`;
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
  if (player.currentHeight > highScore && !cheatActivated) {
    highScore = player.currentHeight;
    localStorage.setItem('highScore', highScore);
  }

  if (player.y < player.maxHeight) player.maxHeight = player.y;

  if (player.maxHeight < player.newPlatformThreshold) {
    player.newPlatformThreshold = player.newPlatformThreshold - randomIntFromInterval(100, 150);
    width = randomIntFromInterval(100, 500);
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
    if (player.dy > 30) playRandomMeow();  // Play random meow sound if falling fast
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
      if (player.dy > 30) playRandomMeow();  // Play random meow sound if falling fast
      player.dy = 0;
      player.jumping = false;
      player.grounded = true;
      player.y = platform.y - player.height;
    }
  });
}

function activateCheat() {
  if (!cheatActivated) {
    cheatActivated = true;
    player.jumpBoost = true;
    alert('Cheat Activated: Jump Boost!\nHigh score will not update until refresh.');
  }
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
    player.dy = player.jumpBoost ? -30 : -20;  // Apply jump boost if activated
    player.jumping = true;
    player.grounded = false;
    playSound('jumpSound');  // Play jump sound
  }

  if ((keys['ArrowDown'] || keys['touchDown']) && !player.jumping) {
    if (!player.crouching) player.y = player.y + 19; // Keep player on ground when crouching starts
    player.crouching = true;
    player.height = player.crouchHeight;
  } else {
    if (player.crouching) player.y = player.y - 19; // Stop the player from phasing into the ground
    player.crouching = false;
    player.height = player.originalHeight;
  }
}

const keys = {};

function keyDown(e) {
  keys[e.key] = true;
  updateCheatCodeSequence(e.key);
}

function keyUp(e) {
  keys[e.key] = false;
}

function updateCheatCodeSequence(key) {
  // Add the pressed key to the sequence
  cheatCodeSequence.push(key);

  // Check if the sequence matches the cheat code pattern repeated 5 times
  const requiredLength = cheatCodePattern.length * requiredRepetitions;
  if (cheatCodeSequence.length > requiredLength) {
    // Remove the oldest entry if the sequence exceeds the required length
    cheatCodeSequence.shift();
  }

  // Check if the sequence matches the cheat code pattern
  if (cheatCodeSequence.length === requiredLength) {
    const expectedSequence = Array(requiredRepetitions).fill(cheatCodePattern).flat();
    if (cheatCodeSequence.every((key, index) => key === expectedSequence[index])) {
      activateCheat();
    }
  }
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

function handleTouchButtonPress(button) {
  updateCheatCodeSequence(button);
}

leftButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchLeft'] = true; handleTouchButtonPress('ArrowLeft'); });
leftButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchLeft'] = false; });

rightButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchRight'] = true; handleTouchButtonPress('ArrowRight'); });
rightButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchRight'] = false; });

upButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchUp'] = true; handleTouchButtonPress('ArrowUp'); });
upButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchUp'] = false; });

downButton.addEventListener('touchstart', (e) => { preventDefaultTouch(e); keys['touchDown'] = true; handleTouchButtonPress('ArrowDown'); });
downButton.addEventListener('touchend', (e) => { preventDefaultTouch(e); keys['touchDown'] = false; });

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  clear();

  // Update background color based on height
  canvas.style.backgroundColor = getColor(Math.max(0, canvas.height - player.y));

  // Update camera position to follow the player
  camera.follow(player);

  drawClouds();  // Draw clouds first
  drawStars();   // Draw stars after clouds for proper layering

  const offsetX = (canvas.width - canvas.width * scale) / 2;
  const offsetY = (canvas.height - canvas.height * scale) / 2;

  // Apply scaling
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Translate the canvas context based on the camera position
  ctx.translate(-camera.x, -camera.y);


  drawPlatforms();
  drawPlayer();
  updatePlayer();
  movePlayer();

  ctx.restore();

  drawScore(); // Draw the score after restoring the context

  requestAnimationFrame(update);
}

playerImage.onload = function () {
  setScale();  // Set initial scale
  update();
}

// Event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);
resizeCanvas();  // Initial call to set the canvas size and scale
