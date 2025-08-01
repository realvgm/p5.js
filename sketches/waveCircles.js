// https://openprocessing.org/sketch/2136802
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    //noSmooth();
    angleMode(DEGREES);

}

function draw() {
    background(20);
    rotateX(60);
    noFill();
    stroke(255);
    for (var i = 0; i < 25; i++) {
        var r = map(sin(frameCount), -1, 1, 0, 255);
        var g = map(i, 0, 40, 0, 255);
        var b = map(sin(frameCount), -1, 1, 255, 0);
        strokeWeight(2);
        stroke(r, g, b, 255 - (i * 10));
        //fill(r,g,b, 6);


        beginShape();
        for (var j = 0; j < 360; j += 5) {
            var rad = i * 40;
            var x = rad * cos(j);
            var y = rad * sin(j);
            var z = 200 + sin(frameCount * 2 + i * 10) * 100;

            vertex(x, y, z);
        }
        endShape(CLOSE);
    }
}