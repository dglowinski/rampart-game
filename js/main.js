function Game() {
  this.board = new Board();
  this.board.initBoard();
  this.board.draw();

  this.builder = new Builder(this.board);
}


function Builder(board) {
  this.board = board;
  this.segmentFunctions = [seg1, seg2, seg3, segL, segLlarge];
  this.segmentDirection = 0; //N

  this.segmentFunction = this.getRandomSegment();

  this.registerEventHandlers();



}
Builder.prototype.getRandomSegment = function () {
 // return this.segmentFunctions[4];
  return this.segmentFunctions[Math.floor(Math.random() * this.segmentFunctions.length)];
}


Builder.prototype.registerEventHandlers = function () {

  //mouse over
/*  this.board.board.forEach(function(row, rowIndex){
    row.forEach(function(cell, colIndex){
      
         $(cellSelector(rowIndex, colIndex)).mouseover(this.moveSegment(rowIndex, colIndex));
    }.bind(this)); 
  }.bind(this));*/

  $('.land').mouseover(this.moveSegment.bind(this));
  $(window).mousedown(this.click.bind(this));

};

Builder.prototype.moveSegment = function(mouse) {
  var target = getMouseTarget(mouse);
  var segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
  this.board.drawSegment(segment); 
}

Builder.prototype.click = function(mouse) {
  var target = getMouseTarget(mouse);
  switch(mouse.which) {
    case 1: //left click
      break;
    case 3:
      this.segmentDirection = (this.segmentDirection + 1 + 4) % 4;  
      var segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
      this.board.drawSegment(segment);
      
      break;
  }
  mouse.preventDefault();
}

function Board() {

  this.loadTerrain();

}

Board.prototype.initBoard = function () {
  for(var rowIndex=0; rowIndex<this.rows; rowIndex++) {
    for(var colIndex=0; colIndex<this.columns; colIndex++) {
       $(".container").append($("<div class='cell board'>")
            .attr('data-row', rowIndex)
            .attr('data-column', colIndex));
    }
  }
  $('.cell').contextmenu(function() {
    return false;
});
}

Board.prototype.loadTerrain = function () {
  this.rows = 30;
  this.columns = 50;
  this.board = [];
  for(var rowIndex=0; rowIndex<this.rows; rowIndex++) {
    this.board.push([]);
    for(var colIndex=0; colIndex<this.columns; colIndex++) {
      this.board[rowIndex].push(rowIndex>colIndex ? {terrain:'water'} : {terrain:'land'})
    }
  }
  this.castle = {
    row: 10,
    col: 35
  }
}

Board.prototype.draw = function () {
  this.board.forEach(function(row, rowIndex) {
    row.forEach(function(cell, colIndex){
      var selector = cellSelector(rowIndex, colIndex);
      if(cell.terrain==="land") {
        $(selector).addClass('land');
      }
      if(cell.terrain==="water") {
        $(selector).addClass('water');
      }
      if(rowIndex === this.castle.row && colIndex === this.castle.col) {
        $(selector).append("<img class='castle' src='img/castle.bmp'>");
      }
    }.bind(this));
  }.bind(this));
};

Board.prototype.drawSegment = function (segment) {
  $(".cell").removeClass('seg-single seg-closed-up seg-closed-down seg-closed-left seg-closed-right seg-through-horizontal seg-through-vertical seg-corner-lu seg-corner-ru seg-corner-rd seg-corner-ld');
  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).addClass(seg.type);
  });
};
function cellSelector(row, col) {
  return  "[data-row='"+row+"'][data-column='"+col+"']";
}
function getMouseTarget(mouse) {
    return { row: parseInt($(mouse.target).attr('data-row')),
             col: parseInt($(mouse.target).attr('data-column'))
           };
}


var game = new Game();