const gameboyPalette = [
  [
    '#9bbc0f',
    '#8bac0f',
    '#306230',
    '#0f380f'
  ],
  [
    '#fff6d3',
    '#f9a875',
    '#eb6b6f',
    '#7c3f58'
  ],
  [
    '#8be5ff',
    '#608fcf',
    '#7550e8',
    '#622e4c'
  ],
  [
    '#e9efec',
    '#a0a08b',
    '#27232a',
    '#211e20'
  ],
  [
    '#f8e3c4',
    '#cc3495',
    '#6b1fb1',
    '#0b0630'
  ],
  [
    '#cfab51',
    '#9d654c',
    '#4d222c',
    '#210b1b'
  ],
  [
    '#e6f2ef',
    '#f783b0',
    '#3f6d9e',
    '#151640'
  ],
  [
    '#f0f0f0',
    '#8f9bf6',
    '#ab4646',
    '#161616'
  ],
  [
    '#e9f5da',
    '#f0b695',
    '#877286',
    '#3e3a42'
  ],
  [
    '#e8d6c0',
    '#92938d',
    '#a1281c',
    '#000000'
  ]
]

let video;
let pixels = [];

const pixelSize = 5;

let isCapturing = false;
let captureAnimCounter = 0;
let selectedPalette = 0;

function setup() {

  video = createCapture(VIDEO);
  video.hide();

  videoSize = 128;

  createCanvas(videoSize * pixelSize, videoSize * pixelSize);

  document.getElementById('capture_btn').addEventListener('click', captureImage);
  document.getElementById('palette_change_minus').addEventListener('click', () => changePalette(-1));
  document.getElementById('palette_change_plus').addEventListener('click', () => changePalette(1));
}

function draw() {
  // I noticed that loading the pixels before resizing causes the image to glitch during loading. I decided to leave it as is because I liked the visuals.
  video.loadPixels();

  // there is a delay for the Capture from p5js, this checking waits until the video stream is ready to be resized
  if (video.width > 300) {
    //Check for camera orientation
    if (video.width > video.height) {
      videoWidth = videoSize / video.height * video.width;
      videoHeight = videoSize;
    } else {
      videoWidth = videoSize;
      videoHeight = videoSize / video.width * video.height;
    }

    video.size(videoWidth, videoHeight);
  }

  noStroke();

  captureAnim();

  if (!isCapturing) {
    pixels = videoToPixelArr();

    pixels = grayscale();

    pixels = dithering();

    pixels = gbFilter();

    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (x == 0 || x == pixels.length - 1 || y == 0 || y == pixels[y].length - 1) {
          fill('#000000'); // Make a black border on the canvas
        } else {
          fill(pixels[y][x]);
        }
        rect(pixelSize * x, pixelSize * y, pixelSize, pixelSize);
        // INVERT
        // rect(pixelSize*pixels[y].length - (pixelSize * x), pixelSize * y, pixelSize, pixelSize);
      }
    }
  } else {
    if (captureAnimCounter >= 10) {
      fill(255, 255, 255, 10);
      rect(0, 0, canvas.width, canvas.height);
    }
  }
}

// Convert the video stream pixel array to a two dimensional matrix containing the Red, Green, Blue values for each pixel
function videoToPixelArr() {
  pixels = [];

  // Crop the original image into a square
  let xStart;
  let xEnd;
  let yStart;
  let yEnd;

  if (video.width > video.height) {
    // For landscape video
    xStart = parseInt((video.width / 2) - video.height / 2);
    xEnd = parseInt((video.width / 2) + video.height / 2);
    yStart = 0;
    yEnd = video.height;
  } else {
    // For portrait video
    xStart = 0;
    xEnd = video.width;
    yStart = parseInt((video.height / 2) - video.width / 2);
    yEnd = parseInt((video.height / 2) + video.width / 2);
  }

  for (let y = yStart; y < yEnd; y++) {
    pixels[y - yStart] = []
    for (let x = xStart; x < xEnd; x++) {

      const pixelIndex = (x + y * video.width) * 4;

      // Get each color, the pixels property of the p5.js video stream is a one dimensional array like this [r,g,b,a,r,g,b,a...] this code rearange it in a matrix
      const r = video.pixels[pixelIndex + 0] || 0;
      const g = video.pixels[pixelIndex + 1] || 0;
      const b = video.pixels[pixelIndex + 2] || 0;

      pixels[y - yStart][x - xStart] = [r, g, b];
    }
  }

  return pixels;
}

// Calculate the average brightness for each color and returns an grayscale version of the pixels
function grayscale() {
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {

      const r = pixels[y][x][0];
      const g = pixels[y][x][1];
      const b = pixels[y][x][2];

      // Calculate the average applying an weight for each one, considering the human visual perception of each color
      const avg = r * 0.3 + g * 0.59 + b * 0.11;

      pixels[y][x] = avg
    }
  }

  return pixels
}

// This dithering function was made thanks to the "The Coding Train" video about Floyd-Steinberg Dithering (https://www.youtube.com/watch?v=0L2n8Tg2FwI)
function dithering() {
  for (let y = 0; y < pixels.length - 1; y++) {
    for (let x = 1; x < pixels[y].length - 1; x++) {

      const pixel = pixels[y][x];

      const factor = 4;

      const quant = round(factor * pixel / 255) * (255 / factor);

      pixels[y][x] = quant

      const quantErr = pixel - quant;

      let p;
      let newPixel;

      // --- 7/16
      p = pixels[y][x + 1];
      newPixel = p + quantErr * 7 / 16;

      pixels[y][x + 1] = newPixel;

      // --- 3/16
      p = pixels[y + 1][x - 1];
      newPixel = p + quantErr * 3 / 16;

      pixels[y + 1][x - 1] = newPixel;

      // --- 5/16
      p = pixels[y + 1][x];
      newPixel = p + quantErr * 5 / 16;

      pixels[y + 1][x] = newPixel

      // --- 1/16
      p = pixels[y + 1][x + 1];
      newPixel = p + quantErr * 1 / 16;

      pixels[y + 1][x + 1] = newPixel;
    }
  }

  return pixels;
}

// Applies the gameboy palette to the grayscale dithering image
function gbFilter() {

  const palette = gameboyPalette[selectedPalette];

  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {

      const c = pixels[y][x];

      const newC = floor(map(c, 0, 255, 3, 0));

      pixels[y][x] = palette[newC];
    }
  }

  return pixels;
}

function captureImage() {
  isCapturing = true;
  saveCanvas('my_photo.jpg');
}

// Create a flash effect when an image is captured
function captureAnim() {
  if (captureAnimCounter >= 20) {
    captureAnimCounter = 0;
    isCapturing = false;
  } else if (isCapturing) {
    captureAnimCounter++;
  }
}

// Change the selected palette
function changePalette(n) {
  const maxPalette = gameboyPalette.length;
  let newPalette = selectedPalette + n;

  if (newPalette < 0) {
    newPalette = maxPalette - 1;
  } else if (newPalette >= maxPalette) {
    newPalette = 0;
  }

  selectedPalette = newPalette
}