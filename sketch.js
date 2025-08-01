let angle = 0;
// let numCylinders = 15;
let numCylinders = 120;
let cylinderRadius;
let re,g,b
const fr = 30

const baseRGB = 200
const a = 255
const cu = 5

function setup() {
  createCanvas(800, 800, WEBGL);
  frameRate(fr);
  cylinderRadius = width / 4;
  strokeWeight(20)
  noFill()
  
  re = random(0,255)
  gr = random(0,255)
  bl = random(0,255)
}

function draw() {
  background(0);
  
  rotateX(PI / 4)
  rotateY(-PI / 4)
  rotateZ(PI / 4)
  
  rotateX(angle * 0.1);
  rotateY(angle * 0.1);
  rotateZ(angle * 0.1);
  
  let sValue = oscillate(frameCount/10, 0, 100)
  
  scale(1 + sValue/50)
  // scale(0.5 + frameCount * 0.01)
  
  re += random(-cu,cu)
  gr += random(-cu,cu)
  bl += random(-cu,cu)
  
  let hPlus = cos(frameCount/100)*100
  
  for (let i = 0; i < numCylinders; i++) {
    push();
    let angleOffset = map(i, 0, numCylinders, 0, TWO_PI);
    let x = cylinderRadius * cos(angle + angleOffset);
    let y = cylinderRadius * sin(angle + angleOffset);
    translate(x, y, 0);

    // let h = map(sin(angle * 1.5 + i * 0.3), -1, 1, 50, 150);
    let h = map(sin(angle * 1.5 + i * 0.3), -1, 1, 200, 300);
    // let r = map(cos(angle * 0.5 + i * 0.5), -1, 1, 5, 20);
    
    h += hPlus

    rotateX(angle * 2);
    rotateY(angle * 0.5);
    rotateZ(angle * 1.5);

    stroke(re, baseRGB, baseRGB, a);
    
    if (i % 7 === 0) {
      stroke(baseRGB, gr, baseRGB, a);
    }

    if (i % 11 === 0) {
      stroke(baseRGB, baseRGB, bl, a);
    }

    // cylinder(r, h);
    line(0,-h/2,0,h/2)
    pop();
  }

  // angle += 0.05;
  angle += 0.01;
  
  // saveMovie()
}

let gifSec = 20;
function saveMovie(){
  let start = 1;
  if (frameCount == start){
    saveGif('2023057_1.gif', gifSec);
  }
  if (frameCount > (start + fr * gifSec)){
    noLoop();
  }
}
function oscillate(t, minValue, maxValue) {
  let range = maxValue - minValue;
  let cycle = 2 * range;
  let phase = t % cycle;

  return phase < range ? minValue + phase : minValue + cycle - phase;
}
