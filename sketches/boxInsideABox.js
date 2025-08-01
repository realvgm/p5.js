// inspiration: https://www.youtube.com/shorts/A5o3ZA32Czs))
let gAngleX = 0;
let gAngleY = 0;
let gAngleZ = 0;

let gInnerOffset = { x: 0, y: 0, z: 0 };
let gInnerSpeed = { x: 0.7, y: 0.6, z: 0.5 };
let gInnerRotation = 0;
let gInnerScale = { x: 1, y: 1, z: 1 };

let gStrokeColor;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noFill();
  gStrokeColor = color(255); // White lines by default
}

function draw() {
  background(0);

  stroke(gStrokeColor);

  // Faster camera rotation
  gAngleX += 0.01;
  gAngleY += 0.012;
  gAngleZ += 0.008;
  rotateX(gAngleX);
  rotateY(gAngleY);
  rotateZ(gAngleZ);

  // Outer cuboid with independent dimensions
  let lOuterX = 350;
  let lOuterY = 250;
  let lOuterZ = 200;
  let outerVerts = getCuboidVertices(lOuterX / 2, lOuterY / 2, lOuterZ / 2);
  drawEdges(outerVerts);

  // Inner cube offset & motion
  gInnerOffset.x = sin(frameCount * 0.01 * gInnerSpeed.x) * 200;
  gInnerOffset.y = cos(frameCount * 0.01 * gInnerSpeed.y) * 200;
  gInnerOffset.z = sin(frameCount * 0.01 * gInnerSpeed.z) * 200;

  // Independent scale for each axis (distorting shape)
  gInnerScale.x = 0.8 + sin(frameCount * 0.015) * 0.3;
  gInnerScale.y = 0.8 + cos(frameCount * 0.017) * 0.3;
  gInnerScale.z = 0.8 + sin(frameCount * 0.013) * 0.3;

  // Inner cube rotation
  gInnerRotation += 0.03;
  let innerVerts = getCuboidVertices(
    100 * gInnerScale.x,
    100 * gInnerScale.y,
    100 * gInnerScale.z
  );

  // Apply rotation + translation to inner cube vertices
  innerVerts = innerVerts.map(v => rotateVector(v, gInnerRotation, gInnerRotation * 0.8, gInnerRotation * 1.2));
  innerVerts = innerVerts.map(v => createVector(v.x + gInnerOffset.x, v.y + gInnerOffset.y, v.z + gInnerOffset.z));

  // Draw inner cube
  drawEdges(innerVerts);

  // Connect matching vertices
  connectVertices(outerVerts, innerVerts);
}

function drawEdges(verts) {
  strokeWeight(1);
  let edges = [
    [0,1],[1,3],[3,2],[2,0], // bottom
    [4,5],[5,7],[7,6],[6,4], // top
    [0,4],[1,5],[2,6],[3,7]  // verticals
  ];
  for (let e of edges) {
    line(
      verts[e[0]].x, verts[e[0]].y, verts[e[0]].z,
      verts[e[1]].x, verts[e[1]].y, verts[e[1]].z
    );
  }
}

function connectVertices(outerVerts, innerVerts) {
  strokeWeight(0.5);
  for (let i = 0; i < 8; i++) {
    line(
      outerVerts[i].x, outerVerts[i].y, outerVerts[i].z,
      innerVerts[i].x, innerVerts[i].y, innerVerts[i].z
    );
  }
}

function getCuboidVertices(x, y, z) {
  let verts = [];
  let sx = [-1, 1];
  let sy = [-1, 1];
  let sz = [-1, 1];
  for (let i of sx) {
    for (let j of sy) {
      for (let k of sz) {
        verts.push(createVector(i * x, j * y, k * z));
      }
    }
  }
  return verts;
}

function rotateVector(v, ax, ay, az) {
  let x = v.x;
  let y = v.y * cos(ax) - v.z * sin(ax);
  let z = v.y * sin(ax) + v.z * cos(ax);

  let x2 = x * cos(ay) + z * sin(ay);
  let z2 = -x * sin(ay) + z * cos(ay);

  let y2 = y * cos(az) - z2 * sin(az);
  let z3 = y * sin(az) + z2 * cos(az);

  return createVector(x2, y2, z3);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
