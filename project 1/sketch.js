/*** audio reactive drawing tool

1. upload audio file (.mp3, .wav, .m4a)
2. select color 
3. click and drag to draw
4. press b,m,t to change brush size
5. press c to clear canvas

I consulted Chat GPT to debug my handleFile() function + successfully load external audio
For the remaining logic I referenced the p5.js online resources and past projects.
***/

let input; let audio; let fft;

let currentBand = "bass"; 
let strokes = [];

function setup() {
  createCanvas(windowWidth/1.2, windowHeight/1.2);
  background(0);
  input = createFileInput(handleFile);
  input.position(10, 10);
  
  fft = new p5.FFT();

  colorPicker = createColorPicker('white');
  colorPicker.size(50,30);

}


function draw() {
  background(0)
  if (audio) { // mapping frequencies in audio file to different brush thickness 
    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let treble = fft.getEnergy("treble");
    
    let bassSize   = map(bass,   0, 255, 10, 60);
    let midSize    = map(mid,    0, 255, 5, 50);
    let trebleSize = map(treble, 0, 255, 2, 40);
    
    let bamp = fft.getEnergy("bass");
    let bpulse = map(bamp, 0, 255, 0, 40); // bass-driven pulse
    
    let mamp = fft.getEnergy("mid");
    let mpulse = map(mamp, 0, 255, 0, 40); // mid-driven pulse
    
    let tamp = fft.getEnergy("treble");
    let tpulse = map(tamp, 0, 255, 0, 40); // treble-driven pulse

    let brushSize;

    if (currentBand === "bass") {
      brushSize = bassSize * bpulse;
    } else if (currentBand === "mid") {
      brushSize = midSize * mpulse;
    } else {
      brushSize = trebleSize * tpulse;
    }
    
    for (let s of strokes) {
    let energy = fft.getEnergy(s.band);
    let pulse = map(energy, 0, 255, 0, 40);
    let currentSize = s.baseSize + pulse;

    noStroke();
    fill(s.color);
    circle(s.x, s.y, currentSize);
}
    
    if (mouseIsPressed) {
    strokes.push({
        x: mouseX,
        y: mouseY,
        baseSize: 20,
        color: colorPicker.color(),
        band: currentBand
    });
}}}

function keyPressed() { // switch between brush strokes
  if (key === 'B' || key === 'b'){
    currentBand = "bass";
  } else if (key === 'M' || key === 'm'){
    currentBand = "mid";
  } else if (key === 'T' || key === 't'){
    currentBand = "treble";
  } else if (key === 'C' || key === 'c'){ // clear canvas
    background(255, 255, 255, 200);
    strokes = [];
  }
}


function handleFile(file) {
  print(file);

  if (file.type === "audio") {
    if (audio) {
      audio.remove();
      soundFile.stop();
      soundFile = null;
    }
    audio = createAudio(file.data);
    audio.position(10, 50);
    audio.attribute("controls", "");

    soundFile = loadSound(file.data, () => { // user uploaded audio
      console.log("Audio loaded successfully!");
      fft.setInput(soundFile);
    });

    audio.elt.onplay = () => { // controls
      if (!soundFile.isPlaying()) soundFile.loop();
    };
    audio.elt.onpause = () => {
      if (soundFile.isPlaying()) soundFile.pause();
    };
  } else {
    if (audio) {
      audio.remove();
      if (soundFile) soundFile.stop();
      soundFile = null;
    }
    console.log("Please upload an audio file.");
  }
}