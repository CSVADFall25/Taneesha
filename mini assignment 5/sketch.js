//Download serialcontrol app to act as an intermediary to allow p5 to access hardware via serial port: https://github.com/p5-serial/p5.serialcontrol/releases

//This example is modified from the cdn example from the p5.serial github: https://github.com/p5-serial/p5.serialport

// Declare a "SerialPort" object
let serial;
let latestData = "waiting for data";  // you'll use this to write incoming data to the canvas

function setup() {
  background(255)
  createCanvas(1000,1000);

  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  // You should have a callback defined to see the results
  serial.list();

  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("COM3");

  // Here are the callbacks that you can register
  // When we connect to the underlying server
  serial.on('connected', serverConnected);

  // When we get a list of serial ports that are available
  serial.on('list', gotList);
  // OR
  //serial.onList(gotList);

  // When we some data from the serial port
  serial.on('data', gotData);
  // OR
  //serial.onData(gotData);

  // When or if we get an error
  serial.on('error', gotError);
  // OR
  //serial.onError(gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen);
  // OR
  //serial.onOpen(gotOpen);

  serial.on('close', gotClose);

  // Callback to get the raw data, as it comes in for handling yourself
  //serial.on('rawdata', gotRawData);
  // OR
  //serial.onRawData(gotRawData);
  
  
}

// We are connected and ready to go
function serverConnected() {
  print("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
  print("List of Serial Ports:");
  // theList is an array of their names
  for (let i = 0; i < thelist.length; i++) {
    // Display in the console
    print(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  print("Serial Port is Open");
}

function gotClose(){
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

//print error to console
function gotError(theerror) {
  print(theerror);
}

// There is data available to work with from the serial port
function gotData() {
  let currentString = serial.readLine();  // read the incoming string
  trim(currentString);                    // remove any trailing whitespace
  if (!currentString) return;             // if the string is empty, do no more
  console.log(currentString);             // print the string
  latestData = currentString;            // save it for the draw method
}

// We got raw from the serial port
function gotRawData(thedata) {
  print("gotRawData" + thedata);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a string until a specific string is encountered
// serial.readLine() calls readStringUntil with "\r\n" typical linebreak carriage return combination
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer
// serial.write(somevar) writes out the value of somevar to the serial device

function draw() {
  background(255);
  let value = parseFloat(latestData.split(' ')[1]);
  if(value<5){
    fill(201, 201, 255);
  } else if(value<10){
    fill(161, 161, 255);
  } else if(value<15){
    fill(125, 125, 255);
  } else if(value<20){
    fill(99, 99, 255);
  }
    else if(value<50){
    fill(69, 69, 255);
  } else if(value<100){
    fill(51, 51, 255);
  } else if(value<500){
    fill(18, 18, 255);
  }
  else {
    fill(255);
  }
  
  ellipse(width/2, height/2, map(value, 0, 100, 10,300));
  
  fill(0);
  text(latestData, 10, 10);
  
  // Polling method
  
  /*if (serial.available() > 40) {
  let data = serial.read();
  ellipse(50,50,data,data);
}*/

}