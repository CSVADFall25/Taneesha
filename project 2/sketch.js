let table;
let allDates = [];
let allSteps = [];
let filteredDates = [];
let filteredSteps = [];

let sprite;
let spriteImg;
let timelineSlider;
let filterMenu;
let currentIndex = 0;
let bg1;
let bg2;
let bg3;
let minSteps = Infinity;
let maxSteps = 0;

let songSlow, songMedium, songFast;
let currentSong = null;
let muteButton;
let isMuted = false;

let infoButton;
let showInfo = false;



function preload() {
bg1 = loadImage('assets/bg1.png');
bg2 = loadImage('assets/bg2.png');
bg3 = loadImage('assets/bg3.png');

songSlow = loadSound('assets/slow.m4a');
songMedium = loadSound('assets/medium.m4a');
songFast = loadSound('assets/fast.m4a');

  table = loadTable('daily_steps.csv', 'csv', 'header');
  spriteImg = loadImage('assets/spritem.png',
    () => {},
    (err) => {
      print('Warning: sprite image failed to load:', err);
      spriteImg = null;
    }
  );
}

function setup() {

  const c = createCanvas(windowWidth * 0.9, windowHeight * 0.9);
  c.parent('sketch');

  // load CSV data
  for (let r = 0; r < table.getRowCount(); r++) {
    let dateStr = table.getString(r, 'date');
    let stepVal = float(table.getString(r, 'steps'));
    allDates.push(dateStr);
    allSteps.push(stepVal);
  }

  // compute min/max steps for mapping to sprite speed
  if (allSteps.length > 0) {
    minSteps = allSteps.reduce((a, b) => Math.min(a, b), allSteps[0]);
    maxSteps = allSteps.reduce((a, b) => Math.max(a, b), allSteps[0]);
    // avoid zero range
    if (minSteps === maxSteps) {
      maxSteps = minSteps + 1;
    }
  }

  print('Loaded', allDates.length, 'rows.');
  sprite = new Sprite();

  infoButton = createButton('❔');
  infoButton.position(20, height/10);
  infoButton.style('border-radius', '50%');
  infoButton.style('width', '30px');
  infoButton.style('height', '30px');
  infoButton.mousePressed(() => {
  showInfo = !showInfo; // toggle info display
});

  // filter menu
  filterMenu = createSelect();
  filterMenu.position(30, height - 20);
  filterMenu.option('April 2019 - Aug 2022');
  filterMenu.option('Sep 2022 - Aug 2024');
  filterMenu.option('Sep 2024 - Nov 2025');
  filterMenu.changed(applyFilter);
  
  applyFilter();

  // timeline slider
  timelineSlider = createSlider(0, allDates.length - 1, 0, 1);
  timelineSlider.position(30, height)
  timelineSlider.style('width', '80%');

  // make mute button
  muteButton = createButton('🔊 Mute');
  muteButton.position(30, height - 60);
  muteButton.mousePressed(toggleMute);
}

function draw() {
  // background dependent on current filter
  let choice = filterMenu.value();

  if (choice === 'April 2019 - Aug 2022') {
    background(bg1);   
  } 
  else if (choice === 'Sep 2022 - Aug 2024') {
    background(bg2); 
  } 
  else if (choice === 'Sep 2024 - Nov 2025') {
    background(bg3); 
  }

  if (showInfo) {
  fill(0, 180); 
  rect(50, 50, 450,200, 20);

  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(
    "- Move the sprite using arrow keys. \n" +
    "- Use the timeline slider to scroll through days.\n" +
    "- Use the mute button to toggle sound.\n\n",
    70, 70, width - 140, height - 140
  );
}

  // skip drawing if no data
  if (filteredDates.length === 0) {
    fill(0);
    textSize(24);
    text("No data in this range", 50, 50);
    return;
  }

  // use filtered data
  currentIndex = timelineSlider.value();
  let currentDate = filteredDates[currentIndex];
  let currentSteps = filteredSteps[currentIndex];

  // update sprite
  sprite.update(currentSteps);
  sprite.show();

  drawTimeline(currentIndex);

  // hover info
let d = dist(mouseX, mouseY, sprite.pos.x, sprite.pos.y);
if (d < 50) {
  fill(0, 150);
  rect(mouseX + 10, mouseY - 40, 220, 60, 10);

  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`📅 ${currentDate}\n🚶 Steps: ${currentSteps}`, mouseX + 20, mouseY - 35);
}


  // add music based on speed
  let sceneSong;

if (sprite.speed < 1) {
  sceneSong = songSlow;
} else if (sprite.speed < 2) {
  sceneSong = songMedium;
} else {
  sceneSong = songFast;
}

if (currentSong !== sceneSong) {
    stopAllSongs();
    currentSong = sceneSong;
    if (!isMuted) {
      currentSong.loop();
    }
  }
}

function applyFilter() {
  let choice = filterMenu.value();
  let startDate, endDate;

  if (choice === 'April 2019 - Aug 2022') {
    startDate = new Date('2019-04-01');
    endDate = new Date('2022-08-31');
  } else if (choice === 'Sep 2022 - Aug 2024') {
    startDate = new Date('2022-09-01');
    endDate = new Date('2024-08-31');
  } else if (choice === 'Sep 2024 - Nov 2025') {
    startDate = new Date('2024-09-01');
    endDate = new Date('2025-11-30');
  }

  // filter data by date
  filteredDates = [];
  filteredSteps = [];
  for (let i = 0; i < allDates.length; i++) {
    let d = new Date(allDates[i]);
    if (d >= startDate && d <= endDate) {
      filteredDates.push(allDates[i]);
      filteredSteps.push(allSteps[i]);
    }
  }

  // Update slider range
  timelineSlider.attribute('max', filteredDates.length - 1);
  timelineSlider.value(0);
  currentIndex = 0;

  print('Filter applied:', choice, '→', filteredDates.length, 'rows');
}

// progress bar
function drawTimeline(index) {
  noStroke();
  fill(200);
  rect(0, height - 10, width, 10);

  fill(121, 154, 166);
  let progress = map(index, 0, filteredDates.length - 1, 0, width);
  rect(0, height - 10, progress, 10);
}

class Sprite {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.dir = createVector(1, 0);
    this.speed = 0;
    this.changeDirTimer = 0;
  }

  update(steps) {
    this.speed = map(steps, minSteps, maxSteps, 0.5, 6);

    // move with arrow keys (use current speed)
    if (keyIsDown(UP_ARROW) && this.pos.y > 0) {
      this.pos.y -= this.speed;
    }
    if (keyIsDown(DOWN_ARROW) && this.pos.y < height - 60) {
      this.pos.y += this.speed;
    }
    if (keyIsDown(LEFT_ARROW) && this.pos.x > 0) {
      this.pos.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) && this.pos.x < width) {
      this.pos.x += this.speed;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    imageMode(CENTER);
    if (spriteImg) {
    scale(2);
      image(spriteImg, 0, 0, 60, 60);
    } else {
      fill(0, 150, 255);
      noStroke();
      ellipse(0, 0, 40, 40);
    }
    pop();
  }
}

// audio control functions
function stopAllSongs() {
  songSlow.stop();
  songMedium.stop();
  songFast.stop();
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    stopAllSongs();
    muteButton.html('🔈 Unmute');
  } else {
    // resume current song based on sprite speed
    if (currentSong) currentSong.loop();
    muteButton.html('🔊 Mute');
  }
}
