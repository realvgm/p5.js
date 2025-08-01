let gWidth = 400;
let gHeight = 400;
let gCellSize = 100;

let gSnake;
let gFood;
let gColorHue = 0;

function setup() {
  createCanvas(gWidth, gHeight);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  frameRate(15);
  resetSnake();
}

function draw() {
  background(0);

  gColorHue = (gColorHue + 2) % 360;

  autoMoveSnake();
  gSnake.update();
  gSnake.show();
  gFood.show();

  if (gSnake.eat(gFood.pos)) {
    gFood.randomize(gSnake.body);
  }
}

// ================= Snake Class =================
class Snake {
  constructor() {
    this.body = [];
    this.body[0] = createVector(floor(width / (2 * gCellSize)), floor(height / (2 * gCellSize)));
    this.xdir = 0;
    this.ydir = 0;
  }

  setDir(px, py) {
    this.xdir = px;
    this.ydir = py;
  }

  update() {
    let head = this.body[this.body.length - 1].copy();
    head.x += this.xdir;
    head.y += this.ydir;

    // Check collision with wall
    if (head.x < 0 || head.y < 0 || head.x >= width / gCellSize || head.y >= height / gCellSize) {
      resetSnake();
      return;
    }

    // Check collision with itself
    for (let seg of this.body) {
      if (seg.x === head.x && seg.y === head.y) {
        resetSnake();
        return;
      }
    }

    this.body.shift();
    this.body.push(head);
  }

  grow() {
    let head = this.body[this.body.length - 1].copy();
    this.body.push(head);
  }

  eat(pos) {
    let head = this.body[this.body.length - 1];
    if (head.x === pos.x && head.y === pos.y) {
      this.grow();
      return true;
    }
    return false;
  }

  show() {
    for (let i = 0; i < this.body.length; i++) {
      fill((gColorHue + i * 5) % 360, 80, 100);
      rect(this.body[i].x * gCellSize, this.body[i].y * gCellSize, gCellSize, gCellSize);
    }
  }
}

// ================= Food Class =================
class Food {
  constructor() {
    this.pos = createVector(0, 0);
    this.randomize();
  }

  randomize(occupied = []) {
    let cols = floor(width / gCellSize);
    let rows = floor(height / gCellSize);
    let valid = false;
    while (!valid) {
      this.pos.x = floor(random(cols));
      this.pos.y = floor(random(rows));
      valid = !occupied.some(seg => seg.x === this.pos.x && seg.y === this.pos.y);
    }
  }

  show() {
    fill(0, 0, 100);
    rect(this.pos.x * gCellSize, this.pos.y * gCellSize, gCellSize, gCellSize);
  }
}

// ================= Auto Movement =================
function autoMoveSnake() {
  let head = gSnake.body[gSnake.body.length - 1];
  let dx = gFood.pos.x - head.x;
  let dy = gFood.pos.y - head.y;

  // Simple pathfinding (avoid reversing into itself)
  let newDir = createVector(Math.sign(dx), Math.sign(dy));

  let nextPos = createVector(head.x + newDir.x, head.y + newDir.y);
  if (gSnake.body.some(seg => seg.x === nextPos.x && seg.y === nextPos.y)) {
    // Try alternate moves if blocked
    if (!isBlocked(head.x, head.y - 1)) newDir.set(0, -1);
    else if (!isBlocked(head.x + 1, head.y)) newDir.set(1, 0);
    else if (!isBlocked(head.x, head.y + 1)) newDir.set(0, 1);
    else if (!isBlocked(head.x - 1, head.y)) newDir.set(-1, 0);
  }

  gSnake.setDir(newDir.x, newDir.y);
}

function isBlocked(x, y) {
  return (
    x < 0 ||
    y < 0 ||
    x >= width / gCellSize ||
    y >= height / gCellSize ||
    gSnake.body.some(seg => seg.x === x && seg.y === y)
  );
}

function resetSnake() {
  gSnake = new Snake();
  gFood = new Food();
}
