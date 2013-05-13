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
      if(isClear(activePiece, pieceRow, pieceCol-1)) {
        pieceCol -= 1;
      }
    } else if(key == 39) { // right
      if(isClear(activePiece, pieceRow, pieceCol+1)) {
       pieceCol += 1;
      }
    } else if(key == 32) { // space, to drop
      while(isClear(activePiece, pieceRow-1, pieceCol)) {
        movedown();
      }
      finishpiece();
    } else if(key == 40) { // down arrow, go faster
      if(isClear(activePiece, pieceRow-1, pieceCol)) {
        movedown();
      }
    } else if(key == 38) { // up arrow
      var rotated = rotate(activePiece);
      if(isClear(rotated, pieceRow, pieceCol)){
        activePiece = rotated;
      }
    } else {
      return;
    }
    renderboard();
  }
  start();
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
  // TODO: Remove keyboard handlers
  // this is ghetto too, maybe remove the setTimeout so it doesn't tick anymore?
  stopflag = true;
}

// This moves pieces down each drop tick.
function tick() {

  if(isClear(activePiece, pieceRow-1, pieceCol)) {
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

// Is the piece clear at (row, col)?
// used to determine if a piece can drop, move, or rotate
function isClear(piece, row, col) {
  for(var i = 0; i < piece.length; i++) {
    for(var j = 0; j < piece[i].length; j++) {
      if(piece[i][j] !== 0) {
        var r = row+i;
        var c = col+j;
        if(r >= 0 && r < height && c >= 0 && c < width) {
          if(board[r][c]) {
            return false; // existing piece
          }
        } else {
          return false; // Piece outside board
        }
      }
    }
  }
  return true;
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
    var hasZero = false;
    for(var col = 0; col < width; col++) {
      if(board[row][col] === 0) {
        hasZero = true;
        continue;
      }
    }
    if(!hasZero) { // This row is full, remove it.
      for(var i = row; i < height-1; i++) {
        for(var j = 0; j < width; j++) {
          board[i][j] = board[i+1][j];
        }
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
    var rowidx = l - i - 1 - pieceRow;
    if(rowidx < height && rowidx >= 0) { // WTF?
      var thisrow = boardRows[rowidx].children;
      for(var j = 0; j < activePiece[i].length; j++) {
        if(activePiece[i][j]) {
          thisrow[j + pieceCol].className = activePiece[i][j];
        }
      }
    }
  }
}
