
let serial; // variable to hold an instance of the serialport library
// let portName = '/dev/tty.usbmodem14601'; // fill in your serial port name here
// let portName = '0'; // fill in your serial port name here

let xPos = 0;
let xPos2 = 0;
let yPos = 0;
let yPos2 = 0;

var socket;

let r, g, b;

let inputSerialPort, button;

function setup() {
  // createCanvas(600, 600);
  createCanvas(windowWidth, windowHeight);
  background(0);

  yPos = height / 2;
  yPos2 = height / 2;
  xPos = width / 2;
  xPos2 = width / 2;

  r = round(random(50, 255));
  g = round(random(0, 255));
  b = round(random(0, 255));

  inputSerialPort = createInput('');
  inputSerialPort.position(width / 2 - 170, 75);
  inputSerialPort.size(300);
  inputSerialPort.value('/dev/tty.usbmodem14601');
  button = createButton('start');
  button.size(40);
  button.position(inputSerialPort.x + inputSerialPort.width, 75);
  button.mousePressed(openSerialPort);

  // socket = io.connect('http://localhost:3000');
  socket = io();
  socket.on('pulse', newPulse);
}

function keyPressed() {
  if (keyCode === ENTER) {
    openSerialPort();
  }
}

function openSerialPort() {
  // console.log(inputSerialPort.value());
  inputSerialPort.value('');
  portName = inputSerialPort.value();
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('list', printList); // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose); // callback for the port closing
  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port
}

function newPulse(data) {
  // console.log(data);
  yPos2 = map(data.clientSignal, 0, 1023, height, 0);
  fill(data.clientR, data.clientG, data.clientB);
  noStroke();
  ellipse(xPos2, yPos2, 5, 5);
  xPos2--;
  if (xPos2 <= 0) {
    xPos2 = width;
    background(0);
  }
}

function draw() {
  textSize(20);
  stroke(200);
  textAlign(CENTER);
  text("serial port name: ", width / 2, 50);

  background(0, 0, 0, 5);
  fill(255);
  noStroke();
  ellipse(xPos, yPos, 5, 5);
  xPos++;
  if (xPos >= width) {
    background(0);
    xPos = 0;
  }
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  const inString = serial.readStringUntil('\r\n');
  if (inString.length > 0) {
    // console.log(inString);
    const sensors = split(inString, ','); // split the string on the commas
    const pulseSignal = sensors[0];
    yPos = map(pulseSignal, 0, 1023, height, 0);

    // console.log("sending:" + pulseSignal);
    var sensorData = {
      clientR: r,
      clientG: g,
      clientB: b,
      clientSignal: pulseSignal
    };
    socket.emit('pulse', sensorData);
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}