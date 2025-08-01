// Show info about mouse pointer, FPS,...
function drawDebug() {
    push();

    let debugLines = [
        `X=${nf(mouseX, 4)} | Y=${nf(mouseY, 4)}`,
        `FPS: ${nf(frameRate(), 2, 1)} | Frame: ${frameCount}`,
        `Elapsed: ${(millis() / 1000).toFixed(2)}s`,
        `Center: (${width / 2}, ${height / 2})`
    ];

    let padding = 10;
    let lineHeight = 18;
    let boxW = 170;
    let boxH = debugLines.length * lineHeight + padding * 2;

    // Background box
    fill(0, 180); // semi-transparent black
    rect(padding, padding, boxW, boxH, 3);

    // Text
    textFont("Courier New");
    textSize(10);
    fill(0, 255, 0); // terminal green
    for (let i = 0; i < debugLines.length; i++) {
        text(debugLines[i], padding + 10, padding + (i + 1) * lineHeight);
    }

    pop();
}

// Show info about mouse pointer, FPS,...
function drawDebugText(pDebugLines) {
    push();

    let padding = 10;
    let lineHeight = 18;
    let boxW = 170;
    let boxH = pDebugLines.length * lineHeight + padding * 2;

    // Background box
    fill(0, 180); // semi-transparent black
    rect(padding, padding, boxW, boxH, 3);

    // Text
    textFont("Courier New");
    textSize(10);
    fill(0, 255, 0); // terminal green
    for (let i = 0; i < pDebugLines.length; i++) {
        text(pDebugLines[i], padding + 10, padding + (i + 1) * lineHeight);
    }

    pop();
}

// Draw point and associated text
function logPoint(x, y, pDebugLines) {
    push();
    // Style the next points.
    stroke("purple");
    strokeWeight(10);

    // Bottom-right.
    point(x, y);
    pop();

    push();
    fill("black");
    for (let i = 0; i < pDebugLines.length; i++) {
        text(pDebugLines[i], x + 10, y + 10*(i+1));
    }
    pop();
}

function keyPressed() {
    if (key === 'f' || key === 'F') {
        let fs = fullscreen();
        fullscreen(!fs);
        resizeCanvas(windowWidth, windowHeight);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}