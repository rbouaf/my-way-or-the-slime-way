/*
Author(s): Team Uhhhhhh
Leif 
Date: 06/11/2022
Description: This script uses p5.js to simulate the behavior of slime molds in the genus Physarum.  
*/

// Pre-setup pi
const INIT_PI = 3.14159265358979323846;

// Dimensions of the image to be rendered
const imageWidth = 200;
const imageHeight = 200;

// Mouse click radius
let clickRadius = 15;
let radiusPrompt;

// The number of particles spawned per click
const particlesPerClick = 1000;

// The maximum number of particles that can be spawned
const maxParticles = 100000;

// Diffusion size
const diffK = 2;

// Decay factor
let decayT = 0.9;
let decayPrompt;

// Sensor angle (radians)
let SA = INIT_PI / 8;
let SAprompt;

// Rotate angle (radians)
let RA = INIT_PI / 4;
let RAprompt;

// Sensor offset distance
const SO = 9;

// Sensor width
const SW = 1;

// Step size
let SS = 1;
let SSprompt;

// Attract factor
const depT = 5;

//random densit
const randomDensity = 0.2;

// Arrays containing the particles, attracters, and emitters in the scene
let particles = [];
let attracters = [];
let emitters = [];

// Number of particles emitted per second by emitters in the scene
let numParticlesEmitted = 5;

// Image of attractors (the visual output by p5)
let at;

let updateButton;

function setup() {
  at = createImage(imageWidth, imageHeight);

  at.loadPixels();

  //create the settings input boxes
  radiusPrompt = createInput(str(clickRadius));
  decayPrompt = createInput(str(decayT));
  SAprompt = createInput(str((SA / PI) * 180));
  RAprompt = createInput(str(str((RA / PI) * 180)));
  SSprompt = createInput(str(SS));
  //size of input boxes
  decayPrompt.size(40);
  radiusPrompt.size(40);
  SAprompt.size(40);
  RAprompt.size(40);
  SSprompt.size(40);
  //putting them inside the html
  radiusPrompt.parent("sliders1");
  decayPrompt.parent("sliders2");
  SAprompt.parent("sliders3");
  RAprompt.parent("sliders4");
  SSprompt.parent("sliders5");

  /// Buttons
  //update
  updateButton = createButton("UPDATE");
  updateButton.mousePressed(updateValues);
  updateButton.parent("clearNrand");
  //clear
  let clearButton = createButton("CLEAR");
  clearButton.mousePressed(clearGrid);
  clearButton.parent("clearNrand");
  //random
  let randomButton = createButton("RANDOM");
  randomButton.mousePressed(randomSpread);
  randomButton.parent("clearNrand");
  //add update button
  updateButton.parent("clearNrand");

  //Create Canvas
  canvas = createCanvas(imageWidth, imageHeight);
  canvas.mouseClicked(canvasClick);
  canvas.parent("slimeContainer");

  background(0);

  //idk what this does
  for (let i = 0; i < imageWidth; i++) {
    let length = [];
    for (let j = 0; j < imageHeight; j++) {
      length.push(0);
    }
    attracters.push(length);
  }

}

function draw() {
  background(0);
  stroke(255, 165, 0);
  strokeWeight(5);
  fill(255, 255, 255, 50);
  textAlign(CENTER, CENTER);
  image(at, 0, 0);
  for (let x of emitters) {
    for (
      let i = 0;
      i < numParticlesEmitted && particles.length < maxParticles;
      i++
    ) {
      particles.push([x[0], x[1], TWO_PI * Math.random()]);
    }
    point(x[0], x[1]);
  }
  stroke(0, 0, 0, 0);

  ellipse(mouseX, mouseY, 2 * clickRadius, 2 * clickRadius);
  stroke(255);
  /*strokeWeight(1);
  for(let xs of particles){
    point(xs[0],xs[1]);
  }*/
  
  sense();

  updateParticles();

  decay();
  
}

//Button Functions CLEAR, RANDOM and UPDATE
function clearGrid() {
  particles = [];
  emitters = [];
}
function randomSpread() {
  clearGrid();
  for (let i = 0; i < imageWidth * imageHeight * randomDensity; i++) {
    particles.push([
      Math.random() * imageWidth,
      Math.random() * imageHeight,
      TWO_PI * Math.random(),
    ]);
  }
}
function updateValues() {
  clickRadius = parseInt(radiusPrompt.value());
  decayT = parseFloat(decayPrompt.value());
  SA = parseFloat((SAprompt.value() / 180) * PI);
  RA = parseFloat((RAprompt.value() / 180) * PI);
  SS = parseFloat(SSprompt.value());
}
/////////////////////////////////////////////

