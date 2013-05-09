"use strict";

// pfft seperation of concerns.  I'm one man, it's all my concern.
var board;
var boardelt;
var active;
var score;
var piece;
var height = 16;
var width = 10;
var stopflag = false;

var pieces = {
  'I': [[1,1,1,1]],
  'J': [[2,2,2],
        [0,0,2]],
  'L': [[3,3,3],
        [3,0,0]],
  'O': [[4,4],
        [4,4]],
  'S': [[0,5,5],
        [5,5,0]],
  'T': [[6,6,6],
        [0,6,0]],
  'Z': [[7,7,0],
        [0,7,7]]};

///  public interface:

// Called to display initial state, before user presses go
// Once.
function setup() {
  console.log("setup");
  (function() {
    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  })();
}

// Start running the game loop
// Initially, and at restart
function start() {
  console.log("start");
  // New board:
  board=[];
  boardelt = document.getElementById('container');
  for(var row = 0; row < height; row++){
    board[row] = [];
    for(var col = 0; col < width; col++) {
      board[row][col] = 0;
    }
  }

  piece = randompiece();

  score = 0;
  window.setTimeout(tick, 1000);
}

function stop() {
  stopflag = true;
}

// This moves pieces down each drop tick.
function tick() {

  if(candrop()) {
    // drop active piece one row
    movedown();
  } else {
    // Can't drop, so it sticks
    finishpiece();
  }

  // TODO: set tick rate based on game level
  if(stopflag == true) {
    stopflag = false;
  } else {
    window.setTimeout(tick, 1000);
  }
}

// Does every nonzero element of the current piece have a
// zero below it in the board, at its current height?
function candrop() {
  return true;
}

// Move the active piece down a row
function movedown() {
}

function finishpiece() {
  mergeactive();
  clearrows();
  testendgame();
}

// Merge the active piece into the board
function mergeactive() {

}

// Find rows that are full, eliminate, and move down.
// Give points.
function clearrows() {
  for(var row = 0; row < height; row++) {
    var flag = false;
    for(var col = 0; col < width; col++) {
      if(board[row][col] === 0) {
        flag = true;
        continue;
      }
    }
    if(!flag) {
      for(var i = row; i < height-1; i++) {
        board[row] = board[row+1];
      }
      board[height-1] = [];
      for(var col = 0; col < width; col++) {
        board[height-1][col] = 0;
      }
    }
  }
}

// If any pieces are above the high line, game over.
function testendgame() {
  for(var i = 1; i <= 2; i++) {
    for(var j = 0; j < width; j++) {
      if(board[height-i][j] !== 0) {
        // maybe something more here:
        stop();
      }
    }
  }
}

// Pick a random piece.  Probably want to have some state
// like a bag algorithm or something to not be true random
function randompiece() {
  var pns = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  return pns[Math.floor(Math.random()*pns.length)];
}
