function Eye(size){
	
	this.size = size;
	this.pupilSize = size/6;
	
	this.display = function(posX,posY){
		var pos = createVector(posX,posY);
		var mouse = createVector(mouseX,mouseY);
		var lookAt = mouse.sub(pos);
		lookAt.normalize();
		var gazeMult = constrain(map(dist(posX,posY,mouseX,mouseY),0,big/3,0,1),0,1);
		lookAt.mult(this.pupilSize*gazeMult);		
		image(iris, posX - this.size/2 + lookAt.x, posY- this.size/2 + lookAt.y, this.size, this.size);
	}
}