let video;

function setup() {
    createCanvas(windowWidth, windowHeight);
    //createCanvas(400, 400);
    background(51);
    video = createCapture(VIDEO);
    //video.size(320, 240);
    video.hide();
    frameRate(1);

}

function draw() {
    //background(51);
    
    //image(video, 0, 0, mouseX, height);
    for (let i = 0; i < windowWidth; i = 100 + i) {
        for (let j = 0; j < windowHeight; j = 80 + j) {
            push();
            // Scale -1, 1 means reverse the x axis, keep y the same.
            scale(1, 1);
            tint(random(0,255), random(0,255), random(0,255));

            // Because the x-axis is reversed, we need to draw at different x position.
            //image(video, mouseX, mouseY, 128, 100);
            //sleep(10000).then(function () {
            //    image(video, i, j, 100, 80)
            //});
            image(video, i, j, 100, 80);
            
            pop();
        }

    }
}

// a custom 'sleep' or wait' function, that returns a Promise that resolves only after a timeout
function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}