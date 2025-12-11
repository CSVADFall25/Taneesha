// Create WebSocket connection.
const socket = new WebSocket('ws://127.0.0.1:8080');

let lastY = NaN; 
let lastX = NaN;
let lastZ = NaN;

let input; 
let soundFile = null; 
let fft;

let currentBand = "treble"; 
let strokes = [];
let currentStroke = null;

// custom p5 controls
let playButton = null;
let muteButton = null;
let seekSlider = null;
let isSeeking = false;
let prevVolume = 1;


// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
  console.log('Raw message:', event.data);

  // Accept JSON arrays like "[1,1,0]" or whitespace tokens like "1G 1G 0G"
  if (!event.data || typeof event.data !== 'string') return;
  const s = event.data.trim();

  let x = NaN, y = NaN, z = NaN;

  // Try JSON array first
  if (s.startsWith('[') && s.endsWith(']')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr.length >= 3) {
        x = parseInt(arr[0]);
        y = parseInt(arr[1]);
        z = parseInt(arr[2]);
      }
    } catch (e) {
      console.warn('Invalid JSON array:', s);
      return;
    }
  } else {
    // whitespace-separated tokens like: "1G 1G 0G"
    const parts = s.split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 3) {
      const clean = tok => tok.replace(/G$/i, '').trim();
      x = parseInt(clean(parts[0]));
      y = parseInt(clean(parts[1]));
      z = parseInt(clean(parts[2]));
    } else {
      return;
    }
  }

  console.log('Parsed gravity:', x, y, z);
  // store latest axis values and map them directly to the current band
  lastX = x;
  lastY = y;
  lastZ = z;

  // Direct mapping from gravity axes to currentBand:
  // If X==1 -> bass, else if Y==1 -> mid, else if Z==1 -> treble
  if (lastX === 1) {
    currentBand = 'bass';
  } else if (lastY === 1) {
    currentBand = 'mid';
  } else if (lastZ === 1) {
    currentBand = 'treble';
  }
});


function setup() {
  createCanvas(windowWidth - 20, windowHeight / 1.4);
  background(0);

  input = createFileInput(handleFile);
  input.position(250, 35);
  
  fft = new p5.FFT();

  colorPicker = createColorPicker('white');
  colorPicker.size(50,30);
}

function draw() {
  background(0);

  if (soundFile) { // mapping frequencies in audio file to different brush thickness 
    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let treble = fft.getEnergy("treble");
    
    // Increase bass range and reduce treble range for stronger contrast
    let bassSize   = map(bass,   0, 255, 20, 120);
    let midSize    = map(mid,    0, 255, 5, 60);
    let trebleSize = map(treble, 0, 255, 2, 20);
    
    // Make bass pulse stronger, mid moderate, treble much smaller
    let bamp = fft.getEnergy("bass");
    let bpulse = map(bamp, 0, 255, 0, 80); // bass-driven pulse (amplified)
    
    let mamp = fft.getEnergy("mid");
    let mpulse = map(mamp, 0, 255, 0, 30); // mid-driven pulse (slightly reduced)
    
    let tamp = fft.getEnergy("treble");
    let tpulse = map(tamp, 0, 255, 0, 10); // treble-driven pulse (reduced)

    let brushSize;

    // Use gentler multiplicative factors so sizes stay reasonable
    if (currentBand === "bass") {
      brushSize = bassSize * (1 + bpulse / 20);
    } else if (currentBand === "mid") {
      brushSize = midSize * (1 + mpulse / 60);
    } else {
      brushSize = trebleSize * (1 + tpulse / 200);
    }
    
    // Draw smooth strokes
    for (let s of strokes) {
      if (!s.points || s.points.length === 0) continue;
      // pulse depends on the stroke's band
      let energy = fft.getEnergy(s.band);
      let pulse = map(energy, 0, 255, 0, 40);

      // Build left and right offset point arrays for a variable-width polygon
      const left = [];
      const right = [];
      for (let i = 0; i < s.points.length; i++) {
        const p = s.points[i];
        const base = p.baseSize || 20;
        const w = (base + pulse) / 2; // radius -> half-width

        // compute direction vector using neighboring points
        let prev = s.points[i - 1] || p;
        let next = s.points[i + 1] || p;
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        // perpendicular (normal)
        let nx = -dy;
        let ny = dx;
        const len = sqrt(nx * nx + ny * ny) || 1;
        nx = (nx / len) * w;
        ny = (ny / len) * w;

        left.push({ x: p.x + nx, y: p.y + ny });
        right.push({ x: p.x - nx, y: p.y - ny });
      }

      // draw polygon
      noStroke();
      fill(s.color);
      beginShape();
      for (let v of left) vertex(v.x, v.y);
      for (let j = right.length - 1; j >= 0; j--) vertex(right[j].x, right[j].y);
      endShape(CLOSE);

      // draw rounded end caps
      const first = s.points[0];
      const last = s.points[s.points.length - 1];
      const firstW = ((first.baseSize || 20) + pulse);
      const lastW = ((last.baseSize || 20) + pulse);
      circle(first.x, first.y, firstW);
      circle(last.x, last.y, lastW);
    }

    // while mouse is pressed, add points to current stroke
    // update seek slider position when not actively seeking
    if (seekSlider && !isSeeking && soundFile && typeof soundFile.duration === 'function' && soundFile.duration() > 0) {
      try {
        seekSlider.value(soundFile.currentTime() / soundFile.duration());
      } catch (e) {
        // ignore
      }
    }

    if (mouseIsPressed) {
      if (!currentStroke) {
        currentStroke = { points: [], color: colorPicker.color(), band: currentBand };
        strokes.push(currentStroke);
      }
      // only add point if it moved a small amount to avoid duplicate points
      const pts = currentStroke.points;
      if (pts.length === 0 || dist(mouseX, mouseY, pts[pts.length - 1].x, pts[pts.length - 1].y) > 1) {
        pts.push({ x: mouseX, y: mouseY, baseSize: 20 });
      }
    } else {
      // finish stroke when mouse released
      currentStroke = null;
    }
  }
}

