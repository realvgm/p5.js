// ==========================
// Bauhaus Illustration Sketch
// ==========================
const bauhaus = (p) => {
    // Global arrays and constants
    let gColors = ["#1c80b4", "#fcad2a", "#f82f1d"];
    let gGridCount = 6;
    let gBoxes = [];

    // ==========================
    // Box Class (Single square)
    // ==========================
    class Box {
        constructor(pX, pY, pColor) {
            this.lStartX = pX;                          // Original X position
            this.lX = pX;                               // Current X position
            this.lY = pY;                               // Current Y position
            this.lSpeed = 0;                            // Movement speed
            this.lSize = gHEIGHT / gGridCount / 2;      // Box size
            this.lColor = pColor;                       // Box fill color
        }

        // Draw box with shadow
        show() {
            fill("#0d0e08"); // Shadow color
            square(this.lX - 1, this.lY + 1, this.lSize);

            fill(this.lColor); // Main color
            square(this.lX, this.lY, this.lSize);
        }

        // Move box diagonally until reaching growth limit
        move() {
            if (this.lX < this.lStartX + this.lSize) {
                this.lX += this.lSpeed * gSPEED;
                this.lY -= this.lSpeed * gSPEED;
            }
        }
    }

    // ==========================
    // p5 Setup
    // ==========================
    p.setup = () => {
        describe('Bauhaus columns.');

        createCanvas(gWIDTH, gHEIGHT);
        background("#ffe7c1"); // Background color
        noStroke();

        // Create grid of boxes with alternating colors
        for (let lY = gHEIGHT / gGridCount / 2; lY < gHEIGHT; lY += gHEIGHT / gGridCount) {
            for (let lX = 0; lX < gWIDTH; lX += gWIDTH / gGridCount) {
                let lColorIndex = (lX / (gWIDTH / gGridCount) + Math.floor(lY / (gHEIGHT / gGridCount))) % 3;
                let lColor = gColors[lColorIndex];
                gBoxes.push(new Box(lX, lY, lColor));
            }
        }
    };

    // ==========================
    // p5 Draw Loop
    // ==========================
    p.draw = () => {
        gBoxes.forEach((lBox) => {
            lBox.show();
            lBox.move();

            // Random chance to start moving
            if (random(1) < 0.01) {
                lBox.lSpeed = 1;
            }
        });
    };
};