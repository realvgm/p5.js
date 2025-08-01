// =============== GLOBAL SETTINGS ===============
let gWidth = 800;
let gHeight = 600;
let gFontSize = 32;
let gCols, gRows;
let gTileSize = gFontSize;
let pg; // low res buffer
let gPlayer, gEnemies = [], gItems = [];
let gScore = 0;
let gEgaPalette = [
  "#000000", "#0000AA", "#00AA00", "#00AAAA",
  "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
  "#555555", "#5555FF", "#55FF55", "#55FFFF",
  "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF"
];

// =============== ENTITY CLASSES ===============
class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.symbol = "@";
    this.color = random(gEgaPalette);
    this.moveDelay = 15; // lower speed (frames between moves)
    this.timer = 0;
  }
  update() {
    this.timer++;
    if (this.timer >= this.moveDelay) {
      this.timer = 0;
      let target = findNearestItem(this.pos);
      if (target) {
        let dx = target.x - this.pos.x;
        let dy = target.y - this.pos.y;
        this.pos.x += Math.sign(dx);
        this.pos.y += Math.sign(dy);
      }
    }
  }
  show() {
    drawChar(this.symbol, this.pos.x, this.pos.y, this.color);
  }
}

class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.symbol = "X";
    this.color = random(gEgaPalette);
    this.moveDelay = int(random(20, 30));
    this.timer = 0;
  }
  update() {
    this.timer++;
    if (this.timer >= this.moveDelay) {
      this.timer = 0;
      let dx = gPlayer.pos.x - this.pos.x;
      let dy = gPlayer.pos.y - this.pos.y;
      this.pos.x += Math.sign(dx);
      this.pos.y += Math.sign(dy);
    }
  }
  show() {
    drawChar(this.symbol, this.pos.x, this.pos.y, this.color);
  }
}

class Item {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.symbol = "$";
    this.color = random(gEgaPalette);
  }
  show() {
    drawChar(this.symbol, this.pos.x, this.pos.y, this.color);
  }
}

// =============== SETUP & DRAW ===============
function setup() {
  createCanvas(gWidth, gHeight);
  noSmooth(); // critical for pixel look

  gCols = floor(width / gTileSize);
  gRows = floor(height / gTileSize);
  
  textFont("monospace", gFontSize);
  textAlign(LEFT, TOP);
  noSmooth();
  
  gPlayer = new Player(floor(gCols / 2), floor(gRows / 2));
  
  for (let i = 0; i < 3; i++) {
    gEnemies.push(new Enemy(floor(random(gCols)), floor(random(gRows))));
  }
  
  spawnItem();
}

function draw() {
  background("#000022");
  
  drawHUD();
  
  gPlayer.update();
  gPlayer.show();
  
  gEnemies.forEach(e => {
    e.update();
    e.show();
    
    if (collide(e.pos, gPlayer.pos)) {
      gScore = max(0, gScore - 50);
    }
  });
  
  gItems.forEach((it, idx) => {
    it.show();
    if (collide(it.pos, gPlayer.pos)) {
      gScore += 100;
      gItems.splice(idx, 1);
      spawnItem();
    }
  });
}

// =============== HELPERS ===============
function drawChar(ch, cx, cy, c) {
  fill(c);
  text(ch, cx * gTileSize, cy * gTileSize);
}

function spawnItem() {
  let ix = floor(random(gCols));
  let iy = floor(random(gRows));
  gItems.push(new Item(ix, iy));
}

function collide(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function drawHUD() {
  fill("#55FF55");
  text(`SCORE: ${gScore}`, 0, 0);
  fill("#FF55FF");
  text(`AUTO DEMO MODE`, 0, gTileSize);
  fill("#FFFF55");
  text(`ΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞΞ`, 0, gTileSize * (gRows - 2));
}

function findNearestItem(pPos) {
  if (gItems.length === 0) return null;
  let nearest = gItems[0];
  let minDist = dist(pPos.x, pPos.y, nearest.pos.x, nearest.pos.y);
  for (let i = 1; i < gItems.length; i++) {
    let d = dist(pPos.x, pPos.y, gItems[i].pos.x, gItems[i].pos.y);
    if (d < minDist) {
      nearest = gItems[i];
      minDist = d;
    }
  }
  return nearest.pos;
}
