//p5.js shader basic structure ref from https://www.openprocessing.org/sketch/920144

let theShader;

function preload(){
	theShader = new p5.Shader(this.renderer,vert,frag)
}

function setup() {
	createCanvas(innerWidth,innerHeight,WEBGL);
	noStroke()
	background(0);
}

function draw() {
	shader(theShader)
	theShader.setUniform('u_resolution',[width,height])
	theShader.setUniform('u_time',millis()*0.001)
	
	rect(-width/2,-height/2,width,height)
	ellipse(mouseX, mouseY, 20, 20);
}

let lapse = 0;    // mouse timer
function mousePressed(){
// prevents mouse press from registering twice
  if (millis() - lapse > 400){
    save("img_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() +      ".jpg");
    lapse = millis();
  }
}
