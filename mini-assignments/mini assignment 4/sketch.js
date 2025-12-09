let circles = [];
let table;
let distance = [];
let labels = [];
let energy = [];
let duration = [];
let dates = [];
let tooltipGraphics;

let currentTime;       // current day
let minDate, maxDate;
let playbackSpeed = 0.5; 

function preload() {
  table = loadTable('cycling_workouts.csv', 'csv', 'header');
}

function setup() {
  createCanvas(2000, 400);
  tooltipGraphics = createGraphics(2000, 400);

  // Load and parse all rows
  for (let r = 0; r < table.getRowCount(); r++) {
    let startStr = table.getString(r, 'startDate');
    let d = parseDate(startStr);
    dates.push(d);
    labels.push(formatDate(startStr));

    distance.push(float(table.getString(r, 'totalDistance_miles')));
    energy.push(float(table.getString(r, 'totalEnergyBurned_cal')));
    duration.push(float(table.getString(r, 'duration_minutes')));
  }

  // Find date range
  minDate = min(dates);
  maxDate = max(dates);
  currentTime = minDate;

  for (let i = 0; i < table.getRowCount(); i++) {
    let normalizedDuration = map(duration[i], 0, 120, 5, 0.1);
    let normalizedEnergy = map(energy[i], 0, 200, 1, 20);
    let normalizedDistance = map(distance[i], 0, 20, 0, 270);
    circles.push(new Circle(normalizedEnergy, normalizedDuration, normalizedDistance, dates[i], labels[i]));
  }
}

function draw() {
  background(20);

  currentTime += playbackSpeed;
  if (currentTime > maxDate) 
    currentTime = minDate; 

  for (let c of circles) {
    // Show ride if its date is <= current timeline
    if (c.date <= currentTime) {
      c.update();
      c.show();
    }
  }

  drawTimeline();
  drawTooltip();
}

function drawTimeline() {
  noStroke();
  fill(80);
  rect(0, height - 10, width, 10);

  fill(0, 255, 255);
  let progress = map(currentTime, minDate, maxDate, 0, width);
  rect(0, height - 10, progress, 10);

  push();
  translate(progress, height - 10); // position at front of the bar
  rotate(frameCount * 0.1); // spin speed
  stroke(0);
  strokeWeight(2);
  noFill();
  ellipse(0, 0, 16, 16); 
  line(0, 0, 8, 0);
  pop();

  textSize(24);
  textAlign(CENTER, BOTTOM);
  text('🚲', progress - 20, height - 12);
  
}

function drawTooltip() {
  tooltipGraphics.clear();

  for (let c of circles) {
    if (c.date <= currentTime && c.mouseOver(mouseX, mouseY)) {
      const lines = [
        `${c.label}`,
        `Distance: ${nf(c.distance, 1, 1)} mi`,
        `Energy: ${round(c.energy)} cal`,
        `Duration: ${nf(c.duration, 1, 1)} min`
      ];

      tooltipGraphics.textAlign(LEFT, TOP);
      tooltipGraphics.textSize(12);
      const padding = 8;
      let tw = 0;
      for (let t of lines) tw = max(tw, textWidth(t));
      let boxW = tw + padding * 2;
      let lineH = 16;
      let boxH = lines.length * lineH + padding * 2;
      let tipX = constrain(mouseX + 12, 0, width - boxW - 1);
      let tipY = constrain(mouseY - (boxH + 12), 0, height - boxH - 1);

      tooltipGraphics.noStroke();
      tooltipGraphics.fill(0, 0, 0, 200);
      tooltipGraphics.rect(tipX, tipY, boxW, boxH, 6);
      tooltipGraphics.fill(255);
      for (let li = 0; li < lines.length; li++) {
        tooltipGraphics.text(lines[li], tipX + padding, tipY + padding + li * lineH);
      }
    }
  }

  image(tooltipGraphics, 0, 0);
}

// Circle class
class Circle {
  constructor(r, velocity, hue, date, label) {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-1, 1), velocity);
    this.acc = createVector(0, 0);
    this.r = r;
    this.hue = hue;
    this.date = date;
    this.label = label;

    // store data for tooltip
    let i = circles.length;
    this.distance = distance[i];
    this.energy = energy[i];
    this.duration = duration[i];
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // bounce
    if (this.pos.x < this.r || this.pos.x > width - this.r) this.vel.x *= -0.9;
    if (this.pos.y < this.r || this.pos.y > height - this.r) this.vel.y *= -0.9;
    this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    this.pos.y = constrain(this.pos.y, this.r, height - this.r);
  }

  show() {
  colorMode(HSB);
  push();
  translate(this.pos.x, this.pos.y);


  // outer wheel rim
  stroke(this.hue, 255, 255);
  strokeWeight(2);
  noFill();
  circle(0, 0, this.r * 2);

  // spokes
  strokeWeight(1);
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI * (i / 6);
    line(0, 0, this.r * cos(angle), this.r * sin(angle));
  }

  // hub
  noStroke();
  fill(this.hue, 255, 255);
  circle(0, 0, this.r * 0.3);

  pop();
}


  mouseOver(mx, my) {
    return dist(mx, my, this.pos.x, this.pos.y) < this.r;
  }
}

// Parse date strings into numeric timestamps
function parseDate(str) {
  let parts = str.split(" ");
  let dateParts = parts[0].split("-");
  let timeParts = parts[1].split(":");
  return new Date(
    int(dateParts[0]),
    int(dateParts[1]) - 1,
    int(dateParts[2]),
    int(timeParts[0]),
    int(timeParts[1]),
    int(timeParts[2])
  ).getTime() / (1000 * 60 * 60 * 24); 
}

function formatDate(datetimeStr) {
  let datePart = datetimeStr.split(" ")[0];
  let parts = datePart.split("-");
  let year = parts[0].slice(2);
  let month = parts[1];
  let day = parts[2];
  return `${month}/${day}/${year}`;
}
