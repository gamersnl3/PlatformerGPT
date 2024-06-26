function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function getColor(intensity) {
  // Clamp the intensity to the range [0, 10000]
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

// Make the player teleport up. Usefull for testing.
function playerUp(height) {
  player.newPlatformThreshold = canvas.height - height + 300;
  player.prevPlatfromX = player.x;
  player.prevPlatformWidth = 200;
  platforms = platforms.concat({ x: player.x, y: canvas.height - height, width: 200, height: Math.floor(Math.random() * 2) * Math.floor(Math.random() * 2) == 1 ? 19 : 20 });
  player.y = canvas.height - height - 100;
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isPaused = false;

// Sample achievements
const initialAchievements = [
  { id: 1, title: "First Jump", description: "Jump for the first time", unlocked: false, image: "resources/cat.png" },
  { id: 2, title: "High Jumper", description: "Reach a height of 1000", unlocked: false, image: "resources/cat.png" },
  { id: 3, title: "Speed Runner", description: "Run for 500 meters", unlocked: false, image: "resources/cat.png" },
  { id: 4, title: "Frequent Flyer", description: "Jump 1000 times", unlocked: false, image: "resources/cat.png" },
  { id: 5, title: "Lunar Explorer", description: "Reach the Moon and marvel at its beauty", unlocked: false, image: "resources/cat.png" },
  { id: 6, title: "Mercurial Messenger", description: "Travel far enough to reach Mercury", unlocked: false, image: "resources/cat.png" },
  { id: 7, title: "Venusian Voyager", description: "Set your sights on Venus and get there", unlocked: false, image: "resources/cat.png" },
  { id: 8, title: "Martian Adventurer", description: "Reach the red planet Mars", unlocked: false, image: "resources/cat.png" },
  { id: 9, title: "Jovian Journeyman", description: "Make it all the way to Jupiter", unlocked: false, image: "resources/cat.png" },
  { id: 10, title: "Saturnian Scout", description: "Navigate the cosmos to find Saturn", unlocked: false, image: "resources/cat.png" },
  { id: 11, title: "Uranian Pioneer", description: "Reach the distant planet Uranus", unlocked: false, image: "resources/cat.png" },
  { id: 12, title: "Neptunian Navigator", description: "Venture far enough to discover Neptune", unlocked: false, image: "resources/cat.png" },
];

// Function to load achievements from localStorage
function loadAchievements() {
  const savedUnlockedIds = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
  return initialAchievements.map(achievement => ({
    ...achievement,
    unlocked: savedUnlockedIds.includes(achievement.id)
  }));
}

// Function to save achievements to localStorage
function saveAchievements() {
  const unlockedIds = achievements
    .filter(achievement => achievement.unlocked)
    .map(achievement => achievement.id);
  localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedIds));
}

// Load achievements on game start
let achievements = loadAchievements();

// Function to unlock an achievement
function unlockAchievement(id) {
  const achievement = achievements.find(ach => ach.id === id);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    saveAchievements();
    console.log(`Achievement Unlocked: ${achievement.title}`);
    showNotification(achievement);
  }
}

// Function to lock an achievement
function lockAchievement(id) {
  const achievement = achievements.find(ach => ach.id === id);
  if (achievement && achievement.unlocked) {
    achievement.unlocked = false;
    saveAchievements();
    console.log(`Achievement locked: ${achievement.title}`);
  }
}

// Function to show achievements
function showAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  achievementsList.innerHTML = ''; // Clear previous list

  achievements.forEach(ach => {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement';
    achievementElement.innerHTML = `
      <img src="${ach.image}" alt="${ach.title}">
      <h2>${ach.title}</h2>
      <p>${ach.description}</p>
      <p style="color: ${ach.unlocked ? '#00FF00' : '#FF0000'}">Status: ${ach.unlocked ? 'Unlocked' : 'Locked'}</p>
    `;
    achievementsList.appendChild(achievementElement);
  });
}