function writePixel(image, x, y, g) {
  let index = (x + y * imageWidth) * 4;
  image.pixels[index] = g;
  image.pixels[index + 1] = g;
  image.pixels[index + 2] = 0;
  image.pixels[index + 3] = 255;
}

function modifiedRound(i, axis) {
  let x = round(i);

  if (x < 0 && axis == "x") 
    x += imageWidth;
  else if (x >= imageWidth && axis == "x") 
    x %= imageWidth;
  else if (x < 0 && axis == "y") 
    x += imageHeight;
  else if (x >= imageHeight && axis == "y") 
    x %= imageHeight;
  
  return x;
}

function sense() {
  for (let i = 0; i < particles.length; i++) {
    // setting the sensors
    let options = [0, 0, 0];
    options[1] = // middle sensor
      attracters[modifiedRound(particles[i][0] + SO * cos(particles[i][2]), "x")][modifiedRound(particles[i][1] + SO * sin(particles[i][2]), "y")];
    options[0] = // left sensor
      attracters[modifiedRound(particles[i][0] + SO * cos(particles[i][2] + SA), "x")][modifiedRound(particles[i][1] + SO * sin(particles[i][2] + SA), "y")];
    options[2] = // right sensor
      attracters[modifiedRound(particles[i][0] + SO * cos(particles[i][2] - SA), "x")][modifiedRound(particles[i][1] + SO * sin(particles[i][2] - SA), "y")];
    ///Programming the sensors conditions
    if (options[1] >= options[2] && options[1] >= options[0]) { //if middle sensor is bigger than the other two sensors, no change in direction.
      continue;
    } else if (options[0] > options[2]) {                       //if left sensor is bigger than the right sensor, turn left.
      particles[i][2] = (particles[i][2] + RA) % TWO_PI;
    } else if (options[0] < options[2]) {                       //if right sensor is bigger than the left sensor, turn right.
      particles[i][2] = (particles[i][2] - RA) % TWO_PI;
    } else {                                                    //if left sensor is as big as the right sensor, and bigger than the middle sensor,                  
      let rand = Math.random();                                 //turn randomly.
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
    let x = (particles[i][0] + SS * cos(particles[i][2])) % imageWidth;
    let y = (particles[i][1] + SS * sin(particles[i][2])) % imageHeight;
    if (x < 0) {
      x += imageWidth;
    }
    if (y < 0) {
      y += imageHeight;
    }

    particles[i][0] = x;
    particles[i][1] = y;
    let p1 = modifiedRound(particles[i][0], "x");
    let p2 = modifiedRound(particles[i][1], "y");
    attracters[p1][p2] += depT;
  }
}

function decay() {
  for (let i = 0; i < imageWidth; i++) {
    for (let j = 0; j < imageHeight; j++) {
      writePixel(at, i, j, attracters[i][j]);
    }
  }
  at.filter(BLUR, diffK);
  for (let i = 0; i < imageWidth; i++) {
    for (let j = 0; j < imageHeight; j++) {
      attracters[i][j] = at.pixels[(i + j * imageWidth) * 4] * decayT;
    }
  }
  at.updatePixels();
}


function canvasClick() {
  if (keyIsDown(SHIFT)) {             //SHIFT + CLICK to delete slime
    const notRemoved = [];
    for (let xs of particles) {
      if (
        Math.sqrt((mouseX - xs[0]) ** 2 + (mouseY - xs[1]) ** 2) > clickRadius
      ) {
        notRemoved.push(xs);
      }
    }
    particles = notRemoved;
  } else if (keyIsDown(ALT)) {        //ALT + CLICK to add emitters
    emitters.push([mouseX, mouseY]);
  } else {
    for (
      let i = 0;
      i < particlesPerClick && particles.length < maxParticles;
      i++
    ) {
      let dis = clickRadius * Math.random();
      let ang = TWO_PI * Math.random();
      let x = mouseX + dis * cos(ang);
      let y = mouseY + dis * sin(ang);

      particles.push([x, y, TWO_PI * Math.random()]);
    }
  }
}