function keyPressed() { // switch between brush strokes
  if (key === 'C' || key === 'c'){ // clear canvas
    background(255, 255, 255, 200);
    strokes = [];
  }
}

function handleFile(file) {
  print(file);

  if (file.type === "audio") {
    // stop and remove previous soundFile if it exists
    if (soundFile) {
      try { soundFile.stop(); } catch (e) {}
      try { soundFile.disconnect(); } catch (e) {}
      soundFile = null;
    }

    // Load audio into p5.SoundFile for playback and FFT
    soundFile = loadSound(file.data, () => {
      console.log("Audio loaded successfully!");
      fft.setInput(soundFile);

      playButton = createButton('▶');
      playButton.position(width / 2 - 150, 25);
      playButton.style('background-color', '#eee');
      playButton.style('border-radius', '50%');
      playButton.style('width', '30px');
      playButton.style('height', '30px');
      playButton.mousePressed(() => {
        if (!soundFile) return;
        if (soundFile.isPlaying()) {
          soundFile.pause();
          playButton.html('▶');
        } else {
          try { soundFile.play(); } catch (e) { }
          playButton.html('⏸');
        }
      });

      muteButton = createButton('🔈');
      muteButton.position(width / 2 - 100, 25);
      muteButton.style('background-color', '#eee');
      muteButton.style('border-radius', '50%');
      muteButton.style('width', '30px');
      muteButton.style('height', '30px');
      muteButton.mousePressed(() => {
        if (!soundFile) return;
        if (soundFile.getVolume && typeof soundFile.getVolume === 'function') {
          try {
            const v = soundFile.getVolume();
            if (v > 0) {
              prevVolume = v;
              soundFile.setVolume(0);
              muteButton.html('🔊');
            } else {
              soundFile.setVolume(prevVolume || 1);
              muteButton.html('🔈');
            }
          } catch (e) {
            // fallback
            soundFile.setVolume(0);
            muteButton.html('🔊');
          }
        } else {
          // p5.SoundFile may not expose getVolume; keep a mute flag instead
          if (prevVolume > 0) {
            prevVolume = 0;
            soundFile.setVolume(0);
            muteButton.html('🔊');
          } else {
            prevVolume = 1;
            soundFile.setVolume(1);
            muteButton.html('🔈');
          }
        }
      });

      seekSlider = createSlider(0, 1, 0, 0.001);
      seekSlider.position(width / 2 - 50, 30);
      seekSlider.style('width', '300px');
      seekSlider.input(() => {
        if (!soundFile) return;
        isSeeking = true;
        const frac = seekSlider.value();
        const dur = soundFile.duration() || 0;
        const newT = frac * dur;
        try {
          const wasPlaying = soundFile.isPlaying();
          // jump sets position and starts playback; preserve playing state
          soundFile.jump(newT);
          if (!wasPlaying) soundFile.pause();
        } catch (e) {
          // ignore
        }
      });
      seekSlider.changed(() => { isSeeking = false; });
      // ensure default volume and handle end
      try { soundFile.setVolume(prevVolume); } catch(e){}
      try { soundFile.onended(() => { if (playButton) playButton.html('▶'); }); } catch(e){}
    });

    

  } else {
    console.log("Please upload an audio file.");
  }
}