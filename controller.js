// ==========================
// Global Configuration
// ==========================
let gWIDTH = 600;
let gHEIGHT = 600;
let gSPEED = 1; // Controls growth speed of boxes


let sketches = [fallingSand, bauhaus, cylinders]; // Add more sketches here
let currentIndex = 0;
let currentP5Instance;

function startSketch(index) {
    if (currentP5Instance) {
        currentP5Instance.remove(); // Stop previous sketch
    }
    currentP5Instance = new p5(sketches[index]);
}

function keyPressed() {
    if (key === 'q' || key === 'Q') {
        // Press any key to change sketch
        currentIndex = (currentIndex - 1) % sketches.length;
        if (currentIndex < 0) currentIndex = 0;
        startSketch(currentIndex);
    } else if (key === 'w' || key === 'W') {
        // Press any key to change sketch
        currentIndex = (currentIndex + 1) % sketches.length;
        startSketch(currentIndex);
    }
}

function setup() {
    startSketch(currentIndex);
}
