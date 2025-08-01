/*
----- Coding Tutorial by Patt Vira ----- 
Name: Drawing with Webcam Input
Video Tutorial: https://youtu.be/h6tfT8mbueE

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

let vid; let w = 64; let h = 48; let scl = 10;

function setup() {
    createCanvas(w * scl, h * scl);
    vid = createCapture(VIDEO);
    vid.size(w, h);
}

function draw() {
    background(220);
    vid.loadPixels();

    for (let i = 0; i < vid.width; i++) {
        for (let j = 0; j < vid.height; j++) {
            // Using pixels 1D array
            let index = ((j * vid.width) + i) * 4;
            let r = vid.pixels[index + 0];
            let g = vid.pixels[index + 1];
            let b = vid.pixels[index + 2];
            let a = vid.pixels[index + 3];

            let c = (r + g + b) / 3;
            let s = map(c, 0, 100, 0, 20);
            fill(r, g, b);


            // Using get() function
            /*
            let val = vid.get(i, j);
            let c = map(brightness(val), 0, 100, 0, 255);
            let s = map(brightness(val), 0, 100, 0, 20);
            fill(r, g, b);
            */

            ellipse(scl / 2 + i * scl, scl / 2 + j * scl, s, s);


        }
    }
}