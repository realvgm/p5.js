// Squares
// https://www.youtube.com/shorts/bgfPhS-o5AE
// https://www.youtube.com/@kwgch/shorts
// https://editor.p5js.org/m.kwgch/sketches/-mE5kUaW8



const boxSize = 50;
const gap = 75;

let fr = 30
function setup() {
    createCanvas(800, 800, WEBGL);
    noFill();
    strokeWeight(2
    )
    frameRate(fr);
}

function draw() {
    background(0)

    rotateX(PI / 8);
    rotateY(-PI / 8);

    let t = frameCount * 0.01

    // rotateX(t);
    // rotateY(t);
    rotateZ(t);

    let o = oscillate(frameCount, 1, 200)
    scale(2 + o / 100)

    for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
            for (let z = -2; z <= 2; z++) {
                push();
                rotateX(x / 5)
                rotateY(y / 5)
                rotateZ(z / 5)
                translate(x * gap, y * gap, z * gap);
                stroke(color(155 + 100 * sin(t + x),
                    155 + 100 * sin(t + y),
                    155 + 100 * sin(t + z)));
                box(boxSize);
                pop();
            }
        }
    }

    // saveMovie()
}

let gifSec = 20;
function saveMovie() {
    let start = 1;
    if (frameCount == start) {
        saveGif('20230527_6.gif', gifSec);
    }
    if (frameCount > (start + fr * gifSec)) {
        noLoop();
    }
}

function oscillate(t, minValue, maxValue) {
    let range = maxValue - minValue;
    let cycle = 2 * range;
    let phase = t % cycle;
    return phase < range ? minValue + phase : minValue + cycle - phase;
}
