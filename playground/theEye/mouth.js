function Mouth(size, initColor) {
	this.d = size;
	this.c = initColor;
	this.x = width / 2;
	this.y = height / 2;
	this.vel = createVector(0, 0);
	this.maxSpeed = 500;
	this.maxAcc = 10;
	this.drag = 0.95;
	this.goTo = createVector(width / 2, height / 2);

	this.display = function (index) {
		let gradient = drawingContext.createRadialGradient(this.x, this.y, this.d, this.x, this.y, this.d * 2);
		gradient.addColorStop(0, color(this.c));
		gradient.addColorStop(1, color(hue(this.c), saturation(this.c), 0));
		drawingContext.fillStyle = gradient;
		noStroke();
		beginShape();
		vertex(0, 0);
		vertex(width, 0);
		vertex(width, height);
		vertex(0, height);
		beginContour();
		for (let i = PI * 2; i > 0; i -= 0.01) {
			x = cos(i) * this.d + this.x;
			y = sin(i) * this.d + this.y;
			vertex(x, y);
		}
		endContour();
		endShape();
	}
	this.move = function (influence, speed) {
		this.goTo = createVector(width / 2 + (mouseX - width / 2) * influence, height / 2 + (mouseY - height / 2) * influence);
		let dir = createVector(this.goTo.x - this.x, this.goTo.y - this.y);
		let pos = createVector(this.x, this.y);
		dir.normalize();
		dir.mult(map(this.goTo.dist(pos), 0, big, 0, this.maxAcc));
		this.vel.add(dir);
		this.vel.mult(this.drag);
		this.vel.limit(this.maxSpeed);
		this.x += this.vel.x;
		this.y += this.vel.y;
		this.c = [hue(this.c) + 360 / mouthNum * speed, saturation(this.c), brightness(this.c)];
	}
}