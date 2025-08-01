let video;
let button;
let snapshots = [];
let counter = 0;
let vScale = 4;
let total;
let lW = 80;
let lH = 60;


function setup() {
  createCanvas(800, 600);
  background(51);
  video = createCapture(VIDEO);
  // video.size(320, 240);
  video.hide();
  // frameRate(1);
  // button = createButton('snap');
  // button.mousePressed(takesnap);

  // How many cells fit in the canvas
  total = floor(width / lW) * floor(height / lH);
}

function draw() {
  let lX = 0;
  let lY = 0;

  snapshots[counter] = video.get();
  counter++;
  if (counter == total) {
    counter = 0;
  }

  //lReversed = snapshots.reverse();
  for (var i = 0; i < snapshots.length; i++) {
    // tint(255, 50);
    let index = (i + frameCount) % snapshots.length;
    //let lReversed = snapshots.reverse();
    image(snapshots[index], lX, lY, lW, lH);
    lX = lX + lW;
    if (lX >= width) {
      lX = 0;
      lY = lY + lH;
    }
  }
}
