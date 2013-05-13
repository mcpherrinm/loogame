"use strict";

// pfft seperation of concerns.  I'm one man, it's all my concern.
var board;
var boardElt;
var score;
var piece;
var pieceRow;
var pieceCol;
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

  document.onkeyup = function(event) {
    var key = (event || window.event).keyCode;
    if(key == 37) { // left
      if(pieceCol > 0) {
        pieceCol -= 1;
      }
    } else if(key == 39) { // right
      if((pieceCol + pieces[piece][0].length) < width) {
       pieceCol += 1;
      }
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
    var p = pieces[piece];
    for(var i = 0; i < p.length; i++) {
      for(var j = 0; j < p[i].length; j++) {
        if(p[i][j] !== 0) {
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
  var p = pieces[piece];
  for(var i = 0; i < p.length; i++) {
    for(var j = 0; j < p[i].length; j++) {
      if(p[i][j] !== 0) {
        board[pieceRow + i][pieceCol + j] = piece;
      }
    }
  }
}

function newactive() {
  piece = randompiece();
  pieceRow = height-(pieces[piece].length);
  pieceCol = width/2 - Math.ceil(pieces[piece][0].length/2);
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
    for(var col = 0; col < width; col++) {
      var it = board[r][col];
      var clss;
      if(it !== 0) {
        clss = it;
      } else {
        clss = "";
      }
      boardRows[l - r - 1].children[col].className = clss;
    }
  }
  // Render the active piece:
  var p = pieces[piece];
  for(var i = 0; i < p.length; i++) {
    for(var j = 0; j < p[i].length; j++) {
      if(p[i][j] !== 0) {
        boardRows[l - i - 1 - pieceRow].children[j + pieceCol].className = piece;
      }
    }
  }
}
