// I modified truchet tiling so that you can upload your own image and create a mosaic out of 40x40 pixel square subdivisions
// Editing patternList allows users to control how the tiles are arranged/displayed

let img;
let rW = 40;
let rH = 40;
let uploaded = false;

let patternA = [1, 1, 1, 1];
let patternB = [1, 0.5, 0.75, 0.25];
let patternC = [0.75, 0.25, 1, 0.5];
let patternD = [0.25, 0.75, 0.5, 1];

let patternList = [patternA, patternB, patternC, patternD];

function setup() {
  createCanvas(800, 800);
  background(0);
  angleMode(RADIANS);
  noLoop();

  // file input
  let file = createFileInput(handleFile);
  file.position(10, 10);
}

function draw() {
  background(0);
  if (!uploaded) {
    fill(255);
    text("Upload an image to generate tile pattern", 10, 60);
    return;
  }
  let patternIndex = 0;
  for (let j = 0; j < height / rH; j++) {
    let t = 0;
    let targetPattern = patternList[patternIndex];
    patternIndex++;
    if (patternIndex > patternList.length - 1) patternIndex = 0;

    for (let i = 0; i < width / rW; i++) {
      let v = targetPattern[t];
      let r = toQuadrant(v);
      drawSeed(i * rW, j * rH, r);
      t++;
      if (t > targetPattern.length - 1) t = 0;
    }
  }
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      img.resize(width, height);
      uploaded = true;
      redraw();
    });
  }
}

function toQuadrant(v) {
  if (v <= 0.25) return TWO_PI * 0.25;
  else if (v <= 0.5) return TWO_PI * 0.5;
  else if (v <= 0.75) return TWO_PI * 0.75;
  else return TWO_PI;
}

function drawSeed(x, y, r) {
  push();
  translate(x + rW / 2, y + rH / 2);
  rotate(r);
  rectMode(CENTER);
  noFill();
  stroke(255);
  rect(0, 0, rW, rH);

  // each tile pulls the matching section from the image
  let sx = x;      // source x from image
  let sy = y;      // source y from image
  let sw = rW;     // source width
  let sh = rH;     // source height

  imageMode(CENTER);
  image(img, 0, 0, rW, rH, sx, sy, sw, sh);
  pop();
}
