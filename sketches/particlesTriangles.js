// Particles Triangles
// https://www.youtube.com/shorts/nvtFp4pWvLI
// https://www.youtube.com/@kwgch/shorts
// https://editor.p5js.org/m.kwgch/sketches/PxKjh0DN4

let particles = [];
const FRAMERATE = 30;
// const PARTICLES = 100;
const PARTICLES = 100;
const canvasSize = 1000;
const distBase = canvasSize / 4
const criteria = 85

function setup() {
    createCanvas(1920, 1080, WEBGL);
    frameRate(FRAMERATE);
    for (let i = 0; i < PARTICLES; i++) {
        particles.push(new Particle());
    }
    strokeWeight(2)
}

function draw() {
    background(0);
    let t = frameCount * 0.005
    rotateX(t * 2);
    rotateY(t * 3);
    rotateZ(t);
    o = oscillate(frameCount, 1, 600)
    scale(1 + o / 400)
    for (let i = 0; i < particles.length; i++) {
        particles[i].moveParticle()
        particles[i].joinParticles(particles.slice(i))
    }
    // saveMovie()
}

let gifSec = 20;
function saveMovie() {
    let start = 1;
    if (frameCount == start) {
        saveGif('20230603_9.gif', gifSec);
    }
    if (frameCount > (start + FRAMERATE * gifSec)) {
        noLoop();
    }
}

class Particle {
    constructor() {
        this.pos = createVector(random(-distBase, distBase),
            random(-distBase, distBase),
            random(-distBase, distBase));
        this.vel = createVector(random(-2, 2),
            random(-2, 2),
            random(-2, 2));
        this.connected = true
    }

    moveParticle() {
        if (this.pos.x < -distBase || this.pos.x > distBase)
            this.vel.x *= -1;
        if (this.pos.y < -distBase || this.pos.y > distBase)
            this.vel.y *= -1;
        if (this.pos.z < -distBase || this.pos.z > distBase)
            this.vel.z *= -1;
        this.pos.add(this.vel);
    }

    joinParticles(particles) {
        let connected = false
        let c = color(
            map(this.pos.x, 0, criteria * 2, 200, 100),
            map(this.pos.y, 0, criteria * 2, 150, 50),
            map(this.pos.z, 0, criteria * 2, 250, 150)
        )
        particles.forEach(element => {
            if (element == this) return false
            let dis = dist(this.pos.x, this.pos.y, this.pos.z,
                element.pos.x, element.pos.y, element.pos.z);
            if (dis < criteria) {
                stroke(c)
                line(this.pos.x, this.pos.y, this.pos.z,
                    element.pos.x, element.pos.y, element.pos.z);
                connected = true
            }
        })
        if (connected) {
            if (!this.connected) {
                push()
                noStroke()
                fill(c)
                translate(this.pos.x, this.pos.y, this.pos.z)
                sphere(10)
                pop()
            }
            this.connected = true
        } else {
            this.connected = false
        }
    }
}

function oscillate(t, minValue, maxValue) {
    let range = maxValue - minValue;
    let cycle = 2 * range;
    let phase = t % cycle;
    return phase < range ? minValue + phase : minValue + cycle - phase;
}
