// created based off the Shaders tutorial by @Oren Shoham

let currentShader;
let graphic;
let font;
let paused = false;
const gScanSpeed = 35;  // Pixels per frame

function preload() {
  currentShader = getShader(this._renderer);
  font = loadFont('Sohne-Fett.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();

  gScan = new Scanline(windowWidth, windowHeight, gScanSpeed);

  // ------------ create graphic with text ------------------ //
  graphic = createGraphics(windowWidth, windowHeight);
  graphic.background(0, 0, 255);
  graphic.noStroke();
  graphic.textFont(font);
  graphic.textSize(windowWidth * 0.15);
  graphic.textAlign(CENTER, CENTER);
  graphic.fill(0, 255, 0);
  graphic.stroke(0);
  graphic.strokeWeight(0);
  graphic.text('Os Vigilantes', windowWidth * 0.5, windowHeight * 0.5);

  shader(currentShader);
  currentShader.setUniform('tex', graphic);
}

function draw() {
  // Get next point
  let lPoint = gScan.nextPoint();

  if (!paused) {
    let freq = map(lPoint.x, 0, width, 0, 10.0);
    let amp = map(lPoint.y, 0, height, 0, 0.25);

    currentShader.setUniform('frequency', freq);
    currentShader.setUniform('amplitude', amp);
    currentShader.setUniform('speed', frameCount * 0.02);
  }

  rect(0, 0, width, height);
}

function mousePressed() {
  paused = !paused;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  graphic = createGraphics(windowWidth, windowHeight);
  graphic.background(0, 0, 255);
  graphic.noStroke();
  graphic.textFont(font);
  graphic.textSize(windowWidth * 0.2);
  graphic.textAlign(CENTER, CENTER);
  graphic.fill(0, 255, 0);
  graphic.stroke(0);
  graphic.strokeWeight(0);
  graphic.text('Os Vigilantes', windowWidth * 0.5, windowHeight * 0.5);

  currentShader.setUniform('tex', graphic);
}

function mouseWheel() {
  return false;
}


///////////////////////////////
// Scanline class
class Scanline {
  constructor(pWidth, pHeight, pSpeed) {
    this.lWidth = pWidth;
    this.lHeight = pHeight;
    this.lSpeed = pSpeed;
    this.lX = 0;
    this.lY = 0;
    this.lDirection = 1; // 1 = right, -1 = left
  }

  nextPoint() {
    // Move horizontally
    this.lX += this.lSpeed * this.lDirection;

    // Check edge
    if (this.lX > this.lWidth) {
      this.lX = this.lWidth;
      this.lDirection = -1;
      this.lY += this.lSpeed; // Move down after hitting right edge
    } else if (this.lX < 0) {
      this.lX = 0;
      this.lDirection = 1;
      this.lY += this.lSpeed; // Move down after hitting left edge
    }

    // Reset when bottom reached
    if (this.lY > this.lHeight) {
      this.lY = 0;
    }

    return { x: this.lX, y: this.lY };
  }
}
