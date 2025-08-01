// https://openprocessing.org/sketch/2632912

p5.disableFriendlyErrors = true;

const title = 'geometry';
let palette = [];
let motif;
let backgroundColor = '#0f0f0f';

function setup() {
    createCanvas(1920, 1080);
    strokeCap(SQUARE);
    angleMode(RADIANS);
    rectMode(CENTER);
    ellipseMode(CENTER);
    textAlign(CENTER, CENTER);
    pixelDensity(1);
    noSmooth();
    frameRate(30);
    init()
}

function init() {
    const orgPalette = getColorScheme('PopMix');
    palette = repeatPalette(orgPalette, 1);
    motif = new Motif({
        originX: width / 2,
        originY: height / 2,
    });
    
}

function draw() {
    background(backgroundColor);
    motif.run();
}

////////////////////////////////////////////////
class Element {
    constructor(props = {}) {
        this.id = props.id ?? 0;
        this.isDisplay = props.isDisplay ?? true;
        this.originX = props.originX ?? 0;
        this.originY = props.originY ?? 0;
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        if (props.baseW !== undefined) {
            this.baseW = props.baseW;
            this.baseH = props.baseH;
            this.w = this.baseW;
            this.h = this.baseH;
        } else {
            this.w = props.w ?? 100;
            this.h = props.h ?? 100;
        }
        this.scaleX = props.scaleX ?? 1;
        this.scaleY = props.scaleY ?? 1;
        this.angle = props.angle ?? 0;
        this.fillColor = props.fillColor ?? color('rgba(0, 0, 0, 255)');
        this.strokeColor = props.strokeColor ?? color('rgba(0, 0, 0, 255)');
        this.backgroundColor = props.backgroundColor ?? color('rgba(0, 0, 0, 255)');
        this.offsetColorStop = props.offsetColorStop ?? 0;
        this.offsetColorStopAccel = props.offsetColorStopAccel ?? random(0.001, 0.01);
        this.gradationStopNoise = props.gradationStopNoise ?? 0;
        this.gradientStartAngle = props.gradientStartAngle ?? 0;
        this.gradientX = props.gradientX ?? 0;
        this.gradientY = props.gradientY ?? 0;
        this.colors = props.colors ?? palette.colors.slice();
        this.colors = shuffleArray(this.colors);
        this.colors = circularizeElements(this.colors, this.colors[0]);
        this.colorStops = generateColorStops(this.colors.length, 'noise', 0.2);
        this.amplitude = 250;
        this.phaseShift = 0.1;
        this.repetitions = 1;
        this.targetW = props.targetW ?? 100;
        noStroke();
    }

    run = () => {
        if (!this.isDisplay) return;
        push();
        this.originY = this.amplitude * cos(frameCount * 0.02 + this.id * this.phaseShift);
        translate(this.originX, this.originY);
        scale(this.scaleX, this.scaleY);
        rotate(this.angle);
        this.w = (this.targetW / 2 - this.baseW) * sin(frameCount * 0.03 + this.id * this.phaseShift) + this.targetW / 2;
        drawingContext.save();
        this.offsetColorStop += this.offsetColorStopAccel;
        var gradient = setGradient({
            type: 'repeating-radial',
            style: 'fill',
            colors: this.colors,
            strokeColors: this.colors,
            repetitions: this.repetitions,
            x0: this.x,
            y0: this.y,
            r0: 0,
            r1: this.w,
            offsetColorStop: this.offsetColorStop,
        });
        drawingContext.fillStyle = gradient;
        drawingRoundRect(this.x, this.y, this.w, this.w / 3, 50, 'center');
        drawingContext.restore();
        pop();
    }
}

////////////////////////////////////////////////

class Motif {
    constructor(props = {}) {
        this.id = props.id ?? 0;
        this.isDisplay = props.isDisplay ?? true;
        this.originX = props.originX ?? 0;
        this.originY = props.originY ?? 0;
        this.x = props.x ?? 0;
        this.y = props.y ?? 0;
        if (props.baseSize !== undefined) {
            this.baseSize = props.baseSize;
            this.w = this.baseSize;
            this.h = this.baseSize;
        } else {
            this.w = props.w ?? 100;
            this.h = props.h ?? 100;
        }
        this.scaleX = props.scaleX ?? 1.0;
        this.scaleY = props.scaleY ?? 1.0;
        this.angle = props.angle ?? 0;
        this.repeat = props.repeat || 70;
        this.elements = [];
        for (let i = 0; i < this.repeat; i++) {
            const element = new Element({
                id: i,
                baseW: 950,
                baseH: 100,
                originX: 0,
                originY: 0,
                targetW: 1000,
                x: 0,
                y: 0,
            });
            this.elements.push(element);
        }
    }

    run = () => {
        push()
        translate(this.originX, this.originY);
        rotate(this.angle);
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            element.run();
        }
        pop();
    }
}
////////////////////////////////////////
function resetDrawingContext() {
    drawingContext.restore();
}

