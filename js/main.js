function Game() {
  this.players = [];
 
  this.players.push(new Player('local'));
  
  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();

  this.builder = new Builder(this.board, this.players[0]);
}

function Player(type) {
  this.type = type;
  this.wall = [];
  this.cannons = [];
}

Player.prototype.addWall = function (segment) {
  segment.forEach(function(seg){
    this.wall.push({row:seg.row, col:seg.col});
  }.bind(this));
}

function Builder(board, player) {
  this.board = board;
  this.player = player;
  
  this.segmentFunctions = [seg1, seg2, seg3, segL, segLlarge, seg5];
  this.segmentDirection = 0; //N

  this.segmentFunction = this.getRandomSegment();
  this.registerEventHandlers();

}
Builder.prototype.getRandomSegment = function () {
  return this.segmentFunctions[Math.floor(Math.random() * this.segmentFunctions.length)];
}


Builder.prototype.registerEventHandlers = function () {

  $('.land').mouseover(this.moveSegment.bind(this));
  $(window).mousedown(this.click.bind(this));

};

Builder.prototype.moveSegment = function(mouse) {
  var target = getMouseTarget(mouse);
  this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
  this.board.drawSegment(this.segment); 
}

Builder.prototype.click = function(mouse) {
  var target = getMouseTarget(mouse);
  switch(mouse.which) {
    case 1: //left click
      if(this.board.canBuildWall(this.segment)) {
        this.player.addWall(this.segment);
        this.board.drawWalls();
        this.segmentFunction = this.getRandomSegment();
        this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
        this.board.drawSegment(this.segment);
      }
      break;
    case 3:
      this.segmentDirection = (this.segmentDirection + 1 + 4) % 4;  
      this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
      this.board.drawSegment(this.segment);
      break;
  }
  mouse.preventDefault();
}

function Board(players) {
  this.players = players;
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
  if(segment.some(function(seg) {
        return seg.row < 0 || seg.row > this.rows-1 || seg.col<0 || seg.col>this.columns-1;
      }.bind(this))) {
    return;
  }
  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).addClass(seg.type).addClass("segment");
  });
  if(this.canBuildWall(segment)) {
    $(".segment").css('border-color','white');
  } else {

    $(".segment").css('border-color','red');
  }
};

Board.prototype.drawWalls = function () {
  this.players.forEach(function(player){
    player.wall.forEach(function(wallSegment) {
      $(cellSelector(wallSegment.row, wallSegment.col)).addClass("wall");
    })
  })
};

Board.prototype.canBuildWall = function (segment) {
  
  var hasWater = segment.some(function(seg){
    return this.board[seg.row][seg.col].terrain==='water'; 
  }.bind(this));

  var hasWall = segment.some(function(seg){
    return this.players.some(function(player){
      return player.wall.some(function(wallSeg){
        return wallSeg.row===seg.row && wallSeg.col===seg.col;
      })
    })
  }.bind(this));

  return !(hasWater || hasWall);
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