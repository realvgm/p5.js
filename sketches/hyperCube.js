// Daniel Shiffman
// http://youtube.com/thecodingtrain
// http://codingtra.in
// JavaScript transcription: Chuck England

// Coding Challenge #113: 4D Hypercube
// https://youtu.be/XE3YDVdQSPo

// Matrix Multiplication
// https://youtu.be/tzsgS19RRc8

let angle = 0;

let points = [];

function setup() {
    let size = min(windowWidth, windowHeight);
    createCanvas(size, size, WEBGL);
    points[0] = new P4Vector(-1, -1, -1, 1);
    points[1] = new P4Vector(1, -1, -1, 1);
    points[2] = new P4Vector(1, 1, -1, 1);
    points[3] = new P4Vector(-1, 1, -1, 1);
    points[4] = new P4Vector(-1, -1, 1, 1);
    points[5] = new P4Vector(1, -1, 1, 1);
    points[6] = new P4Vector(1, 1, 1, 1);
    points[7] = new P4Vector(-1, 1, 1, 1);
    points[8] = new P4Vector(-1, -1, -1, -1);
    points[9] = new P4Vector(1, -1, -1, -1);
    points[10] = new P4Vector(1, 1, -1, -1);
    points[11] = new P4Vector(-1, 1, -1, -1);
    points[12] = new P4Vector(-1, -1, 1, -1);
    points[13] = new P4Vector(1, -1, 1, -1);
    points[14] = new P4Vector(1, 1, 1, -1);
    points[15] = new P4Vector(-1, 1, 1, -1);
}

function draw() {
    background(0);
    rotateX(-PI / 2);
    let projected3d = [];

    for (let i = 0; i < points.length; i++) {
        const v = points[i];

        const rotationXY = [
            [cos(angle), -sin(angle), 0, 0],
            [sin(angle), cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];

        const rotationZW = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, cos(angle), -sin(angle)],
            [0, 0, sin(angle), cos(angle)]
        ];

        let rotated = matmul(rotationXY, v);
        rotated = matmul(rotationZW, rotated);

        let distance = 2;
        let w = 1 / (distance - rotated.w);

        const projection = [
            [w, 0, 0, 0],
            [0, w, 0, 0],
            [0, 0, w, 0]
        ];

        let projected = matmul(projection, rotated);
        projected.mult(width / 8);
        projected3d[i] = projected;

        stroke(255, 200);
        strokeWeight(12);
        noFill();

        //point(projected.x, projected.y, projected.z);
    }

    // Connecting
    for (let i = 0; i < 4; i++) {
        connect(0, i, (i + 1) % 4, projected3d);
        connect(0, i + 4, ((i + 1) % 4) + 4, projected3d);
        connect(0, i, i + 4, projected3d);
    }

    for (let i = 0; i < 4; i++) {
        connect(8, i, (i + 1) % 4, projected3d);
        connect(8, i + 4, ((i + 1) % 4) + 4, projected3d);
        connect(8, i, i + 4, projected3d);
    }

    for (let i = 0; i < 8; i++) {
        connect(0, i, i + 8, projected3d);
    }

    //angle = map(mouseX, 0, width, 0, TWO_PI);
    angle += 0.02;
}

function connect(offset, i, j, points) {
    strokeWeight(4);
    stroke(255);
    const a = points[i + offset];
    const b = points[j + offset];
    line(a.x, a.y, a.z, b.x, b.y, b.z);
}

// Daniel Shiffman
// http://youtube.com/thecodingtrain
// http://codingtra.in
// JavaScript transcription: Chuck England

// Coding Challenge #113: 4D Hypercube
// https://youtu.be/XE3YDVdQSPo

// Matrix Multiplication
// https://youtu.be/tzsgS19RRc8

class P4Vector {
    constructor(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 0;
    }

    mult(f) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        this.w *= f;
    }
}

// JavaScript transcription: Chuck England
// Daniel Shiffman
// http://youtube.com/thecodingtrain
// http://codingtra.in

// Coding Challenge #113: 4D Hypercube
// https://youtu.be/XE3YDVdQSPo

// Matrix Multiplication
// https://youtu.be/tzsgS19RRc8

function vecToMatrix(v) {
    let m = [];
    for (let i = 0; i < 3; i++) {
        m[i] = [];
    }
    m[0][0] = v.x;
    m[1][0] = v.y;
    m[2][0] = v.z;
    return m;
}

function vec4ToMatrix(v) {
    let m = vecToMatrix(v);
    m[3] = [];
    m[3][0] = v.w;
    return m;
}

function matrixToVec(m) {
    return createVector(m[0][0], m[1][0], m[2][0]);
}

function matrixToVec4(m) {
    let r = new P4Vector(m[0][0], m[1][0], m[2][0], 0);
    if (m.length > 3) {
        r.w = m[3][0];
    }
    return r;
}

function logMatrix(m) {
    const cols = m[0].length;
    const rows = m.length;
    console.log(rows + 'x' + cols);
    console.log('----------------');
    let s = '';
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            s += m[i][j] + ' ';
        }
        console.log(s);
    }
    console.log();
}

function matmulvec(a, vec) {
    let m = vecToMatrix(vec);
    let r = matmul(a, m);
    return matrixToVec(r);
}

function matmulvec4(a, vec) {
    let m = vec4ToMatrix(vec);
    let r = matmul(a, m);
    return matrixToVec4(r);
}

function matmul(a, b) {
    if (b instanceof p5.Vector) {
        return matmulvec(a, b);
    }
    if (b instanceof P4Vector) {
        return matmulvec4(a, b);
    }

    let colsA = a[0].length;
    let rowsA = a.length;
    let colsB = b[0].length;
    let rowsB = b.length;

    if (colsA !== rowsB) {
        console.error('Columns of A must match rows of B');
        return null;
    }

    result = [];
    for (let j = 0; j < rowsA; j++) {
        result[j] = [];
        for (let i = 0; i < colsB; i++) {
            let sum = 0;
            for (let n = 0; n < colsA; n++) {
                sum += a[j][n] * b[n][i];
            }
            result[j][i] = sum;
        }
    }
    return result;
}