// Function to show notification
function showNotification(achievement) {
  const notifications = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <img src="${achievement.image}" alt="${achievement.title}">
    <div class="notification-content">
      <strong>${achievement.title}</strong>
      <p>${achievement.description.slice(0, 50)}...</p>
    </div>
  `;
  notifications.appendChild(notification);

  // Automatically remove the notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = 0;
    setTimeout(() => notifications.removeChild(notification), 500);
  }, 3000);
}

const gravity = 1;

const playerImage = new Image();
playerImage.src = 'resources/cat.png';  // Player image path

const planetImages = {
  moon: new Image(),
  mercury: new Image(),
  venus: new Image(),
  mars: new Image(),
  jupiter: new Image(),
  saturn: new Image(),
  uranus: new Image(),
  neptune: new Image()
};

const planetUrls = {
  moon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1920px-FullMoon2010.jpg',
  mercury: 'https://science.nasa.gov/wp-content/uploads/2023/11/mercury-messenger-globe-pia15162.jpg?w=4096&format=jpeg&crop=1',
  venus: 'https://science.nasa.gov/wp-content/uploads/2016/05/venus2-jpg.webp?w=4096&format=png&crop=1',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg',
  saturn: 'https://planetfacts.org/wp-content/uploads/2023/12/planet_saturn.jpg',
  uranus: 'https://science.nasa.gov/wp-content/uploads/2023/09/PIA01492-1.jpg?w=4096&format=jpeg',
  neptune: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Neptune_Voyager2_color_calibrated.png'
};

for (let planet in planetImages) {
  if (planetUrls[planet]) {
    planetImages[planet].src = planetUrls[planet];
  }
}
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
  currentHeight: 0, // New property to track the current height
  jumps: Number.parseInt(localStorage.getItem('jumps')) || 0,
  metersMoved: Number.parseInt(localStorage.getItem('metersMoved')) || 0,
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

// Function to toggle the pause state
function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pauseMenu').style.display = isPaused ? 'flex' : 'none';

  if (isPaused) {
    showAchievements();
  }
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
// Camera boundries:
// (X - camera.x < 0) left
// (canvas.width - (X - camera.x) < 0) right
// (Y - camera.y - canvas.height > 0) down
// (Y - camera.y < 0) up

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
  opacity = Math.max(0.5 - Math.max(0, Math.min(10000, Math.max(0, canvas.height - camera.y))) / 10000, 0) * 2 * 0.8
  clouds.forEach(cloud => {
    if (opacity > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(cloud.x - camera.x, cloud.y - camera.y, cloud.width, cloud.height);
    }
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.width < camera.x + (canvas.width - canvas.width / scale) / 2) {
      cloud.x = camera.x + (canvas.width - canvas.width / scale) / 2 + canvas.width / scale;
      cloud.y = camera.y + (canvas.height - canvas.height / scale) / 2 + Math.random() * canvas.height / scale;
    } else if (camera.x + (canvas.width - canvas.width / scale) / 2 + canvas.width / scale < cloud.x) {
      cloud.x = camera.x + (canvas.width - canvas.width / scale) / 2 - cloud.width;
      cloud.y = camera.y + (canvas.height - canvas.height / scale) / 2 + Math.random() * canvas.height / scale;
    } else if (cloud.y > camera.y + (canvas.height - canvas.height / scale) / 2 + canvas.height / scale) {
      cloud.y = camera.y + (canvas.height - canvas.height / scale) / 2 - cloud.height;
    } else if (cloud.y + cloud.height < camera.y + (canvas.height - canvas.height / scale) / 2) {
      cloud.y = camera.y + (canvas.height - canvas.height / scale) / 2 + canvas.height / scale;
    }
  });
}

function drawStars() {
  stars.forEach(star => {
    opacity = Math.max(Math.max(0, Math.min(10000, Math.max(0, canvas.height - camera.y))) / 10000 - 0.3, 0) * (1 / 0.7)
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

function drawSun(x, y, radius) {
  // Draw the sun body
  const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
  gradient.addColorStop(0, 'yellow');
  gradient.addColorStop(1, 'orange');

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw sun rays
  const numRays = 20;
  const rayLength = radius * 1.5;
  ctx.lineWidth = 5;

  for (let i = 0; i < numRays; i++) {
    const angle = (i * 2 * Math.PI) / numRays;
    const startX = x + Math.cos(angle) * radius;
    const startY = y + Math.sin(angle) * radius;
    const endX = x + Math.cos(angle) * rayLength;
    const endY = y + Math.sin(angle) * rayLength;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)'; // Slightly transparent orange for rays
    ctx.stroke();
  }
}

function drawPlanets() {
  if (canvas.height - camera.y < 5000) {
    drawSun(canvas.width - canvas.width / 8, canvas.height / 8 + (canvas.height - camera.y) / 5000 * (canvas.height * 1.1), canvas.width / 16);
  } else if (canvas.height - camera.y > 10000 && canvas.height - camera.y < 15000) {
    if (!achievements.find(ach => ach.id === 5).unlocked && canvas.height - camera.y > 11000 && !cheatActivated) unlockAchievement(5);
    ctx.drawImage(planetImages['moon'], canvas.width / 2, (canvas.height - camera.y - 10000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 16000 && canvas.height - camera.y < 21000) {
    if (!achievements.find(ach => ach.id === 6).unlocked && canvas.height - camera.y > 17000 && !cheatActivated) unlockAchievement(6);
    ctx.drawImage(planetImages['mercury'], canvas.width / 2, (canvas.height - camera.y - 16000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 22000 && canvas.height - camera.y < 27000) {
    if (!achievements.find(ach => ach.id === 7).unlocked && canvas.height - camera.y > 23000 && !cheatActivated) unlockAchievement(7);
    ctx.drawImage(planetImages['venus'], canvas.width / 2, (canvas.height - camera.y - 22000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 28000 && canvas.height - camera.y < 33000) {
    if (!achievements.find(ach => ach.id === 8).unlocked && canvas.height - camera.y > 29000 && !cheatActivated) unlockAchievement(8);
    ctx.drawImage(planetImages['mars'], canvas.width / 2, (canvas.height - camera.y - 28000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 34000 && canvas.height - camera.y < 39000) {
    if (!achievements.find(ach => ach.id === 9).unlocked && canvas.height - camera.y > 35000 && !cheatActivated) unlockAchievement(9);
    ctx.drawImage(planetImages['jupiter'], canvas.width / 2, (canvas.height - camera.y - 34000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 40000 && canvas.height - camera.y < 45000) {
    if (!achievements.find(ach => ach.id === 10).unlocked && canvas.height - camera.y > 41000 && !cheatActivated) unlockAchievement(10);
    ctx.drawImage(planetImages['saturn'], canvas.width / 2, (canvas.height - camera.y - 40000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 46000 && canvas.height - camera.y < 51000) {
    if (!achievements.find(ach => ach.id === 11).unlocked && canvas.height - camera.y > 47000 && !cheatActivated) unlockAchievement(11);
    ctx.drawImage(planetImages['uranus'], canvas.width / 2, (canvas.height - camera.y - 46000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  } else if (canvas.height - camera.y > 52000 && canvas.height - camera.y < 57000) {
    if (!achievements.find(ach => ach.id === 12).unlocked && canvas.height - camera.y > 53000 && !cheatActivated) unlockAchievement(12);
    ctx.drawImage(planetImages['neptune'], canvas.width / 2, (canvas.height - camera.y - 52000) / 5000 * (canvas.height + canvas.width) - canvas.width, canvas.width, canvas.width);
  }
}

/**
 * Draw an arrow on the canvas.
 * @param {number} x - The starting x position of the arrow.
 * @param {number} y - The starting y position of the arrow.
 * @param {string} direction - The direction the arrow points ('left' or 'right').
 * @param {number} [length=50] - The length of the arrow.
 * @param {number} [width=20] - The width of the arrow.
 * @param {string} [color='black'] - The color of the arrow.
 */
function drawArrow(x, y, direction, length = 50, width = 20, color = 'black') {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();

  if (direction === 'right') {
    // Draw arrow pointing to the right
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.lineTo(x + length - width, y - width);
    ctx.moveTo(x + length, y);
    ctx.lineTo(x + length - width, y + width);
  } else if (direction === 'left') {
    // Draw arrow pointing to the left
    ctx.moveTo(x, y);
    ctx.lineTo(x - length, y);
    ctx.lineTo(x - length + width, y - width);
    ctx.moveTo(x - length, y);
    ctx.lineTo(x - length + width, y + width);
  }

  ctx.stroke();
  ctx.closePath();
}


function drawPlatforms() {
  platforms.forEach(platform => {
    if (platform.x + platform.width >= camera.x + (canvas.width - canvas.width / scale) / 2
      && platform.x <= camera.x + (canvas.width - canvas.width / scale) / 2 + canvas.width / scale
      && platform.y + platform.height >= camera.y + (canvas.height - canvas.height / scale) / 2
      && platform.y <= camera.y + (canvas.height - canvas.height / scale) / 2 + canvas.height / scale) {
      ctx.fillStyle = platform.height < 20 ? 'red' : 'green';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
  });
}

function drawScore() {
  ctx.save();
  ctx.font = '24px Arial';
  color = getColor(Math.max(0, canvas.height - camera.y)).split(',');
  ctx.fillStyle = `rgb(${255 - color[0].substring(4)},${255 - color[1]},${255 - color[2].substring(0, color[2].length - 1)})`;
  ctx.fillText(`Height: ${Math.max(0, player.currentHeight)}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);
  ctx.restore();
}

