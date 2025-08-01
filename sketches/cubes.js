// ChatGPT result
// https://chatgpt.com/s/t_6888ca91c98c81919a20deba7db9db25
// inspired in: https://www.youtube.com/shorts/OiWjfFwlpVo

let gCubes = [];
let gSpacing = 200;   // Less distance between cubes
let gCubeSpeed = 5;   // Linear growth speed
let gCameraAngle = 15; // Camera rotation angle
let gCameraDistance = 2800; // Distance from cube origin

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    //noSmooth();
    noFill();
}

function draw() {
    background(0);

    // Camera smooth rotation
    gCameraAngle += 0.01;
    let lCamX = sin(gCameraAngle) * gCameraDistance;
    let lCamY = sin(gCameraAngle * 0.3) * 1300;
    let lCamZ = cos(gCameraAngle) * gCameraDistance;
    camera(lCamX, lCamY, lCamZ, 0, 0, 0, 0, 1, 0);

    // Generate cubes more often
    if (gCubes.length === 0 || gCubes[gCubes.length - 1].size > gSpacing) {
        gCubes.push({ size: 0 });
    }

    // Draw cubes with fading for the largest ones
    for (let lCube of gCubes) {
        push();
        let lAlpha = map(lCube.size, 0, 5000, 255, 0); // Fade as size grows
        stroke(255, lAlpha);
        strokeWeight(4);
        box(lCube.size);
        pop();
        lCube.size += gCubeSpeed;
    }

    // Remove invisible cubes
    gCubes = gCubes.filter(c => c.size < 5000);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

