// Circles
// https://www.youtube.com/shorts/XzviBEVHOm4
// https://www.youtube.com/@kwgch/shorts
// https://editor.p5js.org/m.kwgch/sketches/Wl3dBfGGp


let circles = [];
const fr = 30
function setup() {
    frameRate(fr)
    createCanvas(800, 800, WEBGL);
}

function draw() {
    background(0)

    rotateX(PI / 8)
    rotateY(-PI / 8)

    let t = frameCount * 0.01
    rotateX(t)
    rotateY(t)
    rotateZ(t)
    scale(1 + t)
    // scale(constrain(t,0,15))

    for (let i = circles.length - 1; i >= 0; i--) {
        circles[i].display();
        circles[i].update();
        if (circles[i].radius > width / 2) {
            circles.splice(i, 1);
        }
    }

    if (frameCount % (fr / 2) === 0) {
        circles.push(new Circle());
    }

    // saveMovie()
}

let gifSec = 20;
function saveMovie() {
    let start = 1;
    if (frameCount == start) {
        saveGif('20230603_11.gif', gifSec);
    }
    if (frameCount > (start + fr * gifSec)) {
        noLoop();
    }
}

class Circle {
    constructor() {
        this.x = 0
        this.y = 0
        this.z = 0
        this.radius = 0;
        this.strokeWeight = 5
        this.color = color(
            // random(50, 100),
            random(200, 255),
            random(150, 200),
            random(200, 255),
        );
    }

    display() {
        // push()
        // rotateY((1/360)*TWO_PI)
        // rotateY((t) /360)
        strokeWeight(this.strokeWeight);
        stroke(this.color);
        noFill();
        translate(0, 0, this.z)
        ellipse(this.x, this.y, this.radius * 2);
        // pop()
    }

    update() {
        this.radius += 1;
        this.z -= 0.1
    }
}

function oscillate(t, minValue, maxValue) {
    let range = maxValue - minValue;
    let cycle = 2 * range;
    let phase = t % cycle;
    return phase < range ? minValue + phase : minValue + cycle - phase;
}
