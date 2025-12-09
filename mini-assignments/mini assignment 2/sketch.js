// Josef Albers Color Relativity 1 Example from Code as Creative Medium
// Four columns for more range
// Added a mute toggle to see how the colors would look in a more "natural" palette
// Got rid of circles to focus on the gradient rather than contrast

let muted = false;

function setup() {
  createCanvas(600, 500);
  colorMode(HSB, 360, 100, 100);
  noStroke();
}

function draw() {
  let hueBase = map(mouseX, 0, width, 0, 360);

  let s = muted ? 40 : 80;
  let b = muted ? 70 : 100;

  // four hues for palette
  let h1 = hueBase;
  let h2 = (hueBase + 30) % 360;
  let h3 = (hueBase + 180) % 360;
  let h4 = (hueBase + 210) % 360;

  // 4 columns
  fill(h1, s, b);
  rect(0, 0, width / 4, height);
  fill(h2, s, b);
  rect(width / 4, 0, width / 4, height);
  fill(h3, s, b);
  rect(2 * width / 4, 0, width / 4, height);
  fill(h4, s, b);
  rect(3 * width / 4, 0, width / 4, height);

  
  fill(0);
  textSize(12);
  text("press 'm' to mute", 10, height - 25);
}

function keyPressed() {
  if (key === 'm') {
    muted = !muted;
  } 
}

