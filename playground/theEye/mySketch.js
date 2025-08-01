var mouths = [];
var mouthNum = 5;
var colorSpeed =0.1;
var big;
var expo = 5.1;
var eye;

function preload(){
	iris = loadImage('eye.jpg');
}

function setup() {
	colorMode(HSB);
	createCanvas(windowWidth, windowHeight);
	background(100);
	if(width>height){big = width;}else{big=height;}
	for(let i=0; i<mouthNum; i++){
		mouths.push(new Mouth(((big/mouthNum)/1.5)*i,[0,0,map(i,0,mouthNum,0,50)]));
	}
	eye = new Eye(mouths[3].d);
}

function draw() {
	background(255);
	eye.display(mouths[1].x,mouths[1].y);
	for(let i = 0; i<mouths.length; i++){
		mouths[i].display(i);
		mouths[i].move(map(i,0,mouthNum,1,0), colorSpeed);
	}
	/*
	for(let i = 0; i<mouths.length; i++){
		stroke(255);
		strokeWeight(5);
		point(mouths[i].goTo.x,mouths[i].goTo.y);
		noStroke();
	}
	*/
}