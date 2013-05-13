"use strict";

// pfft seperation of concerns.  I'm one man, it's all my concern.
var board;
var boardElt;
var score;
var activePiece;
var pieceRow;
var pieceCol;
var height = 16;
var width = 10;
var stopflag = false;

var pieces = {
  'I': [['I','I','I','I']],
  'J': [['J','J','J'],
        [  0,  0,'J']],
  'L': [['L','L','L'],
        ['L',  0,  0]],
  'O': [['O','O'],
        ['O','O']],
  'S': [[  0,'S','S'],
        ['S','S',  0]],
  'T': [['T','T','T'],
        [  0,'T',  0]],
  'Z': [['Z','Z',  0],
        [  0,'Z','Z']]};

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

  document.onkeyup = function(event) {
    var key = (event || window.event).keyCode;
    if(key == 37) { // left
      if(pieceCol > 0) {
        pieceCol -= 1;
      }
    } else if(key == 39) { // right
      if((pieceCol + activePiece[0].length) < width) {
       pieceCol += 1;
      }
    } else if(key == 32) { // space, to drop
      if(candrop()) { // useful for testing
        movedown();   // instead of hard drop, speed up
      }
    } else if(key == 38) { // up arrow
      rotate();
    } else {
      return;
    }
    renderboard();
  }
}

// Start running the game loop
// Initially, and at restart
function start() {
  console.log("start");
  // New board:
  board=[];
  boardElt = document.getElementById('container');
  boardElt.innerHTML="";
  for(var row = 0; row < height; row++){
    board[row] = [];
    var docRow = document.createElement('div');
    boardElt.appendChild(docRow);
    for(var col = 0; col < width; col++) {
      board[row][col] = 0;
      docRow.appendChild(document.createElement('span'));
    }
  }

  newactive();

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
    console.log("GAME OVER");
  } else {
    window.setTimeout(tick, 1000);
  }
  renderboard();
}

// Does every nonzero element of the current piece have a
// zero below it in the board, at its current height?
function candrop() {
  if(pieceRow > 0) {
    for(var i = 0; i < activePiece.length; i++) {
      for(var j = 0; j < activePiece[i].length; j++) {
        if(activePiece[i][j] !== 0) {
          if(board[pieceRow-1 + i][pieceCol + j]) {
            return false;
          }
        }
      }
    }
    return true;
  }
  return false;
}

// Move the active piece down a row
function movedown() {
  pieceRow -= 1;
}

function finishpiece() {
  mergeactive();
  clearrows();
  testendgame();
  newactive();
}

// Merge the active piece into the board
function mergeactive() {
  for(var i = 0; i < activePiece.length; i++) {
    for(var j = 0; j < activePiece[i].length; j++) {
      if(activePiece[i][j] !== 0) {
        board[pieceRow + i][pieceCol + j] = activePiece[i][j];
      }
    }
  }
}

function rotate(piece) {
  var rotated = [];
  for(var i = 0; i < piece[0].length; i++) {
    rotated.push([]);
  }
  for(var i = piece.length-1; i >= 0; i--) {
    var row = piece[i];
    for(var j = 0; j < row.length; j++) {
      rotated[j].push(row[j]);
    }
  }
  return rotated;
}

function newactive() {
  activePiece = pieces[randompiece()];
  pieceRow = height-(activePiece.length);
  pieceCol = width/2 - Math.ceil(activePiece[0].length/2);
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
        console.log("GAME OVUH");
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

function renderboard() {
  var boardRows = boardElt.children
  var l = boardRows.length;

  for(var r = 0; r < height; r++) {
    var thisrow = boardRows[l - r - 1].children;
    for(var col = 0; col < width; col++) {
      thisrow[col].className = board[r][col];
    }
  }
  // Render the active piece:
  var p = activePiece;
  for(var i = 0; i < activePiece.length; i++) {
    var thisrow = boardRows[l - i - 1 - pieceRow].children;
    for(var j = 0; j < activePiece[i].length; j++) {
      if(activePiece[i][j]) {
        thisrow[j + pieceCol].className = activePiece[i][j];
      }
    }
  }
}