function backgroundLinearGradient(colors, offsetColorStop = 0, rectMode = 'center', angleType = 'horizontal') {
    let x = 0;
    let y = 0;
    if (rectMode === 'center') {
        x = width / 2;
        y = height / 2;
    }
    setFillRectLinearGradient(x, y, width, height, colors, offsetColorStop, rectMode, angleType);
    rect(x, y, width, height);
}

function backgroundRadialGradient(colors, offsetColorStop = 0, rectMode = 'center', w = 0) {
    let x = 0;
    let y = 0;
    if (rectMode === 'center') {
        x = width / 2;
        y = height / 2;
    }
    if (w === 0) {
        w = width / 2;
    }
    setFillRadialGradient(x, y, 0, x, y, x + w, colors, offsetColorStop);
    rect(x, y, width, height);
}

function dropShadow(shadowColor = color(20), shadowBlur = 10, shadowOffsetX = 3, shadowOffsetY = 3) {
    drawingContext.shadowColor = shadowColor;
    drawingContext.shadowBlur = shadowBlur;
    drawingContext.shadowOffsetX = shadowOffsetX;
    drawingContext.shadowOffsetY = shadowOffsetY;
}

function resetShadow() {
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
    drawingContext.shadowBlur = 0;
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
}

function blur(blurAmount = 10) {
    drawingContext.filter = `blur(${blurAmount}px)`;
}

function resetBlur() {
    drawingContext.filter = 'none';
}

// ストライプ
function setStripe(props = {}) {
    const {
        stripeWidth = 20,
        colors = ['black', 'white'],
        angle = 0,
        offset = 0
    } = props;
    const canvas = document.createElement('canvas');
    canvas.width = stripeWidth * colors.length;
    canvas.height = stripeWidth * colors.length;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colors[colors.length - 1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < colors.length - 1; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
    }
    const pattern = drawingContext.createPattern(canvas, 'repeat');
    drawingContext.save();
    drawingContext.translate(offset, 0);
    drawingContext.rotate(angle);
    drawingContext.fillStyle = pattern;
}

// 市松模様
function setCheckered(props = {}) {
    const {
        squareSize = 20,
        colors = ['black', 'white'],
        angle = 0,
        offset = 0
    } = props;

    const canvas = document.createElement('canvas');
    canvas.width = squareSize * 2;
    canvas.height = squareSize * 2;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colors[1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, squareSize, squareSize);
    ctx.fillRect(squareSize, squareSize, squareSize, squareSize);

    const pattern = drawingContext.createPattern(canvas, 'repeat');
    drawingContext.save();
    drawingContext.translate(offset, 0);
    drawingContext.rotate(angle);
    drawingContext.fillStyle = pattern;
}

// 水玉模様
function setPolkaDot(props = {}) {
    const {
        dotSize = 10,
        spacing = 30,
        colors = ['black', 'white'],
        angle = 0,
        offset = 0
    } = props;

    const canvas = document.createElement('canvas');
    canvas.width = spacing;
    canvas.height = spacing;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = colors[1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.arc(spacing / 2, spacing / 2, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();

    const pattern = drawingContext.createPattern(canvas, 'repeat');
    drawingContext.save();
    drawingContext.translate(offset, 0);
    drawingContext.rotate(angle);
    drawingContext.fillStyle = pattern;
}

function drawingRect(x, y, w, h, r1, r2) {
    drawingContext.save();
    drawingContext.transform(1, 0, 0, 1, x, y);
    drawingContext.beginPath();
    drawingContext.rect(0, 0, w, h, r1, r2);
    drawingContext.fill();
    drawingContext.restore();
}

function drawingEllipse(x, y, w, h) {
    drawingContext.save();
    drawingContext.transform(1, 0, 0, h / w, x, y);
    drawingContext.beginPath();
    drawingContext.ellipse(0, 0, w / 2, w / 2, 0, 0, Math.PI * 2);
    drawingContext.fill();
    drawingContext.restore();
}

function drawingRoundRect(x, y, w, h, r, rectMode = 'corner') {
    drawingContext.save();
    if (rectMode === 'center') {
        x = x - w / 2;
        y = y - h / 2;
    }
    drawingContext.beginPath();
    drawingContext.moveTo(x + r, y);
    drawingContext.lineTo(x + w - r, y);
    drawingContext.arcTo(x + w, y, x + w, y + r, r);
    drawingContext.lineTo(x + w, y + h - r);
    drawingContext.arcTo(x + w, y + h, x + w - r, y + h, r);
    drawingContext.lineTo(x + r, y + h);
    drawingContext.arcTo(x, y + h, x, y + h - r, r);
    drawingContext.lineTo(x, y + r);
    drawingContext.arcTo(x, y, x + r, y, r);
    drawingContext.closePath();
    drawingContext.clip();
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    drawingContext.translate(centerX, centerY);
    drawingContext.scale(1, h / w);
    drawingContext.beginPath();
    const radius = Math.max(w, h) * 1.5;
    drawingContext.arc(0, 0, radius, 0, Math.PI * 2);
    drawingContext.fill();
    drawingContext.restore();
}