// ==== Global configuration variables ====
let gSpeed = 1;   // Speed of vertical oscillation
let gAmplitude = 100; // Amplitude of the movement
let gBallSize = 40;   // Diameter of the ball

// Internal animation variable
let gAngle = 0;       // Used for smooth oscillation

function setup() {
  createCanvas(800, 600);
  noStroke();
  angleMode(DEGREES);
  //frameRate(1);
}

function draw() 
{
  // Camera slightly back to see the scene
  camera(0, 0, 3800, 0, 0, 0, 0, 1, 0);

  // Draw floor grid (perspective)
  push();
  stroke(100);
  translate(0, 100, 0);
  rotateX(HALF_PI);
  for (let z = -800; z < 800; z += 50) {
    line(-800, z, 800, z);
  }
  for (let x = -800; x < 800; x += 50) {
    line(x, -800, x, 800);
  }
  pop();
}