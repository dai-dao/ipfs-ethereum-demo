import '../stylesheets/app.css'
import { initWeb3, addToIPFS, getImage, showBalance } from './ethereum-link'

// Initialize contract and IPFS
initWeb3();

// The affdex SDK Needs to create video and canvas elements in the DOM
var divRoot = $("#camera")[0];  // div node where we want to add these elements
var width = 640, height = 480;  // camera image size
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter

// Initialize an Affectiva CameraDetector object
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];

// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
  $("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
  if(c.length == 1)
    return c.charCodeAt(0);
  return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
  $("#score").html("Score: " + correct + " / " + total)
}

function setBalance(balance) {
  $("#balance").html("Balance: " + balance)
}

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}
// --- Callback functions ---

// Start button

$('#start').on("click", function () {
  console.log("START PRESSED");

  if (detector && !detector.isRunning) {
    $("#logs").html("");  // clear out previous log
    detector.start();  // start detector
  }
  log('#logs', "Start button pressed");
  showBalance(balance => setBalance(balance))
  Game()
})

// Stop button
$("#stop").on("click", function () {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector

    // Get hash from Ethereum contract and retrieve image from IPFS
    // then display them 
    displayResults();
  }
})

function displayResults() {
  for (var i = 1; i <= correct; i++) {
    var img = $('<img />').attr({
      'id' : 'image' + i,
      'src' : '#',
      'alt' : 'result image',
    }).appendTo('#container')

    var img_tag = document.querySelector( "#image" + i );
    getImage(i, img_tag)
  }
}


// Reset button
$("#reset").on("click", function () {
  log('#logs', "Reset button pressed");
  if (detector && detector.isRunning) {
    detector.reset();
  }
  $('#results').html("");  // clear out results
  $("#logs").html("");  // clear out previous log

  $('div#container > img').remove();
})

// Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
})

// Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
})

// Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
})

// Add a callback to notify when the detector is initialized and ready for running
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");

  Game()
})

// Add a callback to receive the results from processing an image
// NOTE: The faces object contains a list of the faces detected in the image,
//   probabilities for different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  var canvas = $('#face_video_canvas')[0];
  if (!canvas)
    return;

  // Report how many faces were found
  $('#results').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Report desired metrics
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

    // Call functions to draw feature points and dominant emoji (for the first face only)
    drawFeaturePoints(canvas, image, faces[0]);
    drawEmoji(canvas, image, faces[0]);

    if(checkEmoji(faces[0])) {
      // $("#output").attr('src', canvas.toDataURL());
      canvas.toBlob(function(blob) {
        addToIPFS(correct, blob)
      })
      showBalance(balance => setBalance(balance))
    }
  }
});

// Draw the detected facial feature points on the image
function drawFeaturePoints(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');

  // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Fill_and_stroke_styles
  ctx.strokeStyle = 'red';  
  
  // Loop over each feature point in the face
  for (var id in face.featurePoints) {
    var featurePoint = face.featurePoints[id];

    // See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    ctx.beginPath();
    ctx.arc(featurePoint.x, featurePoint.y, 1, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

// Draw the dominant emoji on the image
function drawEmoji(canvas, img, face) {
  // Obtain a 2D context object to draw on the canvas
  var ctx = canvas.getContext('2d');
  ctx.font = '55px serif';
  var anchor = face.featurePoints[0];
  ctx.fillText(face.emojis.dominantEmoji, anchor.x-50, anchor.y-5);

}

var correct = 0;
var total = 0;
var game_emoji = null;
var timer = null;

function updateCorrect() {
  correct += 1;
  // Update score board interactively
  setScore(correct, total);
}

function updateTotal() {
  total += 1;
  // Update score board
  setScore(correct, total); 
}

function ResetEmoji() {
  // Generate random index to choose random emoji
  var id = Math.floor(Math.random() * emojis.length);
  game_emoji = emojis[id];

  // Set new emoji in score board
  setTargetEmoji(game_emoji);
  // Update total score
  updateTotal();

  // Timer, reset new emoji after every 10 seconds
  // This must be recursive because the call to ResetEmoji
  // will always trigger a reset 8 seconds later, creating a
  // continuous loop, always clear the previous timer 
  if (timer != null){
    clearTimeout(timer);
  }

  startTimeout();
}

function startTimeout(){
  timer = setTimeout(function() {
      ResetEmoji();
  }, 10000);
}

function Game() {
  // Re-Initialize all game values, can also be used for reset
  correct = 0;
  total = 0;
  setScore(correct, total);
  ResetEmoji();
}

// Draw the dominant emoji on the image
function checkEmoji(face) {
  var detectedEmoji = face.emojis.dominantEmoji;

  if (toUnicode(detectedEmoji) == game_emoji) {
    // Correct 
    updateCorrect();
    // Reset new emoji
    ResetEmoji();

    return true;
  }

  return false;
}