function updatePlayer() {
  player.x += player.dx;
  player.y += player.dy;

  // Update current height
  player.currentHeight = canvas.height - player.y;

  if (!cheatActivated && !achievements.find(ach => ach.id === 2).unlocked && player.currentHeight >= 1000) unlockAchievement(2);
  if (!cheatActivated && player.grounded) player.metersMoved += Math.abs(player.dx / 200);
  localStorage.setItem('metersMoved', player.metersMoved);
  if (!cheatActivated && !achievements.find(ach => ach.id === 3).unlocked && player.metersMoved >= 500) unlockAchievement(3);
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
    if (confirm('Press ok to activate: Jump Boost!\nHigh score will not update until refresh.')) {
      cheatActivated = true;
      player.jumpBoost = true;
      for (const [key, value] of Object.entries(keys)) {
        keys[key] = false;
      }
    } else {
      for (const [key, value] of Object.entries(keys)) {
        keys[key] = false;
      }
    }
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
    if (!cheatActivated) player.jumps++;
    localStorage.setItem('jumps', player.jumps);
    if (!achievements.find(ach => ach.id === 1).unlocked && !cheatActivated && player.jumps >= 1) unlockAchievement(1);
    if (!achievements.find(ach => ach.id === 4).unlocked && !cheatActivated && player.jumps >= 1000) unlockAchievement(4);
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

// Event listeners for the pause button
document.getElementById('pauseButton').addEventListener('click', () => {
  togglePause();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    togglePause();
  }
});

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  clear();

  // Update background color based on height
  canvas.style.backgroundColor = getColor(Math.max(0, canvas.height - camera.y));

  // Update camera position to follow the player
  camera.follow(player);

  drawStars();   // Draw stars after clouds for proper layering

  drawPlanets();

  const offsetX = (canvas.width - canvas.width * scale) / 2;
  const offsetY = (canvas.height - canvas.height * scale) / 2;
  // platforms = platforms.concat({ x: camera.x + (canvas.width-canvas.width/scale)/2, y: camera.y + (canvas.height-canvas.height/scale)/2, width: canvas.width/scale, height: canvas.height/scale });
  // Apply scaling
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  drawClouds();  // Draw clouds first
  // Translate the canvas context based on the camera position
  ctx.translate(-camera.x, -camera.y);


  drawPlatforms();
  drawPlayer();
  updatePlayer();
  movePlayer();

  ctx.restore();

  drawScore(); // Draw the score after restoring the context

  if (camera.x + (canvas.width - canvas.width / scale) / 2 + canvas.width / scale < 0 && player.currentHeight <= 248) { // Draw a helpful arrow if the player is on the ground and can't see the first platform
    drawArrow(canvas.width - canvas.width / 8, canvas.height / 2, 'right');
  } else if (camera.x + (canvas.width - canvas.width / scale) / 2 - platforms[0].width > 0 && player.currentHeight <= 248) {
    drawArrow(canvas.width / 8, canvas.height / 2, 'left');
  }

  requestAnimationFrame(update);
}

playerImage.onload = function () {
  setScale();  // Set initial scale
  update();
}

// Event listener to resize the canvas when the window is resized
window.addEventListener('resize', resizeCanvas);
resizeCanvas();  // Initial call to set the canvas size and scale
