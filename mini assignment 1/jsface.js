function setup() {
  createCanvas(800,800);
}

function draw() {
  background(252, 120, 93);
  
  stroke('black');
  strokeWeight(2)
  
  fill('252, 120, 93')
  circle(400,400,500);

  circle(330,330,50);
  circle(480,330,50);
  
  fill('black');
  circle(322,330,35);
  circle(472,330,35);
  
  fill('pink');
  arc(400,400, 50, 80, 0, PI);
  
}