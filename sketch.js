/*
Author(s): Team Uhhhhhh
Date: 06/11/2022
Description: This script uses p5.js to simulate the behavior of slime molds in the genus Physarum.  
*/

// Pre-setup pi
const INIT_PI = 3.14159265358979323846;

// Dimensions of the image to be rendered
const imageWidth = 200;
const imageHeight = 200;

// Mouse click radius
const clickRadius = 20;

// The number of particles spawned per click
const particlesPerClick = 1000;

// The maximum number of particles that can be spawned
const maxParticles = 100000;

// Diffusion size
const diffK = 2;

// Decay factor
let decayT = 0.9;

// Sensor angle (radians)
let SA = INIT_PI / 8;

// Rotate angle (radians)
let RA = INIT_PI / 4;

// Sensor offset distance
const SO = 9;

// Sensor width
const SW = 1;

// Step size
let SS = 1;

// Attract factor
const depT = 5;

// Arrays containing the particles, attracters, and emitters in the scene
let particles = [];
const attracters = [];
const emitters = [];

// Number of particles emitted per second by emitters in the scene
let numParticlesEmitted = 5;

// Image of attractors (the visual output by p5)
let at;

function setup() {
  at = createImage(imageWidth, imageHeight);
  diffused = createImage(imageWidth, imageHeight);
  at.loadPixels();
  diffused.loadPixels();
  var canvas = createCanvas(imageWidth, imageHeight);
  canvas.parent("slimeContainer")
  background(0);
  for (let i = 0; i < imageHeight; i++) {
    let length = [];
    for (let j = 0; j < imageWidth; j++) {
      length.push(0);
    }
    attracters.push(length);
  }
}

function draw() {
  background(0);
  stroke(255);
  fill(255, 255, 255, 50);
  textAlign(CENTER, CENTER);
  image(at, 0, 0);
  for (let x of emitters) {
    for (let i = 0; i < numParticlesEmitted && particles.length < maxParticles; i++) {
      particles.push([x[0], x[1], TWO_PI * Math.random()]);
    }
    text("🤓", x[0], x[1]);
  }
  ellipse(mouseX, mouseY, 2 * clickRadius, 2 * clickRadius);
  sense();
  updateParticles();
  decay();
}

function writePixel(image, x, y, g) {
  let index = (x + y * width) * 4;
  image.pixels[index] = g;
  image.pixels[index + 1] = g;
  image.pixels[index + 2] = g;
  image.pixels[index + 3] = 255;
}

function modifiedRound(i, axis) {
  let x = round(i);
  if (x < 0 && axis == "x") x += imageHeight;
  else if (x >= imageHeight && axis == "x") x %= imageHeight;
  else if (x < 0 && axis == "y") x += imageWidth;
  else if (x >= imageWidth && axis == "y") x %= imageWidth;
  return x;
}

function sense() {
  for (let i = 0; i < particles.length; i++) {
    let options = [0, 0, 0];
    options[1] =
      attracters[modifiedRound(particles[i][0] + SO * cos(particles[i][2]), "x")][
        modifiedRound(particles[i][1] + SO * sin(particles[i][2]), "y")
      ];
    options[0] =
      attracters[
        modifiedRound(particles[i][0] + SO * cos(particles[i][2] + SA), "x")
      ][modifiedRound(particles[i][1] + SO * sin(particles[i][2] + SA), "y")];
    options[2] =
      attracters[
        modifiedRound(particles[i][0] + SO * cos(particles[i][2] - SA), "x")
      ][modifiedRound(particles[i][1] + SO * sin(particles[i][2] - SA), "y")];
    if (options[1] >= options[2] && options[1] >= options[0]) {
      continue;
    } else if (options[0] > options[2]) {
      particles[i][2] = (particles[i][2] + RA) % TWO_PI;
    } else if (options[0] < options[2]) {
      particles[i][2] = (particles[i][2] - RA) % TWO_PI;
    } else {
      let rand = Math.random();
      if (rand < 0.5) {
        particles[i][2] = (particles[i][2] + RA) % TWO_PI;
      } else {
        particles[i][2] = (particles[i][2] - RA) % TWO_PI;
      }
    }
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let x = (particles[i][0] + SS * cos(particles[i][2])) % imageHeight;
    let y = (particles[i][1] + SS * sin(particles[i][2])) % imageWidth;
    if (x < 0) {
      x += imageHeight;
    }
    if (y < 0) {
      y += imageWidth;
    }
    particles[i][0] = x;
    particles[i][1] = y;
    let p1 = modifiedRound(particles[i][0] - diffK / 2, "x");
    let p2 = modifiedRound(particles[i][1] - diffK / 2, "y");
    attracters[p1][p2] += depT;
  }
}

function decay() {
  for (let i = 0; i < imageHeight; i++) {
    for (let j = 0; j < imageWidth; j++) {
      writePixel(at, i, j, attracters[i][j]);
    }
  }
  at.filter(BLUR, diffK);
  for (let i = 0; i < imageHeight; i++) {
    for (let j = 0; j < imageWidth; j++) {
      attracters[i][j] = at.pixels[(i + j * imageHeight) * 4] * decayT;
    }
  }
  at.updatePixels();
}

function mouseClicked() {
  if (keyIsDown(SHIFT)) {
    const notRemoved = [];
    for (let xs of particles) {
      if (Math.sqrt((mouseX - xs[0]) ** 2 + (mouseY - xs[1]) ** 2) > clickRadius) {
        notRemoved.push(xs);
      }
    }
    particles = notRemoved;
  } else if (keyIsDown(ALT)) {
    emitters.push([mouseX, mouseY]);
  } else {
    for (let i = 0; i < particlesPerClick && particles.length < maxParticles; i++) {
      let dis = clickRadius * Math.random();
      let ang = TWO_PI * Math.random();
      let x = mouseX + dis * cos(ang);
      let y = mouseY + dis * sin(ang);
      particles.push([x, y, TWO_PI * Math.random()]);
    }
  }
